import { useCallback, useRef, useState } from 'react';
import { GRID_MODES, getColumnMajorOrder, GridMode } from '../constants';

type DragMode = 'paint' | 'erase';

export function usePercentageGrid() {
    const [gridMode, setGridModeState] = useState<GridMode>('10x10');

    const activeMode = GRID_MODES.find(m => m.id === gridMode) ?? GRID_MODES[0];
    const { cols, rows, totalCells, cellValue } = activeMode;

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

    const setGridMode = useCallback((modeId: GridMode) => {
        if (gridMode === modeId) return;

        const prevConfig = activeMode;
        const nextConfig = GRID_MODES.find(m => m.id === modeId) ?? GRID_MODES[0];

        // Calculate current percentage
        const currentSelectedCount = selectedIndices.size;
        const currentPercentage = currentSelectedCount / prevConfig.totalCells;

        // Calculate new cell count to maintain percentage (floored)
        const nextSelectedCount = Math.floor(currentPercentage * nextConfig.totalCells);

        // Create new selection set (0 to n-1)
        const nextSelectedIndices = new Set<number>();
        for (let i = 0; i < nextSelectedCount; i++) {
            nextSelectedIndices.add(i);
        }

        setSelectedIndices(nextSelectedIndices);
        setGridModeState(modeId);
    }, [gridMode, activeMode, selectedIndices.size]);

    const updateDragging = useCallback((value: boolean) => {
        isDraggingRef.current = value;
        setIsDragging(value);
    }, []);

    const getRectangleBounds = useCallback((startIndex: number, currentIndex: number) => {
        const startRow = Math.floor(startIndex / cols);
        const startCol = startIndex % cols;
        const currentRow = Math.floor(currentIndex / cols);
        const currentCol = currentIndex % cols;

        const rowMin = Math.min(startRow, currentRow);
        const rowMax = Math.max(startRow, currentRow);
        const colMin = Math.min(startCol, currentCol);
        const colMax = Math.max(startCol, currentCol);

        return { rowMin, rowMax, colMin, colMax };
    }, [cols]);

    const getRectangleIndices = useCallback((bounds: { rowMin: number; rowMax: number; colMin: number; colMax: number; }) => {
        const indices: number[] = [];
        for (let row = bounds.rowMin; row <= bounds.rowMax; row += 1) {
            for (let col = bounds.colMin; col <= bounds.colMax; col += 1) {
                indices.push(row * cols + col);
            }
        }
        return indices;
    }, [cols]);

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
    }, [updateDragging]);

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
    }, [getRectangleIndices, getRectangleBounds]);

    const endDrag = useCallback(() => {
        updateDragging(false);
        dragStartIndexRef.current = null;
        dragCurrentIndexRef.current = null;
        setDragPreviewBounds(null);
    }, [updateDragging]);

    const fillPercent = useCallback((percent: number) => {
        const count = Math.max(0, Math.min(totalCells, Math.round((percent / 100) * totalCells)));
        const columnOrder = getColumnMajorOrder(cols, rows);
        const next = new Set<number>(columnOrder.slice(0, count));
        setSelectedIndices(next);
    }, [cols, rows, totalCells]);

    const clear = useCallback(() => {
        setSelectedIndices(new Set());
    }, []);

    const setFromIndices = useCallback((indices: number[]) => {
        const next = new Set<number>();
        indices.forEach(index => {
            if (index >= 0 && index < totalCells) {
                next.add(index);
            }
        });
        setSelectedIndices(next);
    }, [totalCells]);

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

    const percentageDisplay = (() => {
        const value = selectedCount * cellValue;
        // If integer, show as integer. If float, show with necessary decimals (max 1 for 0.5 steps)
        const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
        return `${formatted}%`;
    })();

    const decimalDisplay = (() => {
        const val = (selectedCount * cellValue) / 100;
        // Standard 2 decimals, but if cellValue < 1 (20x10 mode) we might have 3 decimals (e.g. 0.005)
        // If the value has more than 2 decimal places, show 3.
        const needsMorePrecision = val.toString().split('.')[1]?.length > 2;
        return val.toFixed(needsMorePrecision ? 3 : 2);
    })();

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
            return `${selectedCount}/${totalCells}`;
        }
        if (selectedCount === 0) return '0';
        if (selectedCount === totalCells) return '1';
        const divisor = gcd(selectedCount, totalCells);
        const numerator = selectedCount / divisor;
        const denominator = totalCells / divisor;
        return `${numerator}/${denominator}`;
    })();

    const togglePanel = useCallback(() => setShowPanel(prev => !prev), []);
    const toggleShowPercentage = useCallback(() => setShowPercentage(prev => !prev), []);
    const toggleShowDecimal = useCallback(() => setShowDecimal(prev => !prev), []);
    const toggleShowFraction = useCallback(() => setShowFraction(prev => !prev), []);
    const toggleSimplifyFraction = useCallback(() => setSimplifyFraction(prev => !prev), []);

    return {
        gridMode,
        setGridMode,
        cols,
        rows,
        totalCells,
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
