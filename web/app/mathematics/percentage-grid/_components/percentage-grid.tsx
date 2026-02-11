import * as React from 'react';
import { GridSquare } from './grid-square';
import { GRID_SIZE, TOTAL_SQUARES } from '../constants';

interface PercentageGridProps {
    selectedIndices: Set<number>;
    isDragging: boolean;
    onToggle: (index: number) => void;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
}

export function PercentageGrid({
    selectedIndices,
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
        <div
            className="grid gap-1 select-none"
            style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
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
    );
}
