import * as React from 'react';
import { GridSquare } from './grid-square';


interface PercentageGridProps {
    selectedIndices: Set<number>;
    dragPreviewBounds: { rowMin: number; rowMax: number; colMin: number; colMax: number } | null;
    isDragging: boolean;
    rows: number;
    cols: number;
    totalCells: number;
    showLabels: boolean;
    onToggle: (index: number) => void;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
}

export function PercentageGrid({
    selectedIndices,
    dragPreviewBounds,
    isDragging,
    rows,
    cols,
    totalCells,
    showLabels,
    onToggle,
    onDragStart,
    onDragEnter,
    onDragEnd,
}: PercentageGridProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const lastProcessedIndex = React.useRef<number | null>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Prevent default to avoid potential scrolling or selection issues
        // (though touch-action: none should handle most of it)

        // Find the square under the pointer
        // We can use the event target if it's correct, or look up via index
        const target = e.target as HTMLElement;
        const squareElement = target.closest('[data-square-index]');

        if (squareElement) {
            e.preventDefault();
            const indexStr = squareElement.getAttribute('data-square-index');
            if (indexStr !== null) {
                const index = parseInt(indexStr, 10);
                onDragStart(index);
                lastProcessedIndex.current = index;

                // Capture the pointer so we receive events even if the pointer moves outside
                // the initial square or even the grid container
                e.currentTarget.setPointerCapture(e.pointerId);
            }
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;

        // With pointer capture, the target is always the captured element (container).
        // So we MUST use elementFromPoint to find what's under the cursor.
        const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
        const squareElement = elementUnderCursor?.closest('[data-square-index]');

        if (squareElement) {
            const indexStr = squareElement.getAttribute('data-square-index');
            if (indexStr !== null) {
                const index = parseInt(indexStr, 10);
                if (index !== lastProcessedIndex.current) {
                    onDragEnter(index);
                    lastProcessedIndex.current = index;
                }
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging) {
            onDragEnd();
            lastProcessedIndex.current = null;
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {showLabels && (
                <>
                    {/* Column labels */}
                    <div
                        data-testid="column-labels"
                        className="absolute left-0 right-0 grid gap-1"
                        style={{
                            top: '-24px',
                            height: '20px',
                            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
                        }}
                    >
                        {Array.from({ length: cols }, (_, i) => (
                            <span key={i} className="flex items-center justify-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                {i + 1}
                            </span>
                        ))}
                    </div>

                    {/* Row labels */}
                    <div
                        data-testid="row-labels"
                        className="absolute top-0 bottom-0 grid gap-1"
                        style={{
                            left: '-24px',
                            width: '20px',
                            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
                        }}
                    >
                        {Array.from({ length: rows }, (_, i) => (
                            <span key={i} className="flex items-center justify-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                {i + 1}
                            </span>
                        ))}
                    </div>
                </>
            )}

            <div
                ref={containerRef}
                className="grid gap-1 select-none w-full h-full"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                    touchAction: 'none'
                }}
                role="grid"
                aria-label="Percentage grid"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                {Array.from({ length: totalCells }, (_, index) => (
                    <GridSquare
                        key={index}
                        index={index}
                        cols={cols}
                        selected={selectedIndices.has(index)}
                        onToggle={onToggle}
                    />
                ))}

                {dragPreviewBounds && (
                    <div
                        className="absolute inset-0 pointer-events-none grid gap-1 w-full h-full"
                        style={{
                            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                        }}
                        data-testid="drag-preview-overlay"
                    >
                        <div
                            className="border-2 border-blue-400 rounded-sm"
                            style={{
                                gridColumnStart: dragPreviewBounds.colMin + 1,
                                gridColumnEnd: dragPreviewBounds.colMax + 2,
                                gridRowStart: dragPreviewBounds.rowMin + 1,
                                gridRowEnd: dragPreviewBounds.rowMax + 2,
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
