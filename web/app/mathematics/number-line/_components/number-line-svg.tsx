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
    interactionMode: 'default' | 'add-arc' | 'add-point' | 'delete-point';
    pendingArcStart: string | null;
    onPointMove?: (id: string, newValue: number) => void;
    onPointClick?: (id: string) => void;
    onLineClick?: (newValue: number) => void;
    onZoom?: (focalPoint: number, factor: number) => void;
    onPan?: (delta: number) => void;
    onAddArc?: (fromId: string, toId: string) => void;
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
    onZoom,
    onPan,
    onAddArc
}: NumberLineSVGProps) {
    const svgRef = React.useRef<SVGSVGElement>(null);

    type DragState =
        | { type: 'point-intent', id: string, startX: number, startY: number, hasMoved: boolean }
        | { type: 'point-move', id: string }
        | { type: 'arc-create', fromId: string, currentX: number }
        | { type: 'pan', lastX: number };

    const [dragState, setDragState] = React.useState<DragState | null>(null);
    const [hoveredPoint, setHoveredPoint] = React.useState<string | null>(null);

    const ticks = React.useMemo(() => calculateTicks(viewport), [viewport]);

    // Calculate major step size for stable label staggering
    const majorTicks = ticks.filter(t => t.type === 'major');
    const majorStep = majorTicks.length > 1 ? majorTicks[1].value - majorTicks[0].value : 1;

    // Heuristic: Should we stagger labels to prevent overlap?
    const shouldStagger = React.useMemo(() => {
        if (!showLabels || majorTicks.length === 0) return false;

        // Find the longest label text
        const longestLabel = majorTicks.reduce((max, tick) => {
            const label = formatTickLabel(tick.value);
            return label.length > max.length ? label : max;
        }, "");

        // Estimated pixel width (approx 10px per char for text-base to be safe)
        const estLabelWidth = longestLabel.length * 10;

        // Pixels between major ticks
        const pixelsPerTick = Math.abs(toPixelX(majorTicks[0].value + majorStep, viewport, NUMBER_LINE_CANVAS_WIDTH) - toPixelX(majorTicks[0].value, viewport, NUMBER_LINE_CANVAS_WIDTH));

        // Stagger if labels would take up > 70% of available horizontal space
        return estLabelWidth > (pixelsPerTick * 0.7);
    }, [majorTicks, majorStep, showLabels, viewport]);

    const centerY = NUMBER_LINE_CANVAS_HEIGHT / 2;
    const lineY = centerY;

    const getGraphX = (clientX: number) => {
        if (!svgRef.current) return 0;
        const rect = svgRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * NUMBER_LINE_CANVAS_WIDTH;
        return fromPixelX(x, viewport, NUMBER_LINE_CANVAS_WIDTH);
    };

    const handleLineClickEvent = (e: React.MouseEvent) => {
        if (interactionMode !== 'add-point' || !onLineClick || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * NUMBER_LINE_CANVAS_WIDTH;
        const value = fromPixelX(x, viewport, NUMBER_LINE_CANVAS_WIDTH);
        onLineClick(value);
    };

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.stopPropagation();
        setDragState({ type: 'point-intent', id, startX: e.clientX, startY: e.clientY, hasMoved: false });
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragState) return;

        if (dragState.type === 'pan') {
            if (!onPan || !svgRef.current) return;
            // Calculate pixel difference
            const dxPixels = dragState.lastX - e.clientX;
            const rect = svgRef.current.getBoundingClientRect();
            // Convert to graph units
            const range = viewport.max - viewport.min;
            const dxGraph = (dxPixels / rect.width) * range;

            onPan(dxGraph);
            setDragState({ type: 'pan', lastX: e.clientX });
            return;
        }

        const newValue = getGraphX(e.clientX);

        if (dragState.type === 'point-intent') {
            const dx = Math.abs(e.clientX - dragState.startX);
            const dy = Math.abs(e.clientY - dragState.startY);

            if (dy > 20 && interactionMode === 'default') {
                // Pulled up/down significantly -> create arc
                setDragState({ type: 'arc-create', fromId: dragState.id, currentX: newValue });
            } else if (dx > 10 || dy > 10) {
                // Moved laterally or generally -> move point
                setDragState({ type: 'point-move', id: dragState.id });
                if (onPointMove) onPointMove(dragState.id, newValue);
            }
            return;
        }

        if (dragState.type === 'point-move') {
            if (onPointMove) onPointMove(dragState.id, newValue);
        } else if (dragState.type === 'arc-create') {
            setDragState({ ...dragState, currentX: newValue });
        }
    };

    const handlePointerUp = () => {
        if (dragState?.type === 'arc-create' && hoveredPoint && hoveredPoint !== dragState.fromId) {
            onAddArc?.(dragState.fromId, hoveredPoint);
        } else if (dragState?.type === 'point-intent' && !dragState.hasMoved) {
            // If we didn't move it at all, it was a click
            if (interactionMode === 'delete-point' || interactionMode === 'add-arc') {
                onPointClick?.(dragState.id);
            }
        }
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
            className={cn(
                "w-full h-full touch-none select-none bg-white dark:bg-slate-900 outline-none",
                interactionMode === 'add-point' && "cursor-crosshair",
                interactionMode === 'delete-point' && "cursor-pointer"
            )}
            onPointerMove={handlePointerMove}
            onWheel={handleWheel}
            onClick={(e) => {
                // If in add-point mode, and NOT clicking on an existing point/arc
                // (points/arcs stop propagation, so we only get here if clicking "line" or background)
                if (interactionMode === 'add-point' && onLineClick) {
                    handleLineClickEvent(e);
                }
            }}
            data-testid="number-line-svg"
        >
            <rect
                data-testid="number-line-hit-area"
                x={0}
                y={0}
                width={NUMBER_LINE_CANVAS_WIDTH}
                height={NUMBER_LINE_CANVAS_HEIGHT}
                fill="transparent"
                onPointerDown={(e) => {
                    // Start panning if in default mode
                    if (interactionMode === 'default' || interactionMode === 'add-point') {
                        (e.target as Element).setPointerCapture(e.pointerId);
                        setDragState({ type: 'pan', lastX: e.clientX });
                    }
                }}
                onPointerUp={() => setDragState(null)}
                className={interactionMode === 'default' ? "cursor-grab active:cursor-grabbing" : ""}
            />
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
                    // User requested: "evens further down", "odds closer"
                    const stepIndex = Math.round(tick.value / majorStep);
                    // Standard height (closer) for ODDS (isStaggered = false)
                    // Lower height (further) for EVENS (isStaggered = true)
                    const isStaggered = shouldStagger && (Math.abs(stepIndex) % 2 === 0);

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
                    const arcHeight = Math.min(dist / 2, 80);

                    const isNegative = toP.value < fromP.value;

                    // Arc height adjustment for negative (below line)
                    const yOffset = isNegative ? arcHeight : -arcHeight;
                    const labelOffset = isNegative ? 40 : -15;

                    // SVG arc path: M startX startY Q midX (startY + yOffset) endX endY
                    const path = `M ${x1} ${lineY} Q ${midX} ${lineY + yOffset} ${x2} ${lineY}`;

                    return (
                        <g key={`arc-${i}`} className="text-indigo-500 pointer-events-none">
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
                                    y={lineY + yOffset + labelOffset}
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

            {/* Dynamic Arc being created */}
            {dragState?.type === 'arc-create' && (() => {
                const fromP = points.find(p => p.id === dragState.fromId);
                if (!fromP) return null;
                const x1 = toPixelX(fromP.value, viewport, NUMBER_LINE_CANVAS_WIDTH);
                const x2 = toPixelX(dragState.currentX, viewport, NUMBER_LINE_CANVAS_WIDTH);

                const midX = (x1 + x2) / 2;
                const dist = Math.abs(x2 - x1);
                const arcHeight = Math.min(dist / 2, 80);
                const isNegative = dragState.currentX < fromP.value;
                const yOffset = isNegative ? arcHeight : -arcHeight;
                const path = `M ${x1} ${lineY} Q ${midX} ${lineY + yOffset} ${x2} ${lineY}`;

                return (
                    <g className="text-indigo-400 pointer-events-none opacity-50">
                        <path
                            d={path}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            markerEnd="url(#arrowhead)"
                        />
                    </g>
                );
            })()}

            {/* Point Markers */}
            {
                points.map((p) => {
                    const x = toPixelX(p.value, viewport, NUMBER_LINE_CANVAS_WIDTH);
                    const isDragging = dragState?.type === 'point-move' && dragState.id === p.id;
                    const isPending = pendingArcStart === p.id || (dragState?.type === 'arc-create' && dragState.fromId === p.id);
                    const isInteraction = interactionMode === 'add-arc' || interactionMode === 'delete-point';
                    const isArcTarget = dragState?.type === 'arc-create' && hoveredPoint === p.id;

                    return (
                        <g
                            key={p.id}
                            onPointerDown={(e) => {
                                handlePointerDown(e, p.id);
                            }}
                            onPointerUp={handlePointerUp}
                            onPointerEnter={() => setHoveredPoint(p.id)}
                            onPointerLeave={() => setHoveredPoint(null)}
                            className={cn(
                                isInteraction ? "cursor-pointer" : "cursor-move",
                                "group"
                            )}
                            data-testid={`point-${p.id}`}
                        >
                            {/* Highlights (Ring if pending, Glow on hover) */}
                            <circle
                                cx={x}
                                cy={lineY}
                                r={isPending ? 24 : 32} // Increased grab area from 18 to 32
                                className={cn(
                                    "fill-transparent transition-all duration-200 cursor-pointer",
                                    !isPending && "group-hover:fill-slate-200/50 dark:group-hover:fill-slate-700/50",
                                    isDragging && "fill-slate-200/80 dark:fill-slate-700/80",
                                    isPending && "fill-amber-400/20 stroke-amber-400 stroke-2 animate-pulse",
                                    isArcTarget && "fill-indigo-400/30 stroke-indigo-400 stroke-2"
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
