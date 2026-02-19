"use client"

import * as React from "react"
import {
    Viewport,
    calculateTicks,
    toPixelX,
    fromPixelX,
    formatTickLabel
} from "../_lib/number-line"
import { PointMarker, JumpArc } from "../_lib/url-state"
import {
    NUMBER_LINE_CANVAS_WIDTH,
    NUMBER_LINE_CANVAS_HEIGHT
} from "../constants"
import { cn } from "@/lib/utils"

interface NumberLineSVGProps {
    viewport: Viewport;
    points: PointMarker[];
    arcs: JumpArc[];
    showLabels: boolean;
    hideValues: boolean;
    showNegativeRegion?: boolean;
    interactionMode: 'default' | 'add-arc' | 'add-point';
    pendingArcStart: string | null;
    onPointMove?: (id: string, newValue: number) => void;
    onPointClick?: (id: string) => void;
    onLineClick?: (newValue: number) => void;
    onZoom?: (focalPoint: number, factor: number) => void;
}

export function NumberLineSVG({
    viewport,
    points,
    arcs,
    showLabels,
    hideValues,
    showNegativeRegion,
    interactionMode,
    pendingArcStart,
    onPointMove,
    onPointClick,
    onLineClick,
    onZoom
}: NumberLineSVGProps) {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [dragState, setDragState] = React.useState<{ id: string } | null>(null);

    const ticks = React.useMemo(() => calculateTicks(viewport), [viewport]);

    // Calculate major step size for stable label staggering
    const majorTicks = ticks.filter(t => t.type === 'major');
    const majorStep = majorTicks.length > 1 ? majorTicks[1].value - majorTicks[0].value : 1;

    const centerY = NUMBER_LINE_CANVAS_HEIGHT / 2;
    const lineY = centerY;

    const getGraphX = (clientX: number) => {
        if (!svgRef.current) return 0;
        const rect = svgRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * NUMBER_LINE_CANVAS_WIDTH;
        return fromPixelX(x, viewport, NUMBER_LINE_CANVAS_WIDTH);
    };

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.stopPropagation();
        setDragState({ id });
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragState || !onPointMove) return;
        const newValue = getGraphX(e.clientX);
        onPointMove(dragState.id, newValue);
    };

    const handlePointerUp = () => {
        setDragState(null);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!onZoom) return;
        e.preventDefault();
        const focalPoint = getGraphX(e.clientX);
        const factor = e.deltaY > 0 ? 1.1 : 0.9;
        onZoom(focalPoint, factor);
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${NUMBER_LINE_CANVAS_WIDTH} ${NUMBER_LINE_CANVAS_HEIGHT}`}
            className="w-full h-full touch-none select-none bg-white dark:bg-slate-900"
            onPointerMove={handlePointerMove}
            onWheel={handleWheel}
            data-testid="number-line-svg"
        >
            <defs>
                <marker
                    id="arrowhead-right"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" className="fill-slate-900 dark:fill-slate-100" />
                </marker>
                <marker
                    id="arrowhead-left"
                    markerWidth="10"
                    markerHeight="7"
                    refX="1"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="10 0, 0 3.5, 10 7" className="fill-slate-900 dark:fill-slate-100" />
                </marker>
            </defs>

            {/* Click hit area - Explicitly handles clicks for adding points */}
            <rect
                x={0}
                y={lineY - 40}
                width={NUMBER_LINE_CANVAS_WIDTH}
                height={80}
                fill="transparent"
                pointerEvents="all"
                className={cn(interactionMode === 'add-point' && "cursor-crosshair")}
                onClick={(e) => {
                    // Only trigger if we are in adding mode
                    if (interactionMode === 'add-point' && onLineClick) {
                        e.stopPropagation(); // Prevent bubbling if needed
                        const newValue = getGraphX(e.clientX);
                        onLineClick(newValue);
                    }
                }}
            />
            {/* Main Axis Line */}
            <line
                x1={15}
                y1={lineY}
                x2={NUMBER_LINE_CANVAS_WIDTH - 15}
                y2={lineY}
                className="stroke-slate-900 dark:stroke-slate-100 pointer-events-none"
                strokeWidth={2}
                markerStart="url(#arrowhead-left)"
                markerEnd="url(#arrowhead-right)"
            />

            {/* Negative region shading */}
            {showNegativeRegion && viewport.min < 0 && (
                <rect
                    x={toPixelX(viewport.min, viewport, NUMBER_LINE_CANVAS_WIDTH)}
                    y={lineY}
                    width={toPixelX(Math.min(0, viewport.max), viewport, NUMBER_LINE_CANVAS_WIDTH) - toPixelX(viewport.min, viewport, NUMBER_LINE_CANVAS_WIDTH)}
                    height={100}
                    className="fill-indigo-500/10 pointer-events-none"
                />
            )}

            {/* Ticks and Labels */}
            {
                ticks.map((tick, i) => {
                    const x = toPixelX(tick.value, viewport, NUMBER_LINE_CANVAS_WIDTH);
                    const isMajor = tick.type === 'major';
                    const tickSize = isMajor ? 30 : 16;
                    const isZero = tick.value === 0;

                    // Stagger labels based on even/odd multiples of step size
                    // Use Math.round to avoid floating point jitter near integer boundaries
                    const stepIndex = Math.round(tick.value / majorStep);
                    // Determine if we should stagger based on parity of the step index
                    const isStaggered = Math.abs(stepIndex) % 2 === 1;

                    return (
                        <g key={`tick-${i}`} className="text-slate-600 dark:text-slate-400 pointer-events-none">
                            <line
                                x1={x}
                                y1={lineY - tickSize / 2}
                                x2={x}
                                y2={lineY + tickSize / 2}
                                stroke="currentColor"
                                strokeWidth={isZero ? 4 : (isMajor ? 2 : 1)}
                            />
                            {isMajor && showLabels && (
                                <text
                                    x={x}
                                    y={lineY + 45 + (isStaggered ? 20 : 0)}
                                    textAnchor="middle"
                                    className="text-base font-medium fill-current"
                                >
                                    {formatTickLabel(tick.value)}
                                </text>
                            )}
                        </g>
                    );
                })
            }

            {/* Jump Arcs */}
            {
                arcs.map((arc, i) => {
                    const fromP = points.find(p => p.id === arc.fromId);
                    const toP = points.find(p => p.id === arc.toId);
                    if (!fromP || !toP) return null;

                    const x1 = toPixelX(fromP.value, viewport, NUMBER_LINE_CANVAS_WIDTH);
                    const x2 = toPixelX(toP.value, viewport, NUMBER_LINE_CANVAS_WIDTH);
                    const midX = (x1 + x2) / 2;
                    const dist = Math.abs(x2 - x1);
                    const arcHeight = Math.min(dist / 2, 100);

                    // SVG arc path: M startX startY Q midX (startY - height) endX endY
                    const path = `M ${x1} ${lineY} Q ${midX} ${lineY - arcHeight} ${x2} ${lineY}`;

                    return (
                        <g key={`arc-${i}`} className="text-indigo-500">
                            <path
                                d={path}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                markerEnd="url(#arrowhead)"
                            />
                            {arc.label && (
                                <text
                                    x={midX}
                                    y={lineY - arcHeight - 15}
                                    textAnchor="middle"
                                    className="text-lg font-bold fill-current"
                                >
                                    {arc.label}
                                </text>
                            )}
                        </g>
                    );
                })
            }

            {/* Point Markers */}
            {
                points.map((p) => {
                    const x = toPixelX(p.value, viewport, NUMBER_LINE_CANVAS_WIDTH);
                    const isDragging = dragState?.id === p.id;
                    const isPending = pendingArcStart === p.id;
                    const isAddMode = interactionMode === 'add-arc';

                    return (
                        <g
                            key={p.id}
                            onPointerDown={(e) => {
                                if (isAddMode) {
                                    e.stopPropagation();
                                    onPointClick?.(p.id);
                                } else {
                                    handlePointerDown(e, p.id);
                                }
                            }}
                            onPointerUp={handlePointerUp}
                            className={cn(
                                isAddMode ? "cursor-pointer" : "cursor-move",
                                "group"
                            )}
                            data-testid={`point-${p.id}`}
                        >
                            {/* Highlights (Ring if pending, Glow on hover) */}
                            <circle
                                cx={x}
                                cy={lineY}
                                r={isPending ? 24 : 18}
                                className={cn(
                                    "fill-transparent transition-all duration-200",
                                    !isPending && "group-hover:fill-slate-200/50 dark:group-hover:fill-slate-700/50",
                                    isDragging && "fill-slate-200/80 dark:fill-slate-700/80",
                                    isPending && "fill-amber-400/20 stroke-amber-400 stroke-2 animate-pulse"
                                )}
                            />
                            {/* The Point */}
                            <circle
                                cx={x}
                                cy={lineY}
                                r={10}
                                fill={p.color}
                                className={cn(
                                    "stroke-white dark:stroke-slate-900 stroke-2 transition-transform duration-200",
                                    isPending && "scale-125"
                                )}
                            />
                            {/* Label */}
                            <text
                                x={x}
                                y={lineY - 35}
                                textAnchor="middle"
                                className={cn(
                                    isPending && "fill-amber-600 dark:fill-amber-400 -translate-y-1"
                                )}
                            >
                                {(() => {
                                    if (p.hidden) {
                                        return p.label || "?";
                                    }
                                    if (hideValues) {
                                        return p.label ? p.label : "?";
                                    }
                                    return p.label ? `${p.label} (${formatTickLabel(p.value)})` : formatTickLabel(p.value);
                                })()}
                            </text>
                        </g>
                    );
                })
            }

            {/* Definitions (Arrowheads etc) */}
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-indigo-500" />
                </marker>
            </defs>
        </svg >
    );
}
