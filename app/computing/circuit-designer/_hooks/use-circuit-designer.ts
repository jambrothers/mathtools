import { useState, useRef, useEffect, useCallback, PointerEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHistory } from '@/lib/hooks/use-history';
import {
    CircuitNode,
    Connection,
    DragState,
    WiringState,
    TruthTableData,
    SimulationState,
    ComponentTypeName,
    COMPONENT_TYPES,
    SNAP_GRID,
    generateId,
    DEFAULT_NODES,
    DEFAULT_CONNECTIONS
} from '../constants';
import { circuitURLSerializer } from '../_lib/url-state';
import { generateShareableURL, copyURLToClipboard } from '@/lib/url-state';

export function useCircuitDesigner() {
    const searchParams = useSearchParams();

    // -- State --
    // -- State --
    const {
        state: circuitState,
        pushState,
        updateState,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory
    } = useHistory<{ nodes: CircuitNode[], connections: Connection[] }>({
        nodes: DEFAULT_NODES,
        connections: DEFAULT_CONNECTIONS
    });

    const { nodes, connections } = circuitState;

    const [dragging, setDragging] = useState<DragState | null>(null);
    const [wiring, setWiring] = useState<WiringState | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [truthTable, setTruthTable] = useState<TruthTableData | null>(null);
    const [activeSimulation, setActiveSimulation] = useState<SimulationState>({});
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Multi-select & Trash
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isTrashHovered, setIsTrashHovered] = useState(false);

    // Refs
    const trashRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const hasDraggedRef = useRef(false);
    const dragStartNodesRef = useRef<CircuitNode[]>([]); // To support undoing drags

    // -- Initialization --
    useEffect(() => {
        if (!searchParams || searchParams.toString() === '') return;

        const restored = circuitURLSerializer.deserialize(searchParams);
        if (restored) {
            pushState({
                nodes: restored.nodes,
                connections: restored.connections
            });
            clearHistory(); // Clear history after loading from URL
        }
    }, [searchParams, pushState, clearHistory]);

    // -- Simulation --
    // Topological simulation - propagates signals through the circuit.
    const simulate = useCallback((currentNodes: CircuitNode[] = nodes, currentConnections: Connection[] = connections): SimulationState => {
        const values: SimulationState = {};
        let changed = true;
        let iterations = 0;

        // Initialize inputs
        currentNodes.filter(n => n.type === 'INPUT').forEach(n => {
            values[n.id] = n.state ?? false;
        });

        // Propagate signals (limit iterations to prevent infinite loops)
        while (changed && iterations < 50) {
            changed = false;
            iterations++;

            currentNodes.forEach(node => {
                if (node.type === 'INPUT') return;

                const def = COMPONENT_TYPES[node.type];
                const nodeInputs: boolean[] = [];

                // Gather inputs for this node
                for (let i = 0; i < def.inputs; i++) {
                    const conn = currentConnections.find(c => c.to === node.id && c.inputIndex === i);
                    if (conn && values[conn.from] !== undefined) {
                        nodeInputs[i] = values[conn.from];
                    } else {
                        nodeInputs[i] = false;
                    }
                }

                const newValue = def.evaluate(nodeInputs, node.state);

                if (values[node.id] !== newValue) {
                    values[node.id] = newValue;
                    changed = true;
                }
            });
        }
        return values;
    }, [nodes, connections]);

    // Run simulation whenever graph changes
    useEffect(() => {
        const results = simulate();
        setActiveSimulation(results);
    }, [nodes, connections, simulate]);


    // -- Event Handlers --

    const handlePointerDownNode = (e: PointerEvent<HTMLDivElement>, id: string) => {
        e.stopPropagation();

        let newSelected = new Set(selectedIds);

        if (e.shiftKey) {
            // Toggle selection
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
        } else {
            // If clicking an unselected node without shift, select ONLY that node.
            // If dragging a selected node, keep selection (to allow moving group).
            if (!newSelected.has(id)) {
                newSelected = new Set([id]);
            }
        }

        setSelectedIds(newSelected);

        const node = nodes.find(n => n.id === id);
        if (!node) return;

        // Capture start nodes for undo
        dragStartNodesRef.current = nodes;

        // Capture start positions of ALL selected nodes for group drag
        const nodeStartPositions: Record<string, { x: number; y: number }> = {};
        nodes.forEach(n => {
            if (newSelected.has(n.id)) {
                nodeStartPositions[n.id] = { x: n.x, y: n.y };
            }
        });

        setDragging({
            id,
            startX: e.clientX,
            startY: e.clientY,
            nodeStartX: node.x,
            nodeStartY: node.y,
            nodeStartPositions
        });
        hasDraggedRef.current = false; // Reset on drag start
    };

    // Global Mouse Listeners for Dragging & Wiring
    useEffect(() => {
        if (!dragging && !wiring) return;

        const handleWindowPointerMove = (e: globalThis.PointerEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePos({ x, y });

            if (dragging && dragging.nodeStartPositions) {
                const dx = e.clientX - dragging.startX;
                const dy = e.clientY - dragging.startY;

                // Move all nodes that have stored start positions
                updateState(prev => ({
                    ...prev,
                    nodes: prev.nodes.map(n => {
                        const startPos = dragging.nodeStartPositions![n.id];
                        if (startPos) {
                            let newX = startPos.x + dx;
                            let newY = startPos.y + dy;

                            // Snap to grid
                            newX = Math.round(newX / SNAP_GRID) * SNAP_GRID;
                            newY = Math.round(newY / SNAP_GRID) * SNAP_GRID;

                            return { ...n, x: newX, y: newY };
                        }
                        return n;
                    })
                }));

                // Mark as actually dragged if moved more than 5px
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    hasDraggedRef.current = true;
                }
            }

            // Trash Detection
            if (dragging && trashRef.current) {
                const trashRect = trashRef.current.getBoundingClientRect();
                const isOver = (
                    e.clientX >= trashRect.left &&
                    e.clientX <= trashRect.right &&
                    e.clientY >= trashRect.top &&
                    e.clientY <= trashRect.bottom
                );
                setIsTrashHovered(isOver);
            }
        };

        const handleWindowPointerUp = () => {
            // Trash Detection & Deletion
            if (isTrashHovered && dragging) {
                // Delete all selected nodes AND the dragged node (if not selected)
                const idsToDelete = new Set(selectedIds);
                idsToDelete.add(dragging.id);

                pushState(prev => ({
                    nodes: prev.nodes.filter(n => !idsToDelete.has(n.id)),
                    connections: prev.connections.filter(c => !idsToDelete.has(c.from) && !idsToDelete.has(c.to))
                }));

                // Clear selection
                setSelectedIds(new Set());
                setIsTrashHovered(false);
            }
            // If just finished dragging without deletion, commit the drag to history
            else if (dragging && hasDraggedRef.current) {
                // Push the current state (which has final positions) to history
                // Provide the state BEFORE drag as the undo restore point
                pushState(
                    { nodes, connections }, // Current state is the "new" state
                    { nodes: dragStartNodesRef.current, connections } // Previous state was nodes at start + SAME connections
                );
            }

            setDragging(null);
            setWiring(null);
        };

        window.addEventListener('pointermove', handleWindowPointerMove);
        window.addEventListener('pointerup', handleWindowPointerUp);

        return () => {
            window.removeEventListener('pointermove', handleWindowPointerMove);
            window.removeEventListener('pointerup', handleWindowPointerUp);
        };
    }, [dragging, wiring, isTrashHovered, selectedIds, nodes, connections]); // dependencies updated to be safe

    const toggleInput = (e: PointerEvent<HTMLDivElement>, id: string) => {
        // Don't toggle if we just finished dragging
        if (hasDraggedRef.current) {
            hasDraggedRef.current = false;
            return;
        }
        e.stopPropagation();
        pushState(prev => ({
            ...prev,
            nodes: prev.nodes.map(n => n.id === id ? { ...n, state: !n.state } : n)
        }));
    };

    const startWiring = (e: PointerEvent<HTMLDivElement>, nodeId: string) => {
        e.stopPropagation();
        setWiring({ nodeId, portType: 'output' });
    };

    const completeWiring = (e: PointerEvent<HTMLDivElement>, targetNodeId: string, inputIndex: number) => {
        e.stopPropagation();
        if (!wiring) return;
        if (wiring.nodeId === targetNodeId) return;

        // Remove existing connection to this specific input port
        const cleanConnections = connections.filter(c => !(c.to === targetNodeId && c.inputIndex === inputIndex));

        setWiring(null);

        pushState(prev => ({
            ...prev,
            connections: [
                ...cleanConnections,
                {
                    id: generateId(),
                    from: wiring.nodeId,
                    to: targetNodeId,
                    inputIndex
                }
            ]
        }));
    };

    const getNextSwitchLabel = (currentNodes: CircuitNode[]): string => {
        const switchNodes = currentNodes.filter(n => n.type === 'INPUT');
        const usedLabels = new Set(switchNodes.map(n => n.label));
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            if (!usedLabels.has(letter)) return letter;
        }
        return `S${switchNodes.length + 1}`;
    };

    const addNode = (type: ComponentTypeName) => {
        console.log(`[DEBUG] addNode called with type: ${type}`);
        const id = generateId();
        const offset = (nodes.length % 10) * 20;

        let label: string;
        if (type === 'INPUT') {
            label = getNextSwitchLabel(nodes);
        } else if (type === 'OUTPUT') {
            label = `Out ${nodes.filter(n => n.type === 'OUTPUT').length + 1}`;
        } else {
            label = type;
        }

        pushState(prev => ({
            ...prev,
            nodes: [...prev.nodes, {
                id,
                type,
                x: 200 + offset,
                y: 150 + offset,
                state: false,
                label
            }]
        }));
    };

    const addNodeAtPosition = (type: ComponentTypeName, x: number, y: number) => {
        const id = generateId();

        // Label logic duplicated from addNode (could be extracted)
        let label: string;
        if (type === 'INPUT') {
            label = getNextSwitchLabel(nodes);
        } else if (type === 'OUTPUT') {
            label = `Out ${nodes.filter(n => n.type === 'OUTPUT').length + 1}`;
        } else {
            label = type;
        }

        const snappedX = Math.round(x / SNAP_GRID) * SNAP_GRID;
        const snappedY = Math.round(y / SNAP_GRID) * SNAP_GRID;

        pushState(prev => ({
            ...prev,
            nodes: [...prev.nodes, {
                id,
                type,
                x: snappedX,
                y: snappedY,
                state: false,
                label
            }]
        }));
    };

    const clearCanvas = () => setShowClearConfirm(true);

    const confirmClear = () => {
        pushState({
            nodes: [],
            connections: []
        });
        setSelectedIds(new Set());
        setShowClearConfirm(false);
    };

    const cancelClear = () => setShowClearConfirm(false);

    // Marquee Selection
    const handleMarqueeSelect = (rect: DOMRect) => {
        const newSelected = new Set(selectedIds);

        nodes.forEach(node => {
            const nodeW = 60;
            const nodeH = 60;
            const nodeL = node.x - nodeW / 2;
            const nodeR = node.x + nodeW / 2;
            const nodeT = node.y - nodeH / 2;
            const nodeB = node.y + nodeH / 2;

            const selL = rect.x;
            const selR = rect.x + rect.width;
            const selT = rect.y;
            const selB = rect.y + rect.height;

            const overlaps = !(nodeR < selL || nodeL > selR || nodeB < selT || nodeT > selB);

            if (overlaps) {
                newSelected.add(node.id);
            }
        });

        setSelectedIds(newSelected);
    };

    const generateTruthTable = () => {
        const inputs = nodes.filter(n => n.type === 'INPUT').sort((a, b) => a.y - b.y);
        const outputs = nodes.filter(n => n.type === 'OUTPUT').sort((a, b) => a.y - b.y);

        if (inputs.length === 0 || outputs.length === 0) {
            alert("You need at least one Input (Switch) and one Output (Bulb).");
            return;
        }

        const rows = [];
        const numCombinations = Math.pow(2, inputs.length);

        for (let i = 0; i < numCombinations; i++) {
            const tempNodes = nodes.map(n => {
                if (n.type !== 'INPUT') return n;
                const index = inputs.findIndex(inp => inp.id === n.id);
                const bit = (i >> (inputs.length - 1 - index)) & 1;
                return { ...n, state: !!bit };
            });

            const result = simulate(tempNodes, connections);

            const rowData = {
                inputs: inputs.map(inp => {
                    const tempNode = tempNodes.find(t => t.id === inp.id);
                    return tempNode?.state ? 1 : 0;
                }),
                outputs: outputs.map(out => (result[out.id] ? 1 : 0))
            };
            rows.push(rowData);
        }

        setTruthTable({ inputs, outputs, rows });
    };

    const loadDemo = (type: 'AND' | 'OR' | 'NOT' | 'XOR') => {
        setSelectedIds(new Set());
        setWiring(null);

        const id1 = generateId();
        const id2 = generateId();
        const gateId = generateId();
        const outId = generateId();

        const newNodes: CircuitNode[] = [];
        const newConnections: Connection[] = [];

        if (type === 'NOT') {
            newNodes.push(
                { id: id1, type: 'INPUT', x: 100, y: 150, label: 'A', state: false },
                { id: gateId, type: 'NOT', x: 300, y: 150, label: 'NOT' },
                { id: outId, type: 'OUTPUT', x: 500, y: 150, label: 'Out' }
            );
            newConnections.push(
                { id: generateId(), from: id1, to: gateId, inputIndex: 0 },
                { id: generateId(), from: gateId, to: outId, inputIndex: 0 }
            );
        } else {
            newNodes.push(
                { id: id1, type: 'INPUT', x: 100, y: 100, label: 'A', state: false },
                { id: id2, type: 'INPUT', x: 100, y: 200, label: 'B', state: false },
                { id: gateId, type: type, x: 300, y: 150, label: type },
                { id: outId, type: 'OUTPUT', x: 500, y: 150, label: 'Out' }
            );
            newConnections.push(
                { id: generateId(), from: id1, to: gateId, inputIndex: 0 },
                { id: generateId(), from: id2, to: gateId, inputIndex: 1 },
                { id: generateId(), from: gateId, to: outId, inputIndex: 0 }
            );
        }

        // Create new state object
        pushState({
            nodes: newNodes,
            connections: newConnections
        });
    };

    const handleCopyLink = async () => {
        const url = generateShareableURL(
            circuitURLSerializer,
            { nodes, connections }
        );
        await copyURLToClipboard(url);
    };

    // Helper for rendering
    const getWiringSourceNode = (): CircuitNode | undefined => {
        if (!wiring) return undefined;
        return nodes.find(n => n.id === wiring.nodeId);
    };

    return {
        // State
        nodes,
        connections,
        dragging,
        wiring,
        mousePos,
        truthTable,
        activeSimulation,
        showClearConfirm,
        selectedIds,
        isTrashHovered,

        // Refs
        trashRef,
        canvasRef,

        // Setters (if needed directly)
        setTruthTable,
        setSelectedIds,

        // Handlers
        handlePointerDownNode,
        toggleInput,
        startWiring,
        completeWiring,
        addNode,
        addNodeAtPosition,
        clearCanvas,
        confirmClear,
        cancelClear,
        handleMarqueeSelect,
        generateTruthTable,
        loadDemo,
        handleCopyLink,
        getWiringSourceNode,

        // History
        undo,
        redo,
        canUndo,
        canRedo
    };
}
