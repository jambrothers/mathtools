"use client"

import React, { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import { useTheme } from 'next-themes';
import { SetPageTitle } from "@/components/set-page-title";
import { ConfirmationModal } from './_components/confirmation-modal';
import { Canvas } from '@/components/tool-ui/canvas';
import { TrashZone } from '@/components/tool-ui/trash-zone';
import { CircuitToolbar } from './_components/circuit-toolbar';
import { CircuitSidebar } from './_components/circuit-sidebar';
import { CircuitNodeComponent } from './_components/circuit-node';
import { TruthTableModal } from './_components/truth-table-modal';


import { useSearchParams, useRouter } from 'next/navigation';
import { generateShareableURL, copyURLToClipboard } from '@/lib/url-state';
import { circuitURLSerializer } from './_lib/url-state';
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
    getPortPosition,
    getWirePath,
    DEFAULT_NODES,
    DEFAULT_CONNECTIONS
} from './constants';

/**
 * LOGIC CIRCUIT DESIGNER
 * A complete drag-and-drop logic simulator with truth table generation.
 */
export default function LogicSimulator() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const searchParams = useSearchParams();
    const router = useRouter();

    const [nodes, setNodes] = useState<CircuitNode[]>(DEFAULT_NODES);
    const [connections, setConnections] = useState<Connection[]>(DEFAULT_CONNECTIONS);
    const [dragging, setDragging] = useState<DragState | null>(null);
    const [wiring, setWiring] = useState<WiringState | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [truthTable, setTruthTable] = useState<TruthTableData | null>(null);
    const [activeSimulation, setActiveSimulation] = useState<SimulationState>({});
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Load state from URL on mount
    useEffect(() => {
        if (!searchParams || searchParams.toString() === '') return;

        const restored = circuitURLSerializer.deserialize(searchParams);
        if (restored) {
            setNodes(restored.nodes);
            setConnections(restored.connections);
        }
    }, [searchParams]);

    // New State for Multi-Select & Drag-to-Delete
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isTrashHovered, setIsTrashHovered] = useState(false);
    const trashRef = useRef<HTMLDivElement>(null);
    const hasDraggedRef = useRef(false); // Track if actual dragging occurred (to prevent click actions)

    const canvasRef = useRef<HTMLDivElement>(null);

    // --- Simulation Logic ---

    /**
     * Topological simulation - propagates signals through the circuit.
     */
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

    // --- Interaction Handlers ---

    // --- Interaction Handlers ---

    const handleMouseDownNode = (e: MouseEvent<HTMLDivElement>, id: string) => {
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

    // --- Window-level Drag Listeners ---
    // These are attached only when dragging or wiring to avoid overriding Canvas's internal marquee handlers.
    useEffect(() => {
        if (!dragging && !wiring) return;

        const handleWindowMouseMove = (e: globalThis.MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePos({ x, y });

            if (dragging && dragging.nodeStartPositions) {
                const dx = e.clientX - dragging.startX;
                const dy = e.clientY - dragging.startY;

                // Move all nodes that have stored start positions
                setNodes(prev => prev.map(n => {
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

        const handleWindowMouseUp = () => {
            // Trash Detection & Deletion
            if (isTrashHovered && dragging) {
                // Delete all selected nodes AND the dragged node (if not selected)
                const idsToDelete = new Set(selectedIds);
                idsToDelete.add(dragging.id);

                setNodes(prev => prev.filter(n => !idsToDelete.has(n.id)));
                setConnections(prev => prev.filter(c => !idsToDelete.has(c.from) && !idsToDelete.has(c.to)));

                // Clear selection
                setSelectedIds(new Set());
                setIsTrashHovered(false);
            }

            setDragging(null);
            setWiring(null);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [dragging, wiring, isTrashHovered, selectedIds]);


    const toggleInput = (e: MouseEvent<HTMLDivElement>, id: string) => {
        // Don't toggle if we just finished dragging
        if (hasDraggedRef.current) {
            hasDraggedRef.current = false;
            return;
        }
        e.stopPropagation();
        setNodes(prev => prev.map(n => n.id === id ? { ...n, state: !n.state } : n));
    };

    const startWiring = (e: MouseEvent<HTMLDivElement>, nodeId: string) => {
        e.stopPropagation();
        setWiring({ nodeId, portType: 'output' });
    };

    const completeWiring = (e: MouseEvent<HTMLDivElement>, targetNodeId: string, inputIndex: number) => {
        e.stopPropagation();
        if (!wiring) return;
        if (wiring.nodeId === targetNodeId) return;

        // Remove existing connection to this specific input port
        const cleanConnections = connections.filter(c => !(c.to === targetNodeId && c.inputIndex === inputIndex));

        setConnections([
            ...cleanConnections,
            {
                id: generateId(),
                from: wiring.nodeId,
                to: targetNodeId,
                inputIndex
            }
        ]);
        setWiring(null);
    };

    const deleteNode = (id: string) => {
        setNodes(prev => prev.filter(n => n.id !== id));
        setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    };

    const getNextSwitchLabel = (currentNodes: CircuitNode[]): string => {
        const switchNodes = currentNodes.filter(n => n.type === 'INPUT');
        // Find the first missing letter or append
        // Simple strategy: 'A', 'B', 'C'... based on index.
        // But if I delete 'B', next one should be 'B' ideally? 
        // Or just Count + 1?
        // User requested: "Switches should always be named A, B, C, D etc by default"
        // Let's use a robust approach: Find first unused letter A-Z.
        const usedLabels = new Set(switchNodes.map(n => n.label));
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            if (!usedLabels.has(letter)) return letter;
        }
        return `S${switchNodes.length + 1}`; // Fallback
    };

    const addNode = (type: ComponentTypeName) => {
        const id = generateId();
        const offset = (nodes.length % 10) * 20;
        // Logic to stagger positions so they don't pile up exactly

        let label: string;
        if (type === 'INPUT') {
            label = getNextSwitchLabel(nodes);
        } else if (type === 'OUTPUT') {
            label = `Out ${nodes.filter(n => n.type === 'OUTPUT').length + 1}`;
        } else {
            label = type;
        }

        setNodes([...nodes, {
            id,
            type,
            x: 200 + offset,
            y: 150 + offset,
            state: false,
            label
        }]);
    };

    const clearCanvas = () => {
        setShowClearConfirm(true);
    };

    const confirmClear = () => {
        setNodes([]);
        setConnections([]);
        setSelectedIds(new Set());
        setShowClearConfirm(false);
    };

    // Marquee Selection
    const handleMarqueeSelect = (rect: DOMRect) => {
        const newSelected = new Set(selectedIds);

        nodes.forEach(node => {
            // Check intersection (node is approx 60x60 centered)
            // Canvas coords
            if (!canvasRef.current) return;
            // The rect comes from canvas component roughly in client coords? 
            // Canvas.tsx sends rect relative to itself?
            // Checking Canvas.tsx:
            // `onSelectionEnd(new DOMRect(x, y, width, height))` where x,y are relative to canvas container.
            // CircuitNode x,y are Center coordinates.

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

            // Check overlap
            const overlaps = !(nodeR < selL || nodeL > selR || nodeB < selT || nodeT > selB);

            if (overlaps) {
                newSelected.add(node.id);
            }
        });

        setSelectedIds(newSelected);
    };


    // --- Truth Table Generator ---

    const generateTruthTable = () => {
        const inputs = nodes.filter(n => n.type === 'INPUT').sort((a, b) => a.y - b.y);
        const outputs = nodes.filter(n => n.type === 'OUTPUT').sort((a, b) => a.y - b.y);

        if (inputs.length === 0 || outputs.length === 0) {
            alert("You need at least one Input (Switch) and one Output (Bulb).");
            return;
        }

        const rows: { inputs: number[]; outputs: number[] }[] = [];
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

    // --- Render Helpers ---

    const getWiringSourceNode = (): CircuitNode | undefined => {
        if (!wiring) return undefined;
        return nodes.find(n => n.id === wiring.nodeId);
    };

    const loadDemo = (type: 'AND' | 'OR' | 'NOT' | 'XOR') => {
        // Clear and preset
        setNodes([]);
        setConnections([]);
        setSelectedIds(new Set());
        setWiring(null);

        const id1 = generateId();
        const id2 = generateId();
        const gateId = generateId();
        const outId = generateId();

        const newNodes: CircuitNode[] = [];
        const newConnections: Connection[] = [];

        if (type === 'NOT') {
            // 1 Input, 1 Gate, 1 Output
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
            // 2 Inputs, 1 Gate, 1 Output
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

        setNodes(newNodes);
        setConnections(newConnections);
    };

    const handleCopyLink = async () => {
        const url = generateShareableURL(
            circuitURLSerializer,
            { nodes, connections }
        );
        copyURLToClipboard(url);
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full">
            <SetPageTitle title="Circuit Designer" />

            {/* Toolbar */}
            <CircuitToolbar
                onClear={clearCanvas}
                onGenerateTruthTable={generateTruthTable}
                onLoadDemo={loadDemo}
                onCopyLink={handleCopyLink}
            />

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <CircuitSidebar onAddNode={addNode} />

                {/* Canvas Area */}
                <Canvas
                    ref={canvasRef}
                    className="flex-1 relative bg-slate-50 dark:bg-slate-950 overflow-hidden cursor-crosshair"
                    onClick={() => setSelectedIds(new Set())}
                    onSelectionEnd={handleMarqueeSelect}
                >

                    {/* Grid Background */}
                    <div
                        className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: isDark
                                ? 'radial-gradient(#6366f1 1px, transparent 1px)'
                                : 'radial-gradient(#94a3b8 1px, transparent 1px)',
                            backgroundSize: `${SNAP_GRID}px ${SNAP_GRID}px`
                        }}
                    />

                    {/* Connection Layer (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                        {/* Existing Connections */}
                        {connections.map(conn => {
                            const sourceNode = nodes.find(n => n.id === conn.from);
                            const targetNode = nodes.find(n => n.id === conn.to);
                            if (!sourceNode || !targetNode) return null;

                            const sourcePos = getPortPosition(sourceNode.type, 'output', 0);
                            const targetPos = getPortPosition(targetNode.type, 'input', conn.inputIndex);

                            const x1 = sourceNode.x + sourcePos.x;
                            const y1 = sourceNode.y + sourcePos.y;
                            const x2 = targetNode.x + targetPos.x;
                            const y2 = targetNode.y + targetPos.y;

                            const isActive = activeSimulation[sourceNode.id];

                            return (
                                <path
                                    key={conn.id}
                                    d={getWirePath(x1, y1, x2, y2)}
                                    stroke={isActive ? '#22c55e' : (isDark ? '#475569' : '#94a3b8')}
                                    strokeWidth="3"
                                    fill="none"
                                    className="transition-colors duration-150"
                                />
                            );
                        })}

                        {/* Active Drawing Wire */}
                        {wiring && (() => {
                            const sourceNode = getWiringSourceNode();
                            if (!sourceNode) return null;
                            const sourcePos = getPortPosition(sourceNode.type, 'output', 0);
                            return (
                                <path
                                    d={getWirePath(
                                        sourceNode.x + sourcePos.x,
                                        sourceNode.y + sourcePos.y,
                                        mousePos.x,
                                        mousePos.y
                                    )}
                                    stroke="#6366f1"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    fill="none"
                                    className="opacity-70"
                                />
                            );
                        })()}
                    </svg>

                    {/* Nodes Layer */}
                    {nodes.map(node => (
                        <CircuitNodeComponent
                            key={node.id}
                            node={node}
                            isActive={activeSimulation[node.id] ?? false}
                            isDark={isDark}
                            isSelected={selectedIds.has(node.id)}
                            onMouseDown={handleMouseDownNode}
                            onClick={toggleInput}
                            // onDelete={deleteNode} // Removed per requirements (drag to bin only)
                            onStartWiring={startWiring}
                            onCompleteWiring={completeWiring}
                        />
                    ))}


                    <TrashZone ref={trashRef} isHovered={isTrashHovered} />
                </Canvas>

            </div>

            {/* Truth Table Modal */}
            {truthTable && (
                <TruthTableModal
                    data={truthTable}
                    onClose={() => setTruthTable(null)}
                    onRefresh={generateTruthTable}
                />
            )}

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <ConfirmationModal
                    title="Clear Circuit?"
                    message="This will remove all components and connections from the canvas. This action cannot be undone."
                    confirmLabel="Clear Everything"
                    onConfirm={confirmClear}
                    onCancel={() => setShowClearConfirm(false)}
                />
            )}
        </div>
    );
}