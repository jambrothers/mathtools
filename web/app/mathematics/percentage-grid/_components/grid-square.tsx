import * as React from 'react';
import { cn } from '@/lib/utils';

interface GridSquareProps {
    index: number;
    selected: boolean;
    isDragging: boolean;
    onToggle: (index: number) => void;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
}

export const GridSquare = React.memo(function GridSquare({
    index,
    selected,
    isDragging,
    onToggle,
    onDragStart,
    onDragEnter,
    onDragEnd,
}: GridSquareProps) {
    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        onDragStart(index);
    };

    const handleMouseEnter = () => {
        if (isDragging) {
            onDragEnter(index);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            onToggle(index);
        }

        const keyMap: Record<string, number> = {
            ArrowRight: 1,
            ArrowLeft: -1,
            ArrowDown: 10,
            ArrowUp: -10,
        };

        const delta = keyMap[event.key];
        if (delta === undefined) return;

        event.preventDefault();
        const nextIndex = index + delta;
        const nextEl = document.querySelector<HTMLButtonElement>(`[data-square-index="${nextIndex}"]`);
        nextEl?.focus();
    };

    return (
        <button
            type="button"
            className={cn(
                'h-7 w-7 sm:h-8 sm:w-8 border border-slate-200 dark:border-slate-700 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900',
                selected
                    ? 'bg-[var(--color-primary)] border-blue-500'
                    : 'bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800'
            )}
            aria-pressed={selected}
            aria-label={`Square ${index + 1}${selected ? ', selected' : ', not selected'}`}
            data-square-index={index}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseUp={onDragEnd}
            onKeyDown={handleKeyDown}
        />
    );
});
