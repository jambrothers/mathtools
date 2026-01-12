"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { CircuitNode as CircuitNodeType, ComponentTypeName, COMPONENT_TYPES, getPortPosition } from "../constants"

interface CircuitNodeProps {
    node: CircuitNodeType
    isActive: boolean
    isDark: boolean
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>, id: string) => void
    onClick: (e: React.MouseEvent<HTMLDivElement>, id: string) => void
    onDelete: (id: string) => void
    onStartWiring: (e: React.MouseEvent<HTMLDivElement>, nodeId: string) => void
    onCompleteWiring: (e: React.MouseEvent<HTMLDivElement>, targetNodeId: string, inputIndex: number) => void
}

/**
 * A draggable circuit node component (input, output, or logic gate).
 * Handles rendering, ports, and user interactions.
 */
export function CircuitNodeComponent({
    node,
    isActive,
    isDark,
    onMouseDown,
    onClick,
    onDelete,
    onStartWiring,
    onCompleteWiring
}: CircuitNodeProps) {
    const def = COMPONENT_TYPES[node.type];

    return (
        <div
            className="absolute flex flex-col items-center group z-10"
            style={{
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {/* Delete Button (Visible on Hover) */}
            <button
                onClick={() => onDelete(node.id)}
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
                        className="absolute w-4 h-4 bg-blue-400 rounded-full border-2 border-white dark:border-slate-900 hover:bg-blue-300 hover:scale-125 transition-all cursor-pointer z-20 shadow-sm"
                        style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)`, transform: 'translate(-50%, -50%)' }}
                        onMouseUp={(e) => onCompleteWiring(e, node.id, i)}
                        title="Input"
                    />
                );
            })}

            {/* Output Port */}
            {def.outputs > 0 && (
                <div
                    className="absolute w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 hover:bg-emerald-300 hover:scale-125 transition-all cursor-pointer z-20 shadow-sm"
                    style={{ left: `calc(50% + ${getPortPosition(node.type, 'output', 0).x}px)`, top: `calc(50% + ${getPortPosition(node.type, 'output', 0).y}px)`, transform: 'translate(-50%, -50%)' }}
                    onMouseDown={(e) => onStartWiring(e, node.id)}
                    title="Output (drag to connect)"
                />
            )}

            {/* Main Node Body */}
            <div
                className="relative cursor-move"
                onMouseDown={(e) => onMouseDown(e, node.id)}
                onClick={(e) => node.type === 'INPUT' ? onClick(e, node.id) : undefined}
            >
                {def.render(isActive ?? false, isDark)}
            </div>

            {/* Label */}
            <div className="mt-2 text-xs font-mono text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-1.5 py-0.5 rounded pointer-events-none shadow-sm">
                {node.label}
            </div>
        </div>
    );
}
