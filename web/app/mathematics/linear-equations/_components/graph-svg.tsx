"use client"

import * as React from "react"
import { LineConfig, Point } from "../constants"
import { cn } from "@/lib/utils"
import {
    calculateLineEndpoints,
    calculateSlopeTriangle,
    calculateXIntercept,
    formatEquation,
    Viewport,
    toPixel,
    toGraph
} from "../_lib/line-graph"

interface GraphSVGProps {
    lines: LineConfig[]
    showEquation: boolean
    showIntercepts: boolean
    showSlopeTriangle?: boolean
    slopeTriangleSize?: number
    showGradientCalculation?: boolean
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
    slopeTriangleSize = 1,
    showGradientCalculation = false,
    showGrid = true,
    activeLineId,
    onLineSelect,
    interactionMode = 'none',
    onParameterChange
}: GraphSVGProps) {
    const svgRef = React.useRef<SVGSVGElement>(null)
    const [dimensions, setDimensions] = React.useState({ width: 800, height: 800 })

    // Measure the actual size of the SVG container
    React.useEffect(() => {
        if (!svgRef.current) return

        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect
                if (width > 0 && height > 0) {
                    setDimensions({ width, height })
                }
            }
        })

        observer.observe(svgRef.current)
        return () => observer.disconnect()
    }, [])

    // Derive the viewport to maintain square units (-10 to 10 on Y, X expands)
    const currentViewport = React.useMemo(() => {
        const aspect = dimensions.width / dimensions.height
        const yRange = 20
        const xRange = yRange * aspect
        return {
            xMin: -xRange / 2,
            xMax: xRange / 2,
            yMin: -10,
            yMax: 10
        }
    }, [dimensions])

    const getGraphCoordinates = (e: React.PointerEvent | PointerEvent | { clientX: number, clientY: number }) => {
        if (!svgRef.current) return { x: 0, y: 0 }
        const rect = svgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        return toGraph({ x, y }, currentViewport, dimensions.width, dimensions.height)
    }

    // Interaction state
    const [isDragging, setIsDragging] = React.useState(false)
    const [dragStartPos, setDragStartPos] = React.useState<Point | null>(null)
    const [initialLineParams, setInitialLineParams] = React.useState<{ m: number, c: number } | null>(null)

    const handlePointerDown = (e: React.PointerEvent) => {
        if (interactionMode === 'none') return

        const activeLine = lines.find(l => l.id === activeLineId)
        if (!activeLine) return

        setIsDragging(true)
        setDragStartPos(getGraphCoordinates(e))
        setInitialLineParams({ m: activeLine.m, c: activeLine.c })
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !dragStartPos || !initialLineParams || interactionMode === 'none' || !onParameterChange || !activeLineId) return

        const currentPos = getGraphCoordinates(e)
        e.preventDefault()

        if (interactionMode === 'move') {
            const newC = currentPos.y - initialLineParams.m * currentPos.x
            const roundedC = Math.round(newC * 10) / 10
            onParameterChange(activeLineId, { c: roundedC })
        } else if (interactionMode === 'rotate') {
            if (Math.abs(currentPos.x) > 0.1) {
                const newM = (currentPos.y - initialLineParams.c) / currentPos.x
                const roundedM = Math.round(newM * 10) / 10
                const clampedM = Math.max(Math.min(roundedM, 20), -20)
                onParameterChange(activeLineId, { m: clampedM })
            }
        }
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false)
        setDragStartPos(null)
        setInitialLineParams(null)
        if (e.currentTarget && e.currentTarget.releasePointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId)
        }
    }

    const gridCellWidth = dimensions.width / (currentViewport.xMax - currentViewport.xMin)
    const gridCellHeight = dimensions.height / 20

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-full bg-white dark:bg-slate-950 touch-none select-none"
            preserveAspectRatio="xMidYMid meet"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            xmlns="http://www.w3.org/2000/svg"
            data-testid="graph-svg"
        >
            <defs>
                <pattern id="grid"
                    width={gridCellWidth}
                    height={gridCellHeight}
                    patternUnits="userSpaceOnUse"
                    x={toPixel({ x: 0, y: 0 }, currentViewport, dimensions.width, dimensions.height).x % gridCellWidth}
                    y={toPixel({ x: 0, y: 0 }, currentViewport, dimensions.width, dimensions.height).y % gridCellHeight}
                >
                    <path d={`M ${gridCellWidth} 0 L 0 0 0 ${gridCellHeight}`}
                        fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                </pattern>
            </defs>

            {/* Grid */}
            {showGrid && <rect data-testid="graph-grid" width="100%" height="100%" fill="url(#grid)" />}

            {/* Axes */}
            <g className="text-slate-400 dark:text-slate-600">
                {/* Y Axis */}
                <line
                    x1={toPixel({ x: 0, y: currentViewport.yMin }, currentViewport, dimensions.width, dimensions.height).x}
                    y1={0}
                    x2={toPixel({ x: 0, y: currentViewport.yMax }, currentViewport, dimensions.width, dimensions.height).x}
                    y2={dimensions.height}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-800 dark:text-slate-200"
                />
                {/* X Axis */}
                <line
                    x1={0}
                    y1={toPixel({ x: currentViewport.xMin, y: 0 }, currentViewport, dimensions.width, dimensions.height).y}
                    x2={dimensions.width}
                    y2={toPixel({ x: currentViewport.xMax, y: 0 }, currentViewport, dimensions.width, dimensions.height).y}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-800 dark:text-slate-200"
                />

                {/* Axis Labels */}
                <text
                    x={dimensions.width - 20}
                    y={toPixel({ x: 0, y: 0 }, currentViewport, dimensions.width, dimensions.height).y + 20}
                    textAnchor="end" className="fill-slate-600 dark:fill-slate-400 font-bold" style={{ fontSize: '16px' }}>x</text>
                <text
                    x={toPixel({ x: 0, y: 0 }, currentViewport, dimensions.width, dimensions.height).x + 10}
                    y={20}
                    textAnchor="start" className="fill-slate-600 dark:fill-slate-400 font-bold" style={{ fontSize: '16px' }}>y</text>
            </g>

            {/* Lines Layer */}
            <g>
                {lines.map((line) => {
                    const isActive = line.id === activeLineId;
                    const [startGraph, endGraph] = calculateLineEndpoints(line.m, line.c, currentViewport);
                    const p1Pixel = toPixel(startGraph, currentViewport, dimensions.width, dimensions.height);
                    const p2Pixel = toPixel(endGraph, currentViewport, dimensions.width, dimensions.height);

                    const isFaded = interactionMode !== 'none' && !isActive;

                    return (
                        <g key={line.id}
                            className={cn("transition-opacity duration-200", {
                                "opacity-40": isFaded,
                                "cursor-move": isActive && interactionMode === 'move',
                                "cursor-crosshair": isActive && interactionMode === 'rotate',
                                "cursor-pointer": interactionMode === 'none'
                            })}
                            onClick={() => onLineSelect?.(line.id)}
                            style={{ pointerEvents: 'stroke' }}
                        >
                            {/* Hit Area */}
                            <line
                                x1={p1Pixel.x} y1={p1Pixel.y}
                                x2={p2Pixel.x} y2={p2Pixel.y}
                                stroke="transparent"
                                strokeWidth="40"
                                data-testid={`function-line-hit-area-${line.id}`}
                            />

                            {/* Visible Line */}
                            <line
                                x1={p1Pixel.x} y1={p1Pixel.y}
                                x2={p2Pixel.x} y2={p2Pixel.y}
                                stroke={line.color}
                                strokeWidth={isActive ? 5 : 3}
                                strokeLinecap="round"
                                data-testid={`function-line-${line.id}`}
                            />

                            {/* Slope Triangle */}
                            {isActive && showSlopeTriangle && (
                                <SlopeTriangle
                                    line={line}
                                    viewport={currentViewport}
                                    canvasSize={dimensions}
                                    step={slopeTriangleSize}
                                    showCalculation={showGradientCalculation}
                                />
                            )}

                            {/* Intercepts */}
                            {isActive && showIntercepts && (() => {
                                const xIntArr = calculateXIntercept(line.m, line.c);
                                const yInt = { x: 0, y: line.c };
                                const elements = [];

                                // Y-Intercept
                                if (yInt.y >= currentViewport.yMin && yInt.y <= currentViewport.yMax) {
                                    const pY = toPixel(yInt, currentViewport, dimensions.width, dimensions.height);
                                    elements.push(
                                        <g key="y-int">
                                            <circle cx={pY.x} cy={pY.y} r="6" fill="#EF4444" stroke="white" strokeWidth="2" className="dark:stroke-slate-800" />
                                            {interactionMode === 'none' && (
                                                <text x={pY.x + 12} y={pY.y} textAnchor="start" dominantBaseline="middle" className="text-sm fill-slate-800 dark:fill-slate-200 font-bold font-sans drop-shadow-sm px-1">
                                                    (0, {line.c})
                                                </text>
                                            )}
                                        </g>
                                    );
                                }

                                // X-Intercept
                                if (xIntArr && xIntArr.x >= currentViewport.xMin && xIntArr.x <= currentViewport.xMax) {
                                    const pX = toPixel(xIntArr, currentViewport, dimensions.width, dimensions.height);
                                    elements.push(
                                        <g key="x-int">
                                            <circle cx={pX.x} cy={pX.y} r="6" fill="#10B981" stroke="white" strokeWidth="2" className="dark:stroke-slate-800" />
                                            {interactionMode === 'none' && (
                                                <text x={pX.x} y={pX.y + 25} textAnchor="middle" className="text-sm fill-slate-800 dark:fill-slate-200 font-bold font-sans drop-shadow-sm">
                                                    ({Number(xIntArr.x.toFixed(1))}, 0)
                                                </text>
                                            )}
                                        </g>
                                    );
                                }
                                return elements;
                            })()}

                            {/* Equation Label */}
                            {isActive && showEquation && (
                                <EquationLabel line={line} viewport={currentViewport} canvasSize={dimensions} />
                            )}
                        </g>
                    );
                })}
            </g>
        </svg>
    )
}

