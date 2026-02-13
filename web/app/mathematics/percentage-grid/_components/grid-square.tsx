import * as React from 'react';
import { cn } from '@/lib/utils';

interface GridSquareProps {
    index: number;
    cols: number;
    selected: boolean;
    onToggle: (index: number) => void;
}

export const GridSquare = React.memo(function GridSquare({
    index,
    cols,
    selected,
    onToggle,
}: GridSquareProps) {
    // Mouse/Pointer interactions are now handled by the parent PercentageGrid component
    // to support touch drag-selection correctly.

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            onToggle(index);
        }

        const keyMap: Record<string, number> = {
            ArrowRight: 1,
            ArrowLeft: -1,
            ArrowDown: cols,
            ArrowUp: -cols,
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
                'w-full h-full border border-slate-200 dark:border-slate-700 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900',
                selected
                    ? 'bg-[var(--color-primary)] border-blue-500'
                    : 'bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800'
            )}
            aria-pressed={selected}
            aria-label={`Square ${index + 1}${selected ? ', selected' : ', not selected'}`}
            data-square-index={index}
            onKeyDown={handleKeyDown}
            style={{ touchAction: 'none' }}
        />
    );
});
