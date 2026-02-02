"use client"

import * as React from "react"
import { LineConfig } from "../constants"
import { cn } from "@/lib/utils"
// Import helpers directly since they are exported
import {
    calculateLineEndpoints,
    calculateSlopeTriangle,
    calculateXIntercept,
    formatEquation,
    VIEWPORT
} from "../_lib/line-graph"

function toPixel(point: { x: number, y: number }) {
    // Map graph coordinates to SVG pixel coordinates
    // Width: 460, Height: 300
    const xRange = VIEWPORT.xMax - VIEWPORT.xMin
    const yRange = VIEWPORT.yMax - VIEWPORT.yMin

    // Pixel Dimensions
    const width = 460
    const height = 300

    const x = ((point.x - VIEWPORT.xMin) / xRange) * width
    const y = height - ((point.y - VIEWPORT.yMin) / yRange) * height // Invert Y

    return { x, y }
}

function mapX(x: number) {
    return toPixel({ x, y: 0 }).x
}

function mapY(y: number) {
    return toPixel({ x: 0, y }).y
}

interface GraphSVGProps {
    lines: LineConfig[]
    showEquation: boolean
    showIntercepts: boolean
    showSlopeTriangle?: boolean
    showGrid?: boolean
    activeLineId: string
    onLineSelect?: (id: string) => void
    interactionMode?: 'none' | 'move' | 'rotate'
    onParameterChange?: (id: string, updates: Partial<LineConfig>) => void
}

