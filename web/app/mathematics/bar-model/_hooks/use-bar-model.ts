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
    QuickLabelType,
    SplitPart,
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
    /** Whether this bar is marked as the "total" bar */
    isTotal?: boolean;
    /** Whether to show a dynamically computed relative label */
    showRelativeLabel?: boolean;
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
    setBarAsTotal: (id: string, isTotal: boolean) => void;
    toggleRelativeLabel: () => void;

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
    cloneSelectedRight: () => void;
    cloneSelectedDown: () => void;
    joinSelected: () => void;
    splitSelected: (parts: SplitPart) => void;
    applyQuickLabel: (labelType: QuickLabelType) => void;
    toggleTotal: () => void;

    // History
    undo: () => void;
    canUndo: boolean;

    // State management
    clearAll: () => void;
    initFromState: (bars: BarData[]) => void;

    // Explicit Drag (Performance optimization)
    dragStart: () => void;
    dragMove: (dx: number, dy: number) => void;
    dragEnd: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/** Snap a value to the grid */
const snap = (val: number): number => Math.round(val / GRID_SIZE) * GRID_SIZE;

/** Generate a unique bar ID */
const generateId = (): string => `bar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/** Calculate GCD of two numbers using Euclidean algorithm */
export const gcd = (a: number, b: number): number => {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b > 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
};



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

    const setBarAsTotal = useCallback((id: string, isTotal: boolean): void => {
        pushBars(prev => {
            // If setting to true, we must unset isTotal on all other bars
            if (isTotal) {
                return prev.map(b => ({
                    ...b,
                    isTotal: b.id === id ? true : false
                }));
            } else {
                // Just unset this one
                return prev.map(b =>
                    b.id === id ? { ...b, isTotal: false } : b
                );
            }
        });
    }, [pushBars]);

    const toggleRelativeLabel = useCallback((): void => {
        if (selectedIds.size === 0) return;
        pushBars(prev => prev.map(b =>
            selectedIds.has(b.id) ? { ...b, showRelativeLabel: !b.showRelativeLabel } : b
        ));
    }, [pushBars, selectedIds]);

    const toggleTotal = useCallback((): void => {
        if (selectedIds.size !== 1) return; // Only apply to single selection for now
        const id = Array.from(selectedIds)[0];

        pushBars(prev => {
            const bar = prev.find(b => b.id === id);
            if (!bar) return prev;

            const newIsTotal = !bar.isTotal;
            if (newIsTotal) {
                // Set this one to true, others to false
                return prev.map(b => ({
                    ...b,
                    isTotal: b.id === id
                }));
            } else {
                return prev.map(b =>
                    b.id === id ? { ...b, isTotal: false } : b
                );
            }
        });
    }, [selectedIds, pushBars]);

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

    const cloneSelectedRight = useCallback((): void => {
        if (selectedIds.size === 0) return;

        const selectedBars = bars.filter(b => selectedIds.has(b.id));
        const clones: BarData[] = selectedBars.map(bar => ({
            ...bar,
            id: generateId(),
            x: bar.x + bar.width, // Place directly to the right
            y: bar.y, // Same Y
            isTotal: false, // Clones shouldn't inherit total status
        }));

        pushBars(prev => [...prev, ...clones]);
        setSelectedIds(new Set(clones.map(b => b.id)));
    }, [bars, selectedIds, pushBars]);

    const cloneSelectedDown = useCallback((): void => {
        if (selectedIds.size === 0) return;

        const selectedBars = bars.filter(b => selectedIds.has(b.id));
        const clones: BarData[] = selectedBars.map(bar => ({
            ...bar,
            id: generateId(),
            x: bar.x, // Same X
            y: bar.y + BAR_HEIGHT + GRID_SIZE, // Place directly below
            isTotal: false, // Clones shouldn't inherit total status
        }));

        pushBars(prev => [...prev, ...clones]);
        setSelectedIds(new Set(clones.map(b => b.id)));
    }, [bars, selectedIds, pushBars]);

    const joinSelected = useCallback((): void => {
        if (selectedIds.size === 0) return;

        const selectedBars = bars.filter(b => selectedIds.has(b.id));
        const totalWidth = selectedBars.reduce((sum, b) => sum + b.width, 0);
        const minX = Math.min(...selectedBars.map(b => b.x));
        const minY = Math.min(...selectedBars.map(b => b.y));

        // Check if all selected bars have relative label enabled
        const allRelative = selectedBars.every(b => b.showRelativeLabel);

        const mergedBar: BarData = {
            id: generateId(),
            x: minX,
            y: minY,
            width: totalWidth,
            colorIndex: selectedBars[0].colorIndex, // Use color of first bar
            label: '', // Reset label
            isTotal: false,
            showRelativeLabel: allRelative,
        };

        pushBars(prev => {
            // Remove selected bars and add the merged one
            const remaining = prev.filter(b => !selectedIds.has(b.id));
            return [...remaining, mergedBar];
        });
        setSelectedIds(new Set([mergedBar.id]));
    }, [bars, selectedIds, pushBars]);

    const splitSelected = useCallback((parts: SplitPart): void => {
        if (selectedIds.size === 0) return;

        const toAdd: BarData[] = [];
        const toRemove = new Set<string>();

        bars.filter(b => selectedIds.has(b.id)).forEach(bar => {
            const partWidth = snap(bar.width / parts);
            const minPartWidth = Math.max(MIN_BAR_WIDTH, partWidth);

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
                    label: '', // No label on split
                    showRelativeLabel: bar.showRelativeLabel, // Inherit relative label
                    isTotal: false, // Split parts can't be total
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

    const applyQuickLabel = useCallback((labelType: QuickLabelType): void => {
        if (selectedIds.size === 0) return;

        pushBars(prev => prev.map(bar => {
            if (!selectedIds.has(bar.id)) return bar;

            let newLabel: string;
            switch (labelType) {
                case 'x':
                case 'y':
                case '?':
                    newLabel = labelType;
                    break;
                case 'units':
                    // Label with width in grid units
                    newLabel = String(Math.round(bar.width / GRID_SIZE));
                    break;
                case 'relative': {
                    const totalBar = prev.find(b => b.isTotal);
                    if (!totalBar) {
                        newLabel = bar.label;
                    } else {
                        const common = gcd(bar.width, totalBar.width);
                        const num = Math.round(bar.width / common);
                        const den = Math.round(totalBar.width / common);
                        newLabel = den === 1 ? String(num) : `${num}/${den}`;
                    }
                    break;
                }
                default:
                    newLabel = bar.label;
            }
            return { ...bar, label: newLabel };
        }));
    }, [selectedIds, pushBars]);

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
    // Explicit Drag Implementation (Perf + Smoothness)
    // =========================================================================

    const dragStart = useCallback((): void => {
        // Push current state to history (checkpoint) before modification
        pushBars(prev => prev);
    }, [pushBars]);

    const dragMove = useCallback((dx: number, dy: number): void => {
        if (selectedIds.size === 0) return;
        // Update WITHOUT snapping for smooth 1:1 movement
        // Use updateBars (transient) instead of pushBars
        updateBars(prev => prev.map(b =>
            selectedIds.has(b.id)
                ? { ...b, x: b.x + dx, y: b.y + dy }
                : b
        ));
    }, [updateBars, selectedIds]);

    const dragEnd = useCallback((): void => {
        if (selectedIds.size === 0) return;
        // Finalize by snapping to grid
        // Use updateBars to commit the final state (history already has the pre-drag state)
        updateBars(prev => prev.map(b =>
            selectedIds.has(b.id)
                ? { ...b, x: snap(b.x), y: snap(b.y) }
                : b
        ));
    }, [updateBars, selectedIds]);

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
        setBarAsTotal,
        moveBar,
        moveSelected,
        resizeBar,
        selectBar,
        selectBars,
        clearSelection,
        selectInRect,
        cloneSelectedRight,
        cloneSelectedDown,
        joinSelected,
        splitSelected,
        applyQuickLabel,
        toggleTotal,
        toggleRelativeLabel,
        undo,
        canUndo,
        clearAll,
        initFromState,
        dragStart,
        dragMove,
        dragEnd,
    };
}
