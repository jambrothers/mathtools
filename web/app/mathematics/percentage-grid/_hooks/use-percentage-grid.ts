import { useCallback, useRef, useState } from 'react';
import { GRID_MODES, getColumnMajorOrder, GridMode } from '../constants';

type DragMode = 'paint' | 'erase';

export function usePercentageGrid() {
    const [gridMode, setGridModeState] = useState<GridMode>('10x10');

    const activeMode = GRID_MODES.find(m => m.id === gridMode) ?? GRID_MODES[0];
    const { cols, rows, totalCells, cellValue } = activeMode;

    // Grid 1 State
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

    // Grid 2 State
    const [showSecondGrid, setShowSecondGrid] = useState(false);
    const [selectedIndices2, setSelectedIndices2] = useState<Set<number>>(new Set());
    const [isDragging2, setIsDragging2] = useState(false);
    const isDraggingRef2 = useRef(false);
    const dragModeRef2 = useRef<DragMode>('paint');
    const dragStartIndexRef2 = useRef<number | null>(null);
    const dragCurrentIndexRef2 = useRef<number | null>(null);
    const dragBaseSelectionRef2 = useRef<Set<number>>(new Set());
    const [dragPreviewBounds2, setDragPreviewBounds2] = useState<{
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
    const [showLabels, setShowLabels] = useState(false);

    const setGridMode = useCallback((modeId: GridMode) => {
        if (gridMode === modeId) return;

        const prevConfig = activeMode;
        const nextConfig = GRID_MODES.find(m => m.id === modeId) ?? GRID_MODES[0];

        // Helper to migrate selection for a grid
        const migrateSelection = (indices: Set<number>) => {
            const currentSelectedCount = indices.size;
            const currentPercentage = currentSelectedCount / prevConfig.totalCells;
            const nextSelectedCount = Math.floor(currentPercentage * nextConfig.totalCells);
            const columnOrder = getColumnMajorOrder(nextConfig.cols, nextConfig.rows);
            return new Set<number>(columnOrder.slice(0, nextSelectedCount));
        };

        setSelectedIndices(migrateSelection(selectedIndices));
        setSelectedIndices2(migrateSelection(selectedIndices2));
        setGridModeState(modeId);
    }, [gridMode, activeMode, selectedIndices.size, selectedIndices2.size]);

    const toggleSecondGrid = useCallback(() => {
        setShowSecondGrid(prev => {
            const next = !prev;
            if (!next) {
                // When hiding, clear the second grid
                setSelectedIndices2(new Set());
            }
            return next;
        });
    }, []);

    const updateDragging = useCallback((value: boolean) => {
        isDraggingRef.current = value;
        setIsDragging(value);
    }, []);

    const updateDragging2 = useCallback((value: boolean) => {
        isDraggingRef2.current = value;
        setIsDragging2(value);
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

    // Grid 1 Interactions
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

    // Grid 2 Interactions
    const toggleSquare2 = useCallback((index: number) => {
        setSelectedIndices2(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const startDrag2 = useCallback((index: number) => {
        updateDragging2(true);
        setSelectedIndices2(prev => {
            const next = new Set(prev);
            dragBaseSelectionRef2.current = new Set(prev);
            dragStartIndexRef2.current = index;
            dragCurrentIndexRef2.current = index;
            const shouldErase = next.has(index);
            dragModeRef2.current = shouldErase ? 'erase' : 'paint';
            if (shouldErase) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
        setDragPreviewBounds2(null);
    }, [updateDragging2]);

    const dragEnter2 = useCallback((index: number) => {
        if (!isDraggingRef2.current) return;
        const startIndex = dragStartIndexRef2.current;
        if (startIndex === null) return;
        const mode = dragModeRef2.current;
        dragCurrentIndexRef2.current = index;
        const bounds = getRectangleBounds(startIndex, index);
        const rectIndices = getRectangleIndices(bounds);

        setDragPreviewBounds2(startIndex === index ? null : bounds);
        setSelectedIndices2(() => {
            const base = dragBaseSelectionRef2.current;
            const next = new Set(base);
            if (mode === 'paint') {
                rectIndices.forEach(rectIndex => next.add(rectIndex));
            } else {
                rectIndices.forEach(rectIndex => next.delete(rectIndex));
            }
            return next;
        });
    }, [getRectangleIndices, getRectangleBounds]);

    const endDrag2 = useCallback(() => {
        updateDragging2(false);
        dragStartIndexRef2.current = null;
        dragCurrentIndexRef2.current = null;
        setDragPreviewBounds2(null);
    }, [updateDragging2]);

    const fillPercent = useCallback((percent: number) => {
        const count = Math.max(0, Math.min(totalCells, Math.round((percent / 100) * totalCells)));
        const columnOrder = getColumnMajorOrder(cols, rows);
        const next = new Set<number>(columnOrder.slice(0, count));
        setSelectedIndices(next);
        // Fill only applies to grid 1 as per design to allow "fill 100% then manually fill more on grid 2"
    }, [cols, rows, totalCells]);

    const clear = useCallback(() => {
        setSelectedIndices(new Set());
        setSelectedIndices2(new Set());
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

    const setFromIndices2 = useCallback((indices: number[]) => {
        const next = new Set<number>();
        indices.forEach(index => {
            if (index >= 0 && index < totalCells) {
                next.add(index);
            }
        });
        setSelectedIndices2(next);
    }, [totalCells]);

    const setDisplayOptions = useCallback((options: {
        showPanel?: boolean;
        showPercentage?: boolean;
        showDecimal?: boolean;
        showFraction?: boolean;
        simplifyFraction?: boolean;
        showLabels?: boolean;
        showSecondGrid?: boolean;
    }) => {
        if (typeof options.showPanel === 'boolean') setShowPanel(options.showPanel);
        if (typeof options.showPercentage === 'boolean') setShowPercentage(options.showPercentage);
        if (typeof options.showDecimal === 'boolean') setShowDecimal(options.showDecimal);
        if (typeof options.showFraction === 'boolean') setShowFraction(options.showFraction);
        if (typeof options.simplifyFraction === 'boolean') setSimplifyFraction(options.simplifyFraction);
        if (typeof options.showLabels === 'boolean') setShowLabels(options.showLabels);
        if (typeof options.showSecondGrid === 'boolean') setShowSecondGrid(options.showSecondGrid);
    }, []);

    // FDP Calculations
    // If showing second grid, we sum the selected counts
    // The "Total" is ONE grid (100%), so we can go > 100%
    const totalSelectedCount = selectedIndices.size + (showSecondGrid ? selectedIndices2.size : 0);

    const percentageDisplay = (() => {
        const value = totalSelectedCount * cellValue;
        const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
        return `${formatted}%`;
    })();

    const decimalDisplay = (() => {
        const val = (totalSelectedCount * cellValue) / 100;
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
            return `${totalSelectedCount}/${totalCells}`;
        }
        if (totalSelectedCount === 0) return '0';
        if (totalSelectedCount === totalCells) return '1';

        const divisor = gcd(totalSelectedCount, totalCells);
        // Note: For things like 110/100, this will simplify to 11/10 which is correct
        const numerator = totalSelectedCount / divisor;
        const denominator = totalCells / divisor;

        if (denominator === 1) {
            return numerator.toString();
        }

        return `${numerator}/${denominator}`;
    })();

    const togglePanel = useCallback(() => setShowPanel(prev => !prev), []);
    const toggleShowPercentage = useCallback(() => setShowPercentage(prev => !prev), []);
    const toggleShowDecimal = useCallback(() => setShowDecimal(prev => !prev), []);
    const toggleShowFraction = useCallback(() => setShowFraction(prev => !prev), []);
    const toggleSimplifyFraction = useCallback(() => setSimplifyFraction(prev => !prev), []);
    const toggleShowLabels = useCallback(() => setShowLabels(prev => !prev), []);

    return {
        gridMode,
        setGridMode,
        cols,
        rows,
        totalCells,

        // Grid 1
        selectedIndices,
        dragPreviewBounds,
        isDragging,
        toggleSquare,
        startDrag,
        dragEnter,
        endDrag,

        // Grid 2
        showSecondGrid,
        toggleSecondGrid,
        selectedIndices2,
        dragPreviewBounds2,
        isDragging2,
        toggleSquare2,
        startDrag2,
        dragEnter2,
        endDrag2,

        fillPercent,
        clear,
        setFromIndices,
        setFromIndices2,
        setDisplayOptions,

        selectedCount: totalSelectedCount,
        percentageDisplay,
        decimalDisplay,
        fractionDisplay,

        showPanel,
        showPercentage,
        showDecimal,
        showFraction,
        simplifyFraction,
        showLabels,
        togglePanel,
        toggleShowPercentage,
        toggleShowDecimal,
        toggleShowFraction,
        toggleSimplifyFraction,
        toggleShowLabels,
    };
}
