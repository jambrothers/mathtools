import { useCallback, useRef, useState } from 'react';
import { COLUMN_MAJOR_ORDER, GRID_SIZE, TOTAL_SQUARES } from '../constants';

type DragMode = 'paint' | 'erase';

export function usePercentageGrid() {
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);
    const dragModeRef = useRef<DragMode>('paint');
    const dragStartIndexRef = useRef<number | null>(null);
    const dragCurrentIndexRef = useRef<number | null>(null);
    const dragBaseSelectionRef = useRef<Set<number>>(new Set());
    const [dragPreviewBounds, setDragPreviewBounds] = useState<{
        rowMin: number;
        rowMax: number;
        colMin: number;
        colMax: number;
    } | null>(null);
    const [showPanel, setShowPanel] = useState(true);
    const [showPercentage, setShowPercentage] = useState(false);
    const [showDecimal, setShowDecimal] = useState(false);
    const [showFraction, setShowFraction] = useState(false);
    const [simplifyFraction, setSimplifyFraction] = useState(false);

    const updateDragging = useCallback((value: boolean) => {
        isDraggingRef.current = value;
        setIsDragging(value);
    }, []);

    const getRectangleBounds = useCallback((startIndex: number, currentIndex: number) => {
        const startRow = Math.floor(startIndex / GRID_SIZE);
        const startCol = startIndex % GRID_SIZE;
        const currentRow = Math.floor(currentIndex / GRID_SIZE);
        const currentCol = currentIndex % GRID_SIZE;

        const rowMin = Math.min(startRow, currentRow);
        const rowMax = Math.max(startRow, currentRow);
        const colMin = Math.min(startCol, currentCol);
        const colMax = Math.max(startCol, currentCol);

        return { rowMin, rowMax, colMin, colMax };
    }, []);

    const getRectangleIndices = useCallback((bounds: { rowMin: number; rowMax: number; colMin: number; colMax: number; }) => {
        const indices: number[] = [];
        for (let row = bounds.rowMin; row <= bounds.rowMax; row += 1) {
            for (let col = bounds.colMin; col <= bounds.colMax; col += 1) {
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
            dragCurrentIndexRef.current = index;
            const shouldErase = next.has(index);
            dragModeRef.current = shouldErase ? 'erase' : 'paint';
            if (shouldErase) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
        setDragPreviewBounds(null);
    }, [getRectangleBounds, updateDragging]);

    const dragEnter = useCallback((index: number) => {
        if (!isDraggingRef.current) return;
        const startIndex = dragStartIndexRef.current;
        if (startIndex === null) return;
        const mode = dragModeRef.current;
        dragCurrentIndexRef.current = index;
        const bounds = getRectangleBounds(startIndex, index);
        const rectIndices = getRectangleIndices(bounds);

        setDragPreviewBounds(startIndex === index ? null : bounds);
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
        dragCurrentIndexRef.current = null;
        setDragPreviewBounds(null);
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

    const setDisplayOptions = useCallback((options: {
        showPanel?: boolean;
        showPercentage?: boolean;
        showDecimal?: boolean;
        showFraction?: boolean;
        simplifyFraction?: boolean;
    }) => {
        if (typeof options.showPanel === 'boolean') setShowPanel(options.showPanel);
        if (typeof options.showPercentage === 'boolean') setShowPercentage(options.showPercentage);
        if (typeof options.showDecimal === 'boolean') setShowDecimal(options.showDecimal);
        if (typeof options.showFraction === 'boolean') setShowFraction(options.showFraction);
        if (typeof options.simplifyFraction === 'boolean') setSimplifyFraction(options.simplifyFraction);
    }, []);

    const selectedCount = selectedIndices.size;
    const percentageDisplay = `${selectedCount}%`;
    const decimalDisplay = (selectedCount / 100).toFixed(2);

    const gcd = (a: number, b: number): number => {
        let x = Math.abs(a);
        let y = Math.abs(b);
        while (y !== 0) {
            const temp = x % y;
            x = y;
            y = temp;
        }
        return x;
    };

    const fractionDisplay = (() => {
        if (!simplifyFraction) {
            return `${selectedCount}/100`;
        }
        if (selectedCount === 0) return '0';
        if (selectedCount === 100) return '1';
        const divisor = gcd(selectedCount, 100);
        const numerator = selectedCount / divisor;
        const denominator = 100 / divisor;
        return `${numerator}/${denominator}`;
    })();

    const togglePanel = useCallback(() => setShowPanel(prev => !prev), []);
    const toggleShowPercentage = useCallback(() => setShowPercentage(prev => !prev), []);
    const toggleShowDecimal = useCallback(() => setShowDecimal(prev => !prev), []);
    const toggleShowFraction = useCallback(() => setShowFraction(prev => !prev), []);
    const toggleSimplifyFraction = useCallback(() => setSimplifyFraction(prev => !prev), []);

    return {
        selectedIndices,
        dragPreviewBounds,
        isDragging,
        toggleSquare,
        startDrag,
        dragEnter,
        endDrag,
        fillPercent,
        clear,
        setFromIndices,
        setDisplayOptions,
        selectedCount,
        percentageDisplay,
        decimalDisplay,
        fractionDisplay,
        showPanel,
        showPercentage,
        showDecimal,
        showFraction,
        simplifyFraction,
        togglePanel,
        toggleShowPercentage,
        toggleShowDecimal,
        toggleShowFraction,
        toggleSimplifyFraction,
    };
}
