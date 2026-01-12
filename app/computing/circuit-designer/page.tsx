import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Trash2, Play, Table, Zap, RefreshCw, X } from 'lucide-react';

/**
 * LOGIC CIRCUIT DESIGNER
 * A complete drag-and-drop logic simulator with truth table generation.
 */

// --- Constants & Config ---

const GATE_SIZE = 60;
const PORT_RADIUS = 6;
const SNAP_GRID = 20;

// Gate Definitions (Shapes & Logic)
const COMPONENT_TYPES = {
    INPUT: {
        type: 'INPUT',
        label: 'Switch',
        inputs: 0,
        outputs: 1,
        color: 'bg-yellow-500',
        evaluate: (inputs, state) => state, // State holds the boolean value
        render: (active) => (
            <div className={`w-12 h-12 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${active ? 'bg-green-500 border-green-300 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-slate-700 border-slate-500'}`}>
                <div className={`w-4 h-8 rounded-sm border ${active ? 'bg-white border-green-200 translate-y-[-2px]' : 'bg-slate-800 border-slate-600 translate-y-[2px]'} transition-transform`}></div>
            </div>
        )
    },
    OUTPUT: {
        type: 'OUTPUT',
        label: 'Bulb',
        inputs: 1,
        outputs: 0,
        color: 'bg-blue-500',
        evaluate: (inputs) => inputs[0] || false,
        render: (active) => (
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${active ? 'bg-yellow-300 border-yellow-500 shadow-[0_0_30px_rgba(253,224,71,0.8)] scale-110' : 'bg-slate-800 border-slate-600'}`}>
                <Zap size={20} className={active ? 'text-yellow-600' : 'text-slate-600'} fill={active ? "currentColor" : "none"} />
            </div>
        )
    },
    AND: {
        type: 'AND',
        label: 'AND',
        inputs: 2,
        outputs: 1,
        color: 'bg-indigo-600',
        evaluate: (inputs) => inputs[0] && inputs[1],
        render: () => (
            <svg width="50" height="50" viewBox="0 0 50 50" className="fill-slate-800 stroke-indigo-400 stroke-2">
                <path d="M 10 5 L 25 5 C 38 5 38 45 25 45 L 10 45 Z" />
            </svg>
        )
    },
    OR: {
        type: 'OR',
        label: 'OR',
        inputs: 2,
        outputs: 1,
        color: 'bg-purple-600',
        evaluate: (inputs) => inputs[0] || inputs[1],
        render: () => (
            <svg width="50" height="50" viewBox="0 0 50 50" className="fill-slate-800 stroke-purple-400 stroke-2">
                <path d="M 5 5 C 5 5 15 5 20 5 C 35 5 42 25 42 25 C 42 25 35 45 20 45 C 15 45 5 45 5 45 C 15 25 15 25 5 5 Z" />
            </svg>
        )
    },
    NOT: {
        type: 'NOT',
        label: 'NOT',
        inputs: 1,
        outputs: 1,
        color: 'bg-rose-600',
        evaluate: (inputs) => !inputs[0],
        render: () => (
            <svg width="50" height="50" viewBox="0 0 50 50" className="fill-slate-800 stroke-rose-400 stroke-2">
                <path d="M 10 5 L 40 25 L 10 45 Z" />
                <circle cx="43" cy="25" r="3" className="fill-slate-800" />
            </svg>
        )
    },
    XOR: {
        type: 'XOR',
        label: 'XOR',
        inputs: 2,
        outputs: 1,
        color: 'bg-cyan-600',
        evaluate: (inputs) => (inputs[0] || inputs[1]) && !(inputs[0] && inputs[1]),
        render: () => (
            <svg width="50" height="50" viewBox="0 0 50 50" className="fill-slate-800 stroke-cyan-400 stroke-2">
                <path d="M 10 5 C 10 5 20 5 25 5 C 40 5 47 25 47 25 C 47 25 40 45 25 45 C 20 45 10 45 10 45 C 20 25 20 25 10 5 Z" />
                <path d="M 4 5 C 14 25 14 25 4 45" fill="none" />
            </svg>
        )
    }
};

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);

// Calculate port position relative to node center
const getPortPosition = (nodeType, portType, index) => {
    const def = COMPONENT_TYPES[nodeType];
    const width = 60;
    const height = 60;

    if (portType === 'input') {
        // Distribute inputs evenly on the left
        const step = height / (def.inputs + 1);
        return { x: -width / 2, y: -height / 2 + step * (index + 1) };
    } else {
        // Output on the right
        return { x: width / 2, y: 0 };
    }
};

// --- Main Component ---

export default function LogicSimulator() {
    const [nodes, setNodes] = useState([
        { id: 'start_1', type: 'INPUT', x: 100, y: 100, label: 'A', state: false },
        { id: 'start_2', type: 'INPUT', x: 100, y: 250, label: 'B', state: false },
        { id: 'gate_1', type: 'AND', x: 300, y: 175, label: 'AND' },
        { id: 'out_1', type: 'OUTPUT', x: 500, y: 175, label: 'Out' },
    ]);

    const [connections, setConnections] = useState([
        { id: 'c1', from: 'start_1', to: 'gate_1', inputIndex: 0 },
        { id: 'c2', from: 'start_2', to: 'gate_1', inputIndex: 1 },
        { id: 'c3', from: 'gate_1', to: 'out_1', inputIndex: 0 },
    ]);

    const [dragging, setDragging] = useState(null); // { id, startX, startY, nodeStartX, nodeStartY }
    const [wiring, setWiring] = useState(null); // { nodeId, portType: 'output' }
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [truthTable, setTruthTable] = useState(null);
    const [activeSimulation, setActiveSimulation] = useState({}); // Map of nodeID -> outputValue (boolean)
    const canvasRef = useRef(null);

    // --- Simulation Logic ---

    // Topological simulation
    const simulate = useCallback((currentNodes = nodes, currentConnections = connections) => {
        const values = {};
        let changed = true;
        let iterations = 0;

        // Initialize inputs
        currentNodes.filter(n => n.type === 'INPUT').forEach(n => {
            values[n.id] = n.state;
        });

        // Propagate signals (limit iterations to prevent infinite loops in cyclic graphs)
        while (changed && iterations < 50) {
            changed = false;
            iterations++;

            currentNodes.forEach(node => {
                if (node.type === 'INPUT') return;

                const def = COMPONENT_TYPES[node.type];
                const nodeInputs = [];

                // Gather inputs for this node
                for (let i = 0; i < def.inputs; i++) {
                    const conn = currentConnections.find(c => c.to === node.id && c.inputIndex === i);
                    if (conn && values[conn.from] !== undefined) {
                        nodeInputs[i] = values[conn.from];
                    } else {
                        nodeInputs[i] = false; // Default to low
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

    const handleMouseDownNode = (e, id) => {
        e.stopPropagation();
        const node = nodes.find(n => n.id === id);
        setDragging({
            id,
            startX: e.clientX,
            startY: e.clientY,
            nodeStartX: node.x,
            nodeStartY: node.y
        });
    };

    const handleMouseMove = (e) => {
        // Update mouse pos for drawing temp wire
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });

        if (dragging) {
            const dx = e.clientX - dragging.startX;
            const dy = e.clientY - dragging.startY;

            let newX = dragging.nodeStartX + dx;
            let newY = dragging.nodeStartY + dy;

            // Snap to grid
            newX = Math.round(newX / SNAP_GRID) * SNAP_GRID;
            newY = Math.round(newY / SNAP_GRID) * SNAP_GRID;

            setNodes(prev => prev.map(n => n.id === dragging.id ? { ...n, x: newX, y: newY } : n));
        }
    };

    const handleMouseUp = () => {
        setDragging(null);
        setWiring(null);
    };

    const toggleInput = (e, id) => {
        if (dragging) return; // Don't toggle if we just dragged
        e.stopPropagation();
        setNodes(prev => prev.map(n => n.id === id ? { ...n, state: !n.state } : n));
    };

    const startWiring = (e, nodeId) => {
        e.stopPropagation();
        setWiring({ nodeId, portType: 'output' });
    };

    const completeWiring = (e, targetNodeId, inputIndex) => {
        e.stopPropagation();
        if (!wiring) return;
        if (wiring.nodeId === targetNodeId) return; // Prevent self-loop if desired (though some flip flops need it)

        // Remove existing connection to this specific input port if any
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

    const deleteNode = (id) => {
        setNodes(prev => prev.filter(n => n.id !== id));
        setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    };

    const addNode = (type) => {
        const id = generateId();
        // find a safe spot
        const offset = nodes.length * 20;
        setNodes([...nodes, {
            id,
            type,
            x: 100 + offset,
            y: 100 + offset,
            state: false,
            label: type === 'INPUT' ? `In ${nodes.filter(n => n.type === 'INPUT').length + 1}` : type
        }]);
    };

    const clearCanvas = () => {
        if (confirm("Clear all nodes?")) {
            setNodes([]);
            setConnections([]);
        }
    };

    // --- Truth Table Generator ---

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
            // 1. Set Input States for this combination
            const tempNodes = nodes.map(n => {
                if (n.type !== 'INPUT') return n;
                const index = inputs.findIndex(inp => inp.id === n.id);
                const bit = (i >> (inputs.length - 1 - index)) & 1; // Binary value
                return { ...n, state: !!bit };
            });

            // 2. Run Simulation
            const result = simulate(tempNodes, connections);

            // 3. Record Row
            const rowData = {
                inputs: inputs.map(inp => (tempNodes.find(t => t.id === inp.id).state ? 1 : 0)),
                outputs: outputs.map(out => (result[out.id] ? 1 : 0))
            };
            rows.push(rowData);
        }

        setTruthTable({ inputs, outputs, rows });
    };

    // --- Render Helpers ---

    // Draw smooth Bezier curve for wires
    const getWirePath = (x1, y1, x2, y2) => {
        const dist = Math.abs(x2 - x1) * 0.5;
        return `M ${x1} ${y1} C ${x1 + dist} ${y1}, ${x2 - dist} ${y2}, ${x2} ${y2}`;
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden select-none">

            {/* Header */}
            <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-500 p-1.5 rounded">
                        <Zap size={20} className="text-white" />
                    </div>
                    <h1 className="font-bold text-lg tracking-wide">LogicLab <span className="text-slate-500 font-normal text-sm ml-2">v1.0</span></h1>
                </div>

                <div className="flex gap-3">
                    <button onClick={clearCanvas} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-300">
                        <Trash2 size={16} /> Clear
                    </button>
                    <button onClick={generateTruthTable} className="flex items-center gap-2 px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded shadow-lg shadow-emerald-900/20 transition-all hover:translate-y-[-1px]">
                        <Table size={16} /> Generate Truth Table
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex relative overflow-hidden">

                {/* Canvas Area */}
                <div
                    className="flex-1 relative bg-slate-900 overflow-hidden cursor-crosshair"
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
                            backgroundSize: `${SNAP_GRID}px ${SNAP_GRID}px`
                        }}>
                    </div>

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
                                    stroke={isActive ? '#4ade80' : '#475569'}
                                    strokeWidth="3"
                                    fill="none"
                                    className="transition-colors duration-150"
                                />
                            );
                        })}

                        {/* Active Drawing Wire */}
                        {wiring && (
                            <path
                                d={getWirePath(
                                    nodes.find(n => n.id === wiring.nodeId).x + getPortPosition(nodes.find(n => n.id === wiring.nodeId).type, 'output', 0).x,
                                    nodes.find(n => n.id === wiring.nodeId).y + getPortPosition(nodes.find(n => n.id === wiring.nodeId).type, 'output', 0).y,
                                    mousePos.x,
                                    mousePos.y
                                )}
                                stroke="#6366f1"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                fill="none"
                                className="opacity-70"
                            />
                        )}
                    </svg>

                    {/* Nodes Layer */}
                    {nodes.map(node => {
                        const def = COMPONENT_TYPES[node.type];
                        const isActive = activeSimulation[node.id];

                        return (
                            <div
                                key={node.id}
                                className="absolute flex flex-col items-center group z-10"
                                style={{
                                    left: node.x,
                                    top: node.y,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {/* Delete Button (Visible on Hover) */}
                                <button
                                    onClick={() => deleteNode(node.id)}
                                    className="absolute -top-8 bg-red-500/80 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 pointer-events-auto"
                                >
                                    <Trash2 size={12} />
                                </button>

                                {/* Input Ports */}
                                {Array.from({ length: def.inputs }).map((_, i) => {
                                    const pos = getPortPosition(node.type, 'input', i);
                                    return (
                                        <div
                                            key={`in-${i}`}
                                            className="absolute w-4 h-4 bg-blue-400 rounded-full border-2 border-slate-900 hover:bg-blue-300 hover:scale-125 transition-all cursor-pointer z-20"
                                            style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)`, transform: 'translate(-50%, -50%)' }}
                                            onMouseUp={(e) => completeWiring(e, node.id, i)}
                                            title="Input"
                                        />
                                    );
                                })}

                                {/* Output Port */}
                                {def.outputs > 0 && (
                                    <div
                                        className="absolute w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 hover:bg-emerald-300 hover:scale-125 transition-all cursor-pointer z-20"
                                        style={{ left: `calc(50% + ${getPortPosition(node.type, 'output', 0).x}px)`, top: `calc(50% + ${getPortPosition(node.type, 'output', 0).y}px)`, transform: 'translate(-50%, -50%)' }}
                                        onMouseDown={(e) => startWiring(e, node.id)}
                                        title="Output"
                                    />
                                )}

                                {/* Main Node Body */}
                                <div
                                    className="relative cursor-move"
                                    onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                                    onClick={(e) => node.type === 'INPUT' ? toggleInput(e, node.id) : null}
                                >
                                    {def.render(isActive)}
                                </div>

                                {/* Label */}
                                <div className="mt-2 text-xs font-mono text-slate-400 bg-slate-800/80 px-1 rounded pointer-events-none">
                                    {node.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Toolbar */}
            <div className="h-24 bg-slate-800 border-t border-slate-700 p-4 flex items-center justify-center gap-4 shadow-xl z-20">
                {Object.entries(COMPONENT_TYPES).map(([key, def]) => (
                    <button
                        key={key}
                        onClick={() => addNode(key)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`w-12 h-12 rounded-lg ${def.color} shadow-lg flex items-center justify-center text-white border-2 border-transparent group-hover:border-white/50 group-hover:-translate-y-1 transition-all`}>
                            <span className="font-bold text-[10px]">{def.label.substring(0, 3)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-200">{def.label}</span>
                    </button>
                ))}
            </div>

            {/* Truth Table Modal */}
            {truthTable && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-600 max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-750 rounded-t-xl">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                                <Table size={20} /> Truth Table
                            </h2>
                            <button
                                onClick={() => setTruthTable(null)}
                                className="p-1 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-auto custom-scrollbar">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr>
                                        {truthTable.inputs.map(input => (
                                            <th key={input.id} className="p-3 border-b-2 border-slate-600 text-yellow-500 font-mono bg-slate-800/50">
                                                {input.label}
                                            </th>
                                        ))}
                                        <th className="w-8 border-b-2 border-slate-600"></th> {/* Spacer */}
                                        {truthTable.outputs.map(output => (
                                            <th key={output.id} className="p-3 border-b-2 border-slate-600 text-blue-400 font-mono bg-slate-800/50">
                                                {output.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="font-mono text-sm">
                                    {truthTable.rows.map((row, i) => (
                                        <tr key={i} className={`hover:bg-slate-700/50 transition-colors ${i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}>
                                            {row.inputs.map((val, idx) => (
                                                <td key={idx} className={`p-3 border-b border-slate-700 ${val ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                                                    {val}
                                                </td>
                                            ))}
                                            <td className="border-b border-slate-700 text-slate-600">→</td>
                                            {row.outputs.map((val, idx) => (
                                                <td key={idx} className={`p-3 border-b border-slate-700 ${val ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                                                    {val}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-slate-700 bg-slate-800/50 text-xs text-slate-400 flex justify-between items-center rounded-b-xl">
                            <span>{truthTable.rows.length} Combinations Generated</span>
                            <button onClick={generateTruthTable} className="flex items-center gap-1 hover:text-white transition-colors">
                                <RefreshCw size={12} /> Refresh
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Scrollbar Styles for the Modal */}
            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
        </div>
    );
}