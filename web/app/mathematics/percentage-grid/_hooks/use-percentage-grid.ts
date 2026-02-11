import { useCallback, useRef, useState } from 'react';
import { COLUMN_MAJOR_ORDER, GRID_SIZE, TOTAL_SQUARES } from '../constants';

type DragMode = 'paint' | 'erase';

export function usePercentageGrid() {
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);
    const dragModeRef = useRef<DragMode>('paint');
    const dragStartIndexRef = useRef<number | null>(null);
    const dragBaseSelectionRef = useRef<Set<number>>(new Set());

    const updateDragging = useCallback((value: boolean) => {
        isDraggingRef.current = value;
        setIsDragging(value);
    }, []);

    const getRectangleIndices = useCallback((startIndex: number, currentIndex: number) => {
        const startRow = Math.floor(startIndex / GRID_SIZE);
        const startCol = startIndex % GRID_SIZE;
        const currentRow = Math.floor(currentIndex / GRID_SIZE);
        const currentCol = currentIndex % GRID_SIZE;

        const rowMin = Math.min(startRow, currentRow);
        const rowMax = Math.max(startRow, currentRow);
        const colMin = Math.min(startCol, currentCol);
        const colMax = Math.max(startCol, currentCol);

        const indices: number[] = [];
        for (let row = rowMin; row <= rowMax; row += 1) {
            for (let col = colMin; col <= colMax; col += 1) {
                indices.push(row * GRID_SIZE + col);
            }
        }
        return indices;
    }, []);

    const toggleSquare = useCallback((index: number) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const startDrag = useCallback((index: number) => {
        updateDragging(true);
        setSelectedIndices(prev => {
            const next = new Set(prev);
            dragBaseSelectionRef.current = new Set(prev);
            dragStartIndexRef.current = index;
            const shouldErase = next.has(index);
            dragModeRef.current = shouldErase ? 'erase' : 'paint';
            if (shouldErase) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, [updateDragging]);

    const dragEnter = useCallback((index: number) => {
        if (!isDraggingRef.current) return;
        const startIndex = dragStartIndexRef.current;
        if (startIndex === null) return;
        const mode = dragModeRef.current;
        const rectIndices = getRectangleIndices(startIndex, index);

        setSelectedIndices(() => {
            const base = dragBaseSelectionRef.current;
            const next = new Set(base);
            if (mode === 'paint') {
                rectIndices.forEach(rectIndex => next.add(rectIndex));
            } else {
                rectIndices.forEach(rectIndex => next.delete(rectIndex));
            }
            return next;
        });
    }, [getRectangleIndices]);

    const endDrag = useCallback(() => {
        updateDragging(false);
        dragStartIndexRef.current = null;
    }, [updateDragging]);

    const fillPercent = useCallback((percent: number) => {
        const count = Math.max(0, Math.min(TOTAL_SQUARES, Math.round((percent / 100) * TOTAL_SQUARES)));
        const next = new Set<number>(COLUMN_MAJOR_ORDER.slice(0, count));
        setSelectedIndices(next);
    }, []);

    const clear = useCallback(() => {
        setSelectedIndices(new Set());
    }, []);

    const setFromIndices = useCallback((indices: number[]) => {
        const next = new Set<number>();
        indices.forEach(index => {
            if (index >= 0 && index < TOTAL_SQUARES) {
                next.add(index);
            }
        });
        setSelectedIndices(next);
    }, []);

    return {
        selectedIndices,
        isDragging,
        toggleSquare,
        startDrag,
        dragEnter,
        endDrag,
        fillPercent,
        clear,
        setFromIndices,
    };
}