function SlopeTriangle({ line, viewport, canvasSize, step = 1, showCalculation = false }: {
    line: LineConfig,
    viewport: Viewport,
    canvasSize: { width: number, height: number },
    step?: number,
    showCalculation?: boolean
}) {
    // Position triangle further right to avoid crowding (x=3), but keep within viewport
    // If showing calculation, we need more space on the right (approx 4 units for label + spacing)
    const rightBuffer = showCalculation ? 5.5 : 2;
    const startX = Math.min(3, viewport.xMax - step - rightBuffer); // Adjust for step size and label
    const triangle = calculateSlopeTriangle(line.m, line.c, startX, step);
    if (!triangle) return null;
    const t1 = toPixel(triangle.runStart, viewport, canvasSize.width, canvasSize.height);
    const t2 = toPixel(triangle.runEnd, viewport, canvasSize.width, canvasSize.height);
    const t3 = toPixel(triangle.riseEnd, viewport, canvasSize.width, canvasSize.height);

    const rise = line.m * step
    const run = step



    return (
        <g className="slope-triangle">
            <path
                d={`M${t1.x} ${t1.y} L${t2.x} ${t2.y} L${t3.x} ${t3.y}`}
                fill={`${line.color}20`}
                stroke={line.color}
                strokeDasharray="8,4"
                strokeWidth="2"
                pointerEvents="none"
            />
            {/* Run Label */}
            <text x={(t1.x + t2.x) / 2} y={t1.y + 20} className="text-[14px] fill-slate-700 dark:fill-slate-200 font-bold font-sans text-center" textAnchor="middle">{run}</text>

            {/* Rise Label */}
            <text x={t2.x + 8} y={(t2.y + t3.y) / 2} className="text-[14px] fill-slate-700 dark:fill-slate-200 font-bold font-sans" dominantBaseline="middle">{rise.toFixed(1)}</text>

            {/* Calculation Display */}
            {showCalculation && (
                <foreignObject
                    x={t2.x + 55}
                    y={(t2.y + t3.y) / 2 - 24}
                    width="120"
                    height="50"
                    className="overflow-visible pointer-events-none"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-slate-900/95 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md text-sm font-sans text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                        <span className="italic font-medium text-slate-500 dark:text-slate-400">m</span>
                        <span>=</span>
                        <div className="flex flex-col items-center leading-none">
                            <span className="border-b border-slate-400 dark:border-slate-500 w-full text-center pb-0.5 mb-0.5">{rise.toFixed(1)}</span>
                            <span>{run}</span>
                        </div>
                        <span>=</span>
                        <span className="font-bold">{line.m.toFixed(2)}</span>
                    </div>
                </foreignObject>
            )}
        </g>
    );
}

function EquationLabel({ line, viewport, canvasSize }: { line: LineConfig, viewport: Viewport, canvasSize: { width: number, height: number } }) {
    // Position equation label further right (x=6), to avoid crowding triangle and intercepts
    const labelX = Math.min(6, viewport.xMax - 3);
    let labelY = line.m * labelX + line.c;

    // Keep label in viewport
    if (labelY > viewport.yMax - 2) labelY = viewport.yMax - 2;
    if (labelY < viewport.yMin + 2) labelY = viewport.yMin + 2;

    const screenPos = toPixel({ x: labelX, y: labelY }, viewport, canvasSize.width, canvasSize.height);

    return (
        <foreignObject
            x={screenPos.x}
            y={screenPos.y - 45}
            width="140" height="40"
            className="overflow-visible pointer-events-none"
        >
            <div className={cn("equation-label inline-block px-3 py-1.5 rounded shadow-sm border text-sm font-bold bg-white dark:bg-slate-800 whitespace-nowrap")}
                style={{ borderColor: line.color, color: line.color }}
            >
                {formatEquation(line.m, line.c)}
            </div>
        </foreignObject>
    );
}
