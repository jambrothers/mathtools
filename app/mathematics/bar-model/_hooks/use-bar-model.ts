"use client"

/**
 * Custom hook for managing bar model state.
 *
 * Handles bar CRUD, selection, operations (clone, join, split),
 * and integrates with useHistory for undo functionality.
 */

import { useState, useCallback } from "react"
import { useHistory } from "@/lib/hooks/use-history"
import {
    GRID_SIZE,
    DEFAULT_BAR_WIDTH,
    MIN_BAR_WIDTH,
    BAR_HEIGHT,
} from "../constants"

// =============================================================================
// Types
// =============================================================================

export interface BarData {
    /** Unique identifier */
    id: string;
    /** X position in pixels (snapped to grid) */
    x: number;
    /** Y position in pixels (snapped to grid) */
    y: number;
    /** Width in pixels (snapped to grid) */
    width: number;
    /** Index into BAR_COLORS array */
    colorIndex: number;
    /** Display label */
    label: string;
}

export interface UseBarModelReturn {
    // State
    bars: BarData[];
    selectedIds: Set<string>;

    // Bar CRUD
    addBar: (x: number, y: number, colorIndex: number, label: string) => BarData;
    deleteBar: (id: string) => void;
    deleteSelected: () => void;
    updateBar: (id: string, updates: Partial<BarData>) => void;
    updateBarLabel: (id: string, label: string) => void;

    // Movement/Resize
    moveBar: (id: string, x: number, y: number) => void;
    moveSelected: (dx: number, dy: number) => void;
    resizeBar: (id: string, width: number) => void;

    // Selection
    selectBar: (id: string, additive?: boolean) => void;
    selectBars: (ids: string[]) => void;
    clearSelection: () => void;
    selectInRect: (rect: DOMRect) => void;

    // Operations
    cloneSelected: () => void;
    joinSelected: () => void;
    splitSelected: (parts: 2 | 3) => void;

    // History
    undo: () => void;
    canUndo: boolean;

