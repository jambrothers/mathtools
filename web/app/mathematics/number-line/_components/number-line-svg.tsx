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
    interactionMode: 'default' | 'add-arc';
    pendingArcStart: string | null;
    onPointMove?: (id: string, newValue: number) => void;
    onPointClick?: (id: string) => void;
    onZoom?: (focalPoint: number, factor: number) => void;
}

export function NumberLineSVG({
    viewport,
    points,
    arcs,
    showLabels,
    hideValues,
    interactionMode,
    pendingArcStart,
    onPointMove,
    onPointClick,
    onZoom
}: NumberLineSVGProps) {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [dragState, setDragState] = React.useState<{ id: string } | null>(null);

    const ticks = React.useMemo(() => calculateTicks(viewport), [viewport]);

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
            {/* Main Axis Line */}
            <line
                x1={0}
                y1={lineY}
                x2={NUMBER_LINE_CANVAS_WIDTH}
                y2={lineY}
                stroke="currentColor"
                strokeWidth={2}
                className="text-slate-400 dark:text-slate-600"
            />

            {/* Ticks and Labels */}
            {ticks.map((tick, i) => {
                const x = toPixelX(tick.value, viewport, NUMBER_LINE_CANVAS_WIDTH);
                const isMajor = tick.type === 'major';
                const tickSize = isMajor ? 20 : 10;
                const isZero = tick.value === 0;

                return (
                    <g key={`tick-${i}`} className="text-slate-600 dark:text-slate-400">
                        <line
                            x1={x}
                            y1={lineY - tickSize / 2}
                            x2={x}
                            y2={lineY + tickSize / 2}
                            stroke="currentColor"
                            strokeWidth={isZero ? 3 : (isMajor ? 2 : 1)}
                        />
                        {isMajor && showLabels && (
                            <text
                                x={x}
                                y={lineY + 30}
                                textAnchor="middle"
                                className="text-xs font-medium fill-current"
                            >
                                {formatTickLabel(tick.value)}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Jump Arcs */}
            {arcs.map((arc, i) => {
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
                                y={lineY - arcHeight - 10}
                                textAnchor="middle"
                                className="text-sm font-bold fill-current"
                            >
                                {arc.label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Point Markers */}
            {points.map((p) => {
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
                            r={isPending ? 15 : 12}
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
                            r={6}
                            fill={p.color}
                            className={cn(
                                "stroke-white dark:stroke-slate-900 stroke-2 transition-transform duration-200",
                                isPending && "scale-125"
                            )}
                        />
                        {/* Label */}
                        <text
                            x={x}
                            y={lineY - 25}
                            textAnchor="middle"
                            className={cn(
                                "text-sm font-bold fill-slate-900 dark:fill-slate-100 transition-all",
                                isPending && "fill-amber-600 dark:fill-amber-400 -translate-y-1"
                            )}
                        >
                            {hideValues ? (p.label ? p.label : "?") : (p.label ? `${p.label} (${formatTickLabel(p.value)})` : formatTickLabel(p.value))}
                        </text>
                    </g>
                );
            })}

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
        </svg>
    );
}