export function GraphSVG({
    lines,
    showEquation,
    showIntercepts,
    showSlopeTriangle = true,
    showGrid = true,
    activeLineId,
    onLineSelect,
    interactionMode = 'none',
    onParameterChange
}: GraphSVGProps) {
    const svgRef = React.useRef<SVGSVGElement>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    // Helper to get graph coordinates from pointer event
    const getGraphCoordinates = (e: React.PointerEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 }
        const rect = svgRef.current.getBoundingClientRect()
        const xPercent = (e.clientX - rect.left) / rect.width
        const yPercent = (e.clientY - rect.top) / rect.height

        const x = VIEWPORT.xMin + xPercent * (VIEWPORT.xMax - VIEWPORT.xMin)
        const y = VIEWPORT.yMax - yPercent * (VIEWPORT.yMax - VIEWPORT.yMin) // Inverted Y axis
        return { x, y }
    }

    const handlePointerDown = (e: React.PointerEvent, lineId: string) => {
        // Always select the line on click
        onLineSelect?.(lineId)

        if (interactionMode === 'none') {
            return
        }

        // Start dragging
        setIsDragging(true)

        // Capture pointer for smooth dragging even outside SVG
        // Note: casting to Element for TS check
        const target = e.target as Element;
        if (target && target.setPointerCapture) {
            target.setPointerCapture(e.pointerId)
        }
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || interactionMode === 'none' || !onParameterChange || !activeLineId) return

        const { x, y } = getGraphCoordinates(e)
        // Prevent default touch behaviors like scrolling
        e.preventDefault()

        if (interactionMode === 'move') {
            // Moving Y-intercept (c)
            // Just move the line vertically to match Y at the current X? 
            // Or move the line such that it passes through (x, y) keeping 'm' constant.
            // y = mx + c  =>  c = y - mx
            const activeLine = lines.find(l => l.id === activeLineId)
            if (activeLine) {
                const newC = y - activeLine.m * x
                const roundedC = Math.round(newC * 10) / 10
                onParameterChange(activeLineId, { c: roundedC })
            }
        } else if (interactionMode === 'rotate') {
            // Changing Gradient (m)
            // Pivot around Y-intercept (0, c)
            // y = mx + c => m = (y - c) / x
            const activeLine = lines.find(l => l.id === activeLineId)
            if (activeLine) {
                // Avoid crazy jumps when near the pivot point
                if (Math.abs(x) > 0.5) {
                    const newM = (y - activeLine.c) / x
                    // Clamp and round
                    const roundedM = Math.round(newM * 10) / 10
                    const clampedM = Math.max(Math.min(roundedM, 20), -20)
                    onParameterChange(activeLineId, { m: clampedM })
                }
            }
        }
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false)
        const target = e.target as Element;
        if (target && target.releasePointerCapture && target.hasPointerCapture(e.pointerId)) {
            target.releasePointerCapture(e.pointerId)
        }
    }

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 460 300"
            className="w-full h-full bg-white dark:bg-slate-900 touch-none select-none rounded-lg"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <pattern id="grid" width="23" height="15" patternUnits="userSpaceOnUse">
                    <path d="M 23 0 L 0 0 0 15" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                </pattern>
            </defs>
            {showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}

            {/* Axes */}
            <line x1="230" y1="0" x2="230" y2="300" stroke="currentColor" className="text-slate-800 dark:text-slate-200" strokeWidth="2" />
            <line x1="0" y1="150" x2="460" y2="150" stroke="currentColor" className="text-slate-800 dark:text-slate-200" strokeWidth="2" />

            {/* Axis Labels */}
            <text x="450" y="170" textAnchor="end" className="fill-slate-600 dark:fill-slate-400 font-bold" style={{ fontSize: '14px' }}>x</text>
            <text x="240" y="20" textAnchor="start" className="fill-slate-600 dark:fill-slate-400 font-bold" style={{ fontSize: '14px' }}>y</text>

            <g>
                {lines.map((line) => {
                    const isActive = line.id === activeLineId;
                    const [start, end] = calculateLineEndpoints(line.m, line.c);
                    const x1 = start.x;
                    const y1 = start.y;
                    const x2 = end.x;
                    const y2 = end.y; // Standardizing to x1, y1 for rest of code

                    // Use opacity to indicate non-selected lines if in interaction mode
                    const isFaded = interactionMode !== 'none' && !isActive;

                    return (
                        <g key={line.id}
                            className={cn("transition-opacity duration-200", {
                                "opacity-40": isFaded,
                                "cursor-move": interactionMode === 'move',
                                "cursor-crosshair": interactionMode === 'rotate',
                                "cursor-pointer": interactionMode === 'none'
                            })}
                            onPointerDown={(e) => handlePointerDown(e, line.id)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            style={{ pointerEvents: 'stroke' }}
                        >
                            {/* Invisible Hit Area (wider) */}
                            <line
                                x1={mapX(x1)} y1={mapY(y1)}
                                x2={mapX(x2)} y2={mapY(y2)}
                                stroke="transparent"
                                strokeWidth="30"
                            />

                            {/* Visible Line */}
                            <line
                                x1={mapX(x1)} y1={mapY(y1)}
                                x2={mapX(x2)} y2={mapY(y2)}
                                stroke={line.color}
                                strokeWidth={isActive ? 4 : 3}
                                strokeLinecap="round"
                            />

                            {/* Slope Triangle */}
                            {isActive && showSlopeTriangle && (() => {
                                const triangle = calculateSlopeTriangle(line.m, line.c);
                                if (!triangle) return null;
                                const p1 = toPixel(triangle.runStart);
                                const p2 = toPixel(triangle.runEnd);
                                const p3 = toPixel(triangle.riseEnd);
                                return (
                                    <g className="slope-triangle">
                                        <path
                                            d={`M${p1.x} ${p1.y} L${p2.x} ${p2.y} L${p3.x} ${p3.y}`}
                                            fill={`${line.color}20`}
                                            stroke={line.color}
                                            strokeDasharray="4,2"
                                            strokeWidth="1"
                                            pointerEvents="none"
                                        />
                                        <text x={(p1.x + p2.x) / 2} y={p1.y + 15} className="text-[10px] fill-slate-600 dark:fill-slate-300 font-medium font-sans text-center" textAnchor="middle">1</text>
                                        <text x={p2.x + 5} y={(p2.y + p3.y) / 2} className="text-[10px] fill-slate-600 dark:fill-slate-300 font-medium font-sans" dominantBaseline="middle">{line.m}</text>
                                    </g>
                                );
                            })()}

                            {/* Intercepts */}
                            {isActive && showIntercepts && (() => {
                                const xInt = calculateXIntercept(line.m, line.c);
                                const yInt = { x: 0, y: line.c };
                                const pY = toPixel(yInt);
                                const elements = [];

                                // Y-Intercept
                                if (yInt.y >= VIEWPORT.yMin && yInt.y <= VIEWPORT.yMax) {
                                    elements.push(
                                        <g key="y-int" className="hover:scale-125 transition-transform origin-center">
                                            <circle cx={pY.x} cy={pY.y} r="5" fill="#EF4444" stroke="white" strokeWidth="2" className="dark:stroke-slate-800" />
                                            {interactionMode === 'none' && (
                                                <text x={pY.x + 10} y={pY.y} textAnchor="start" dominantBaseline="middle" className="text-xs fill-slate-800 dark:fill-slate-200 font-bold font-sans drop-shadow-sm px-1">
                                                    (0, {line.c})
                                                </text>
                                            )}
                                        </g>
                                    );
                                }

                                // X-Intercept
                                if (xInt && xInt.x >= VIEWPORT.xMin && xInt.x <= VIEWPORT.xMax) {
                                    const pX = toPixel(xInt);
                                    elements.push(
                                        <g key="x-int" className="hover:scale-125 transition-transform origin-center">
                                            <circle cx={pX.x} cy={pX.y} r="5" fill="#10B981" stroke="white" strokeWidth="2" className="dark:stroke-slate-800" />
                                            {interactionMode === 'none' && (
                                                <text x={pX.x} y={pX.y + 20} textAnchor="middle" className="text-xs fill-slate-800 dark:fill-slate-200 font-bold font-sans drop-shadow-sm">
                                                    ({Number(xInt.x.toFixed(1))}, 0)
                                                </text>
                                            )}
                                        </g>
                                    );
                                }
                                return elements;
                            })()}

                            {/* Label */}
                            {isActive && showEquation && (
                                <foreignObject
                                    x={Math.max(0, Math.min(460 - 100, mapX(0) + 10))}
                                    y={Math.max(0, Math.min(300 - 40, mapY(line.c) - 40))}
                                    width="100" height="40"
                                    className="overflow-visible pointer-events-none"
                                >
                                    <div className={cn("inline-block px-2 py-1 rounded shadow-sm border text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 whitespace-nowrap")}
                                        style={{ borderColor: line.color, color: line.color }}
                                    >
                                        {formatEquation(line.m, line.c)}
                                    </div>
                                </foreignObject>
                            )}
                        </g>
                    );
                })}
            </g>
        </svg >
    )
}

