import * as React from 'react';
import { GridSquare } from './grid-square';
import { GRID_SIZE, TOTAL_SQUARES } from '../constants';

interface PercentageGridProps {
    selectedIndices: Set<number>;
    dragPreviewBounds: { rowMin: number; rowMax: number; colMin: number; colMax: number } | null;
    isDragging: boolean;
    onToggle: (index: number) => void;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
}

export function PercentageGrid({
    selectedIndices,
    dragPreviewBounds,
    isDragging,
    onToggle,
    onDragStart,
    onDragEnter,
    onDragEnd,
}: PercentageGridProps) {
    React.useEffect(() => {
        const handleMouseUp = () => onDragEnd();
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [onDragEnd]);

    return (
        <div className="relative">
            <div
                className="grid gap-1 select-none"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                }}
                role="grid"
                aria-label="Percentage grid"
            >
                {Array.from({ length: TOTAL_SQUARES }, (_, index) => (
                    <GridSquare
                        key={index}
                        index={index}
                        selected={selectedIndices.has(index)}
                        isDragging={isDragging}
                        onToggle={onToggle}
                        onDragStart={onDragStart}
                        onDragEnter={onDragEnter}
                        onDragEnd={onDragEnd}
                    />
                ))}
            </div>

            {dragPreviewBounds && (
                <div
                    className="absolute inset-0 pointer-events-none grid gap-1"
                    style={{
                        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
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
    );
}
