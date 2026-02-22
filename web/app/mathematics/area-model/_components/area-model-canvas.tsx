"use client";

import { useMemo, forwardRef } from 'react';
import { AreaModel, PartialProduct, formatTerm } from '../_lib/area-model-logic';

interface AreaModelCanvasProps {
    model: AreaModel | null;
    products: PartialProduct[][] | null;
    total: string;
    showFactorLabels: boolean;
    showPartialProducts: boolean;
    showTotal: boolean;
    showGridLines: boolean;
    showArray: boolean;
    revealedCells: Set<string>;
    onCellClick: (key: string) => void;
}

export const AreaModelCanvas = forwardRef<SVGSVGElement, AreaModelCanvasProps>(({
    model,
    products,
    total,
    showFactorLabels,
    showPartialProducts,
    showTotal,
    showGridLines,
    showArray,
    revealedCells,
    onCellClick
}, ref) => {
    // Dimensions
    const CELL_WIDTH = 120;
    const CELL_HEIGHT = 80;
    const MARGIN = 40;
    const LABEL_OFFSET = 25;

    const layout = useMemo(() => {
        if (!model || !products) return null;

        const rowCount = model.rowTerms.length;
        const colCount = model.colTerms.length;

        const width = colCount * CELL_WIDTH;
        const height = rowCount * CELL_HEIGHT;

        const viewBoxWidth = width + MARGIN * 2;
        const viewBoxHeight = height + MARGIN * 2 + (showTotal ? 40 : 0);

        return {
            width,
            height,
            viewBoxWidth,
            viewBoxHeight,
            rowCount,
            colCount
        };
    }, [model, products, showTotal]);

    if (!model || !products || !layout) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 m-8">
                <p>Enter factors to visualize the area model</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
            <svg
                ref={ref}
                data-testid="area-model-svg"
                viewBox={`0 0 ${layout.viewBoxWidth} ${layout.viewBoxHeight}`}
                className="max-w-full max-h-full drop-shadow-sm"
                style={{ height: 'auto', width: layout.viewBoxWidth > 800 ? '100%' : layout.viewBoxWidth }}
            >
                <g transform={`translate(${MARGIN}, ${MARGIN})`}>
                    {/* Factor Labels (Rows - Left side) */}
                    {showFactorLabels && model.rowTerms.map((term, i) => (
                        <text
                            key={`row-label-${i}`}
                            data-testid={`factor-label-row-${i}`}
                            x={-LABEL_OFFSET}
                            y={i * CELL_HEIGHT + CELL_HEIGHT / 2}
                            textAnchor="end"
                            dominantBaseline="middle"
                            className="text-sm font-semibold fill-slate-500 dark:fill-slate-400"
                        >
                            {formatTerm(term)}
                        </text>
                    ))}

                    {/* Factor Labels (Cols - Top side) */}
                    {showFactorLabels && model.colTerms.map((term, j) => (
                        <text
                            key={`col-label-${j}`}
                            data-testid={`factor-label-col-${j}`}
                            x={j * CELL_WIDTH + CELL_WIDTH / 2}
                            y={-LABEL_OFFSET}
                            textAnchor="middle"
                            dominantBaseline="auto"
                            className="text-sm font-semibold fill-slate-500 dark:fill-slate-400"
                        >
                            {formatTerm(term)}
                        </text>
                    ))}

                    {/* Cells */}
                    {products.map((row, i) => (
                        row.map((product, j) => {
                            const term = model.rowTerms[i];
                            const colTerm = model.colTerms[j];
                            const isAlgebraic = term.variable || colTerm.variable;
                            const isRevealed = revealedCells.has(`${i}-${j}`);

                            // Color coding for algebra tiles feel
                            // x^2: blue, x: green, 1: amber (simplified)
                            let fillClass = "fill-white dark:fill-slate-800";
                            if (isAlgebraic) {
                                // Determine dominating term type
                                const pTerm = { coefficient: 0, variable: (term.variable || colTerm.variable), exponent: (term.exponent || 0) + (colTerm.exponent || 0) };
                                if (pTerm.exponent === 2) fillClass = "fill-indigo-50 dark:fill-indigo-950/30 stroke-indigo-200 dark:stroke-indigo-800";
                                else if (pTerm.exponent === 1) fillClass = "fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-200 dark:stroke-emerald-800";
                                else fillClass = "fill-amber-50 dark:fill-amber-950/30 stroke-amber-200 dark:stroke-amber-800";
                            }

                            return (
                                <g key={`cell-${i}-${j}`}>
                                    <rect
                                        data-testid={`cell-${i}-${j}`}
                                        x={j * CELL_WIDTH}
                                        y={i * CELL_HEIGHT}
                                        width={CELL_WIDTH}
                                        height={CELL_HEIGHT}
                                        className={`${fillClass} stroke-1 cursor-pointer transition-colors hover:opacity-80`}
                                        onClick={() => onCellClick(`${i}-${j}`)}
                                        stroke="#cbd5e1" // default slate-300
                                    />

                                    {/* Partial Product Label */}
                                    {showPartialProducts && isRevealed && (
                                        <text
                                            data-testid={`product-label-${i}-${j}`}
                                            x={j * CELL_WIDTH + CELL_WIDTH / 2}
                                            y={i * CELL_HEIGHT + CELL_HEIGHT / 2}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            className="text-base font-bold fill-slate-900 dark:fill-slate-100 select-none pointer-events-none"
                                        >
                                            {product.label}
                                        </text>
                                    )}

                                    {/* Discrete Array Dots */}
                                    {showArray && !isAlgebraic && product.numericValue && (
                                        <ArrayOverlay
                                            count={product.numericValue}
                                            width={CELL_WIDTH}
                                            height={CELL_HEIGHT}
                                            x={j * CELL_WIDTH}
                                            y={i * CELL_HEIGHT}
                                            cellId={`${i}-${j}`}
                                        />
                                    )}
                                </g>
                            );
                        })
                    ))}

                    {/* Grid Lines (Internal) */}
                    {showGridLines && (
                        <>
                            {/* Vertical lines */}
                            {Array.from({ length: layout.colCount - 1 }).map((_, j) => (
                                <line
                                    key={`v-line-${j}`}
                                    data-testid={`grid-line-v-${j}`}
                                    x1={(j + 1) * CELL_WIDTH}
                                    y1={0}
                                    x2={(j + 1) * CELL_WIDTH}
                                    y2={layout.height}
                                    className="stroke-slate-300 dark:stroke-slate-600 stroke-1"
                                    strokeDasharray="4 4"
                                />
                            ))}
                            {/* Horizontal lines */}
                            {Array.from({ length: layout.rowCount - 1 }).map((_, i) => (
                                <line
                                    key={`h-line-${i}`}
                                    data-testid={`grid-line-h-${i}`}
                                    x1={0}
                                    y1={(i + 1) * CELL_HEIGHT}
                                    x2={layout.width}
                                    y2={(i + 1) * CELL_HEIGHT}
                                    className="stroke-slate-300 dark:stroke-slate-600 stroke-1"
                                    strokeDasharray="4 4"
                                />
                            ))}
                        </>
                    )}

                    {/* Outer Border */}
                    <rect
                        x={0}
                        y={0}
                        width={layout.width}
                        height={layout.height}
                        fill="none"
                        className="stroke-slate-400 dark:stroke-slate-500 stroke-2 pointer-events-none"
                    />

                    {/* Total Label */}
                    {showTotal && (
                        <text
                            data-testid="total-label"
                            x={layout.width}
                            y={layout.height + 30}
                            textAnchor="end"
                            className="text-lg font-bold fill-indigo-600 dark:fill-indigo-400"
                        >
                            Total: {total}
                        </text>
                    )}
                </g>
            </svg>
        </div>
    );
});

