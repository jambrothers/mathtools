import React from 'react';
import { ShadedSegment, LabelMode } from '../_lib/url-state';
import { SVG_COLORS, SVG_SHADED_COLORS } from '../constants';
import { fractionToDecimal, fractionToPercent, getShadedCount } from '../_lib/fraction-wall';

interface FractionWallSVGProps {
    visibleDenominators: number[];
    shadedSegments: ShadedSegment[];
    labelMode: LabelMode;
    showEquivalenceLines: boolean;
    comparisonPair: [ShadedSegment, ShadedSegment] | null;
    onSegmentClick: (d: number, i: number) => void;
}

export function FractionWallSVG({
    visibleDenominators,
    shadedSegments,
    labelMode,
    showEquivalenceLines,
    comparisonPair,
    onSegmentClick
}: FractionWallSVGProps) {
    const sortedDenominators = [...visibleDenominators].sort((a, b) => a - b);
    const rowHeight = 60;
    const width = 1000;
    const height = sortedDenominators.length * rowHeight;
    const padding = 20;
    const rightMargin = 120; // Space for row totals

    const isShaded = (d: number, i: number) =>
        shadedSegments.some(s => s.d === d && s.i === i);

    const isComparing = (d: number, i: number) =>
        comparisonPair?.some(s => s.d === d && s.i === i);

    const getLabel = (n: number, d: number) => {
        if (labelMode === 'none') return '';
        if (labelMode === 'decimal') return fractionToDecimal(n, d);
        if (labelMode === 'percent') return fractionToPercent(n, d);
        return `${n}/${d}`;
    };

    return (
        <svg
            viewBox={`0 0 ${width + padding * 2 + rightMargin} ${height + padding * 2}`}
            className="w-full h-auto select-none"
            data-testid="fraction-wall-svg"
        >
            <g transform={`translate(${padding}, ${padding})`}>
                {sortedDenominators.map((d, rowIndex) => {
                    const segmentWidth = width / d;
                    const shadedCount = getShadedCount(d, shadedSegments);

                    return (
                        <g key={d} transform={`translate(0, ${rowIndex * rowHeight})`}>
                            {/* Row Segments */}
                            {Array.from({ length: d }).map((_, i) => {
                                const shaded = isShaded(d, i);
                                const comparing = isComparing(d, i);
                                return (
                                    <g key={i} transform={`translate(${i * segmentWidth}, 0)`}
                                        onClick={() => onSegmentClick(d, i)}
                                        className="cursor-pointer group"
                                    >
                                        <rect
                                            width={segmentWidth}
                                            height={rowHeight}
                                            fill={shaded ? SVG_SHADED_COLORS[d] : SVG_COLORS[d]}
                                            stroke="currentColor"
                                            strokeWidth="1"
                                            className="text-slate-300 dark:text-slate-700 hover:opacity-80 transition-opacity"
                                        />
                                        {comparing && (
                                            <rect
                                                x="2"
                                                y="2"
                                                width={segmentWidth - 4}
                                                height={rowHeight - 4}
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="3"
                                                strokeDasharray="5,3"
                                                className="pointer-events-none"
                                            />
                                        )}
                                        <text
                                            x={segmentWidth / 2}
                                            y={rowHeight / 2}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            className={`text-sm font-medium pointer-events-none ${shaded ? 'fill-white' : 'fill-slate-600 dark:fill-slate-400'
                                                }`}
                                        >
                                            {getLabel(i + 1, d)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Row Total Annotation */}
                            {shadedCount > 0 && (
                                <text
                                    x={width + 20}
                                    y={rowHeight / 2}
                                    dominantBaseline="middle"
                                    className="text-lg font-bold fill-slate-900 dark:fill-slate-100"
                                    data-testid={`row-total-${d}`}
                                >
                                    {getLabel(shadedCount, d)}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Equivalence Lines */}
                {showEquivalenceLines && shadedSegments.length > 0 && (
                    <g className="pointer-events-none">
                        {Array.from(new Set(shadedSegments.map(s => (s.i + 1) / s.d))).map(x => (
                            <line
                                key={x}
                                x1={x * width}
                                y1={0}
                                x2={x * width}
                                y2={height}
                                stroke="var(--color-primary)"
                                strokeWidth="2"
                                strokeDasharray="4,2"
                            />
                        ))}
                    </g>
                )}
            </g>
        </svg>
    );
}
