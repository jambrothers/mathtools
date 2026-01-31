"use client"

import * as React from "react"
import {
    Point, GRAPH_WIDTH, GRAPH_HEIGHT, LINE_COLORS, LineConfig
} from "../constants"
import {
    toPixel, calculateLineEndpoints, calculateXIntercept,
    calculateSlopeTriangle, VIEWPORT
} from "../_lib/line-graph"

interface GraphSVGProps {
    lines: LineConfig[]
    showEquation: boolean
    showIntercepts: boolean
    showSlopeTriangle: boolean
    showGrid: boolean
    activeLineId?: string
    onLineClick?: (id: string) => void
}

export function GraphSVG({
    lines,
    showEquation,
    showIntercepts,
    showSlopeTriangle,
    showGrid,
    activeLineId,
    onLineClick
}: GraphSVGProps) {
    // Generate Grid Lines
    const renderGrid = () => {
        if (!showGrid) return null

        const gridLines = []
        // Vertical lines (x = -10 to 10)
        for (let x = Math.ceil(VIEWPORT.xMin); x <= Math.floor(VIEWPORT.xMax); x++) {
            if (x === 0) continue // Axis handled separately
            const start = toPixel({ x, y: VIEWPORT.yMin })
            const end = toPixel({ x, y: VIEWPORT.yMax })
            gridLines.push(
                <line
                    key={`v-${x}`}
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="1"
                />
            )
        }
        // Horizontal lines (y = -6 to 6)
        for (let y = Math.ceil(VIEWPORT.yMin); y <= Math.floor(VIEWPORT.yMax); y++) {
            if (y === 0) continue // Axis handled separately
            const start = toPixel({ x: VIEWPORT.xMin, y })
            const end = toPixel({ x: VIEWPORT.xMax, y })
            gridLines.push(
                <line
                    key={`h-${y}`}
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="1"
                />
            )
        }
        return <g className="grid-system">{gridLines}</g>
    }

    const renderAxes = () => {
        const origin = toPixel({ x: 0, y: 0 })
        const xStart = toPixel({ x: VIEWPORT.xMin, y: 0 })
        const xEnd = toPixel({ x: VIEWPORT.xMax, y: 0 })
        const yStart = toPixel({ x: 0, y: VIEWPORT.yMin })
        const yEnd = toPixel({ x: 0, y: VIEWPORT.yMax })

        return (
            <g className="axes">
                {/* X Axis */}
                <line
                    x1={xStart.x} y1={origin.y}
                    x2={xEnd.x} y2={origin.y}
                    className="stroke-slate-800 dark:stroke-slate-300"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow)"
                />
                <text x={xEnd.x - 10} y={origin.y + 20} className="text-xs fill-slate-600 dark:fill-slate-400 font-bold font-sans">x</text>

                {/* Y Axis */}
                <line
                    x1={origin.x} y1={yStart.y}
                    x2={origin.x} y2={yEnd.y}
                    className="stroke-slate-800 dark:stroke-slate-300"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow)"
                />
                <text x={origin.x + 10} y={yEnd.y + 20} className="text-xs fill-slate-600 dark:fill-slate-400 font-bold font-sans">y</text>

                {/* Origin Label */}
                <text x={origin.x - 15} y={origin.y + 15} className="text-xs fill-slate-500 font-sans">0</text>
            </g>
        )
    }

    // Helper to render a specific line and its decorations
    const renderLine = (line: LineConfig) => {
        if (!line.visible) return null

        const [start, end] = calculateLineEndpoints(line.m, line.c)
        const p1 = toPixel(start)
        const p2 = toPixel(end)

        const isActive = line.id === activeLineId

        return (
            <g key={line.id} onClick={() => onLineClick?.(line.id)} className="cursor-pointer">
                {/* Main Line */}
                {/* Hit area (thicker transparent line for easier selection) */}
                <line
                    x1={p1.x} y1={p1.y}
                    x2={p2.x} y2={p2.y}
                    stroke="transparent"
                    strokeWidth="20"
                />
                <line
                    x1={p1.x} y1={p1.y}
                    x2={p2.x} y2={p2.y}
                    stroke={line.color}
                    strokeWidth={isActive ? 4 : 2}
                    className="transition-all duration-200"
                    fill="none" // Ensure no fill
                />

                {isActive && showSlopeTriangle && renderSlopeTriangle(line)}
                {isActive && showIntercepts && renderIntercepts(line)}
                {isActive && showEquation && renderEquationLabel(line, p1, p2)}
            </g>
        )
    }

    const renderSlopeTriangle = (line: LineConfig) => {
        const triangle = calculateSlopeTriangle(line.m, line.c)
        if (!triangle) return null

        const p1 = toPixel(triangle.runStart)
        const p2 = toPixel(triangle.runEnd)
        const p3 = toPixel(triangle.riseEnd)

        return (
            <g className="slope-triangle">
                <path
                    d={`M${p1.x} ${p1.y} L${p2.x} ${p2.y} L${p3.x} ${p3.y}`}
                    fill={`${line.color}20`} // 20% opacity using hex alpha
                    stroke={line.color}
                    strokeDasharray="4,2"
                    strokeWidth="1"
                />
                <text x={(p1.x + p2.x) / 2} y={p1.y + 15} className="text-[10px] fill-slate-600 dark:fill-slate-300 font-medium font-sans text-center" textAnchor="middle">1</text>
                <text x={p2.x + 5} y={(p2.y + p3.y) / 2} className="text-[10px] fill-slate-600 dark:fill-slate-300 font-medium font-sans" dominantBaseline="middle">{line.m}</text>
            </g>
        )
    }

    const renderIntercepts = (line: LineConfig) => {
        const xInt = calculateXIntercept(line.m, line.c)
        const yInt = { x: 0, y: line.c } // Always (0, c)

        const elements = []

        // Y-Intercept
        const pY = toPixel(yInt)
        // Check if visible in viewport
        if (yInt.y >= VIEWPORT.yMin && yInt.y <= VIEWPORT.yMax) {
            elements.push(
                <g key="y-int" className="hover:scale-125 transition-transform origin-center">
                    <circle cx={pY.x} cy={pY.y} r="5" fill="#EF4444" stroke="white" strokeWidth="2" className="dark:stroke-slate-800" />
                    <rect x={pY.x + 10} y={pY.y - 12} width="44" height="24" rx="4" fill="rgba(255,255,255,0.9)" className="dark:fill-slate-700" />
                    <text x={pY.x + 32} y={pY.y + 4} textAnchor="middle" className="text-xs fill-slate-800 dark:fill-slate-200 font-bold font-sans">
                        (0, {line.c})
                    </text>
                </g>
            )
        }

        // X-Intercept
        if (xInt && xInt.x >= VIEWPORT.xMin && xInt.x <= VIEWPORT.xMax) {
            const pX = toPixel(xInt)
            elements.push(
                <g key="x-int" className="hover:scale-125 transition-transform origin-center">
                    <circle cx={pX.x} cy={pX.y} r="5" fill="#10B981" stroke="white" strokeWidth="2" className="dark:stroke-slate-800" />
                    <rect x={pX.x - 22} y={pX.y + 10} width="44" height="24" rx="4" fill="rgba(255,255,255,0.9)" className="dark:fill-slate-700" />
                    <text x={pX.x} y={pX.y + 26} textAnchor="middle" className="text-xs fill-slate-800 dark:fill-slate-200 font-bold font-sans">
                        ({Number(xInt.x.toFixed(1))}, 0)
                    </text>
                </g>
            )
        }

        return <g>{elements}</g>
    }

    const renderEquationLabel = (line: LineConfig, p1: Point, p2: Point) => {
        // Place label somewhat along the line
        // Simple heuristic: 75% of the way from left to right (or p1 to p2)
        const labelX = p1.x + (p2.x - p1.x) * 0.75
        const labelY = p1.y + (p2.y - p1.y) * 0.75

        // Don't render if out of bounds
        if (labelX < 0 || labelX > GRAPH_WIDTH || labelY < 0 || labelY > GRAPH_HEIGHT) return null

        const mStr = Math.abs(line.m) === 1 ? (line.m < 0 ? "-" : "") + "x" : line.m + "x"
        // Cleanup 0.5x, -0.5x etc

        let label = `y = ${line.m}x`
        if (line.c > 0) label += ` + ${line.c}`
        if (line.c < 0) label += ` - ${Math.abs(line.c)}`
        // Handle m=0 or m=1 cases strictly? formatEquation function handles it better broadly
        // Re-use logic or just simplfy here for display

        return (
            <g transform={`translate(${labelX}, ${labelY - 20})`}>
                <rect x="-10" y="-20" width="100" height="30" rx="6" fill="white" stroke={line.color} strokeWidth="1" className="dark:fill-slate-800 drop-shadow-md" />
                <text x="40" y="0" textAnchor="middle" className="text-sm font-bold font-display" fill={line.color}>
                    {label}
                </text>
            </g>
        )
    }

    return (
        <svg
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            className="w-full h-full drop-shadow-xl select-none"
            preserveAspectRatio="xMidYMid meet"
        >
            <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8" fill="#4B5563" className="dark:fill-slate-400" />
                </marker>
            </defs>

            {/* Background (Grid) */}
            {renderGrid()}

            {/* Axes */}
            {renderAxes()}

            {/* Lines */}
            {lines.map(line => renderLine(line))}
        </svg>
    )
}