AreaModelCanvas.displayName = 'AreaModelCanvas';

/**
 * Renders a discrete array of dots within a cell.
 * Only practical for small counts. Max 10x10.
 */
function ArrayOverlay({ count, width, height, x, y, cellId }: { count: number, width: number, height: number, x: number, y: number, cellId: string }) {
    // Determine grid for dots based on count aspect ratio or just sqrt
    // For area model, the factors define the grid!
    // But inside a PARTIAL product cell (e.g. 200), we can't show 200 dots.
    // We'll only show dots if count is small (e.g. < 100)
    if (count > 100) return null;

    // We need to know the original factors for this cell to layout dots
    // Let's assume a square-ish layout for simple counts
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    const dotSpacingX = width / (cols + 1);
    const dotSpacingY = height / (rows + 1);

    return (
        <g transform={`translate(${x}, ${y})`}>
            {Array.from({ length: count }).map((_, idx) => {
                const r = Math.floor(idx / cols);
                const c = idx % cols;
                return (
                    <circle
                        key={`dot-${cellId}-${idx}`}
                        data-testid={`array-dot-${cellId}-${idx}`}
                        cx={(c + 1) * dotSpacingX}
                        cy={(r + 1) * dotSpacingY}
                        r={3}
                        className="fill-slate-400/30 dark:fill-slate-500/30 pointer-events-none"
                    />
                );
            })}
        </g>
    );
}