    // State management
    clearAll: () => void;
    initFromState: (bars: BarData[]) => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/** Snap a value to the grid */
const snap = (val: number): number => Math.round(val / GRID_SIZE) * GRID_SIZE;

/** Generate a unique bar ID */
const generateId = (): string => `bar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// =============================================================================
// Hook Implementation
// =============================================================================

export function useBarModel(): UseBarModelReturn {
    // Use history for undo support
    const {
        state: bars,
        pushState: pushBars,
        updateState: updateBars,
        undo,
        canUndo,
        clearHistory,
    } = useHistory<BarData[]>([]);

    // Selection state (not part of undo history)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // =========================================================================
    // Bar CRUD Operations
    // =========================================================================

    const addBar = useCallback((
        x: number,
        y: number,
        colorIndex: number,
        label: string
    ): BarData => {
        const newBar: BarData = {
            id: generateId(),
            x: snap(x),
            y: snap(y),
            width: DEFAULT_BAR_WIDTH,
            colorIndex,
            label,
        };

        pushBars(prev => [...prev, newBar]);
        return newBar;
    }, [pushBars]);

    const deleteBar = useCallback((id: string): void => {
        pushBars(prev => prev.filter(b => b.id !== id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, [pushBars]);

    const deleteSelected = useCallback((): void => {
        if (selectedIds.size === 0) return;
        pushBars(prev => prev.filter(b => !selectedIds.has(b.id)));
        setSelectedIds(new Set());
    }, [pushBars, selectedIds]);

    const updateBar = useCallback((id: string, updates: Partial<BarData>): void => {
        pushBars(prev => prev.map(b =>
            b.id === id ? { ...b, ...updates } : b
        ));
    }, [pushBars]);

    const updateBarLabel = useCallback((id: string, label: string): void => {
        pushBars(prev => prev.map(b =>
            b.id === id ? { ...b, label } : b
        ));
    }, [pushBars]);

    // =========================================================================
    // Movement & Resize
    // =========================================================================

    const moveBar = useCallback((id: string, x: number, y: number): void => {
        pushBars(prev => prev.map(b =>
            b.id === id ? { ...b, x: snap(x), y: snap(y) } : b
        ));
    }, [pushBars]);

    const moveSelected = useCallback((dx: number, dy: number): void => {
        if (selectedIds.size === 0) return;
        pushBars(prev => prev.map(b =>
            selectedIds.has(b.id)
                ? { ...b, x: snap(b.x + dx), y: snap(b.y + dy) }
                : b
        ));
    }, [pushBars, selectedIds]);

    const resizeBar = useCallback((id: string, width: number): void => {
        const snappedWidth = Math.max(MIN_BAR_WIDTH, snap(width));
        pushBars(prev => prev.map(b =>
            b.id === id ? { ...b, width: snappedWidth } : b
        ));
    }, [pushBars]);

    // =========================================================================
    // Selection
    // =========================================================================

    const selectBar = useCallback((id: string, additive: boolean = false): void => {
        setSelectedIds(prev => {
            if (additive) {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            } else {
                return new Set([id]);
            }
        });
    }, []);

    const selectBars = useCallback((ids: string[]): void => {
        setSelectedIds(new Set(ids));
    }, []);

    const clearSelection = useCallback((): void => {
        setSelectedIds(new Set());
    }, []);

    const selectInRect = useCallback((rect: DOMRect): void => {
        const selected = bars.filter(bar => {
            // Check if bar overlaps with selection rect
            const barRight = bar.x + bar.width;
            const barBottom = bar.y + BAR_HEIGHT;
            const rectRight = rect.x + rect.width;
            const rectBottom = rect.y + rect.height;

            return !(
                bar.x > rectRight ||
                barRight < rect.x ||
                bar.y > rectBottom ||
                barBottom < rect.y
            );
        });
        setSelectedIds(new Set(selected.map(b => b.id)));
    }, [bars]);

    // =========================================================================
    // Operations
    // =========================================================================

    const cloneSelected = useCallback((): void => {
        if (selectedIds.size === 0) return;

        const selectedBars = bars.filter(b => selectedIds.has(b.id));
        const clones: BarData[] = selectedBars.map(bar => ({
            ...bar,
            id: generateId(),
            x: bar.x + GRID_SIZE,
            y: bar.y + GRID_SIZE,
        }));

        pushBars(prev => [...prev, ...clones]);
        setSelectedIds(new Set(clones.map(b => b.id)));
    }, [bars, selectedIds, pushBars]);

    const joinSelected = useCallback((): void => {
        if (selectedIds.size === 0) return;

        const selectedBars = bars.filter(b => selectedIds.has(b.id));
        const totalWidth = selectedBars.reduce((sum, b) => sum + b.width, 0);
        const minX = Math.min(...selectedBars.map(b => b.x));
        const maxY = Math.max(...selectedBars.map(b => b.y));

        const totalBar: BarData = {
            id: generateId(),
            x: minX,
            y: maxY + BAR_HEIGHT + GRID_SIZE,
            width: totalWidth,
            colorIndex: 5, // Gray/unknown
            label: 'Total',
        };

        pushBars(prev => [...prev, totalBar]);
        setSelectedIds(new Set([totalBar.id]));
    }, [bars, selectedIds, pushBars]);

    const splitSelected = useCallback((parts: 2 | 3): void => {
        if (selectedIds.size === 0) return;

        const toAdd: BarData[] = [];
        const toRemove = new Set<string>();

        bars.filter(b => selectedIds.has(b.id)).forEach(bar => {
            const partWidth = snap(bar.width / parts);
            const minPartWidth = Math.max(MIN_BAR_WIDTH, partWidth);

            const labels = parts === 2 ? ['½', '½'] : ['⅓', '⅓', '⅓'];

            let currentX = bar.x;
            for (let i = 0; i < parts; i++) {
                // Last part gets any remaining width to maintain total
                const isLast = i === parts - 1;
                const width = isLast
                    ? bar.x + bar.width - currentX // Remaining width
                    : minPartWidth;

                toAdd.push({
                    ...bar,
                    id: generateId(),
                    x: currentX,
                    width: Math.max(MIN_BAR_WIDTH, width),
                    label: labels[i],
                });
                currentX += minPartWidth;
            }
            toRemove.add(bar.id);
        });

        if (toAdd.length > 0) {
            pushBars(prev => [
                ...prev.filter(b => !toRemove.has(b.id)),
                ...toAdd,
            ]);
            setSelectedIds(new Set(toAdd.map(b => b.id)));
        }
    }, [bars, selectedIds, pushBars]);

    // =========================================================================
    // State Management
    // =========================================================================

    const clearAll = useCallback((): void => {
        pushBars([]);
        setSelectedIds(new Set());
    }, [pushBars]);

    const initFromState = useCallback((initialBars: BarData[]): void => {
        // Use updateBars to set initial state without adding to history
        updateBars(initialBars);
        clearHistory();
        setSelectedIds(new Set());
    }, [updateBars, clearHistory]);

    // =========================================================================
    // Return
    // =========================================================================

    return {
        bars,
        selectedIds,
        addBar,
        deleteBar,
        deleteSelected,
        updateBar,
        updateBarLabel,
        moveBar,
        moveSelected,
        resizeBar,
        selectBar,
        selectBars,
        clearSelection,
        selectInRect,
        cloneSelected,
        joinSelected,
        splitSelected,
        undo,
        canUndo,
        clearAll,
        initFromState,
    };
}
