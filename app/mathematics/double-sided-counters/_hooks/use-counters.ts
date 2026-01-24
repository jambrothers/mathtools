import { useState, useRef, useCallback } from 'react';
import { useHistory } from '@/lib/hooks/use-history';

export interface Counter {
    id: number;
    value: number; // 1 or -1
    x: number;
    y: number;
    isNew?: boolean;
    isLeaving?: boolean;
}

export type SortState = 'none' | 'grouped' | 'paired';

/**
 * Counter type defines what the counters represent.
 * 'numeric' = +1/-1 (default)
 * Other values = algebraic variables (+x/-x, +y/-y, etc.)
 */
export type CounterType = 'numeric' | 'x' | 'y' | 'z' | 'a' | 'b' | 'c';

// Constants for counter grid layout
const COUNTER_SIZE = 80; // px (matches w-20 h-20)
const COUNTER_GAP = 16; // px (gap-4)
const GRID_PADDING = 32; // px (p-8)
const COUNTERS_PER_ROW = 10; // Updated from 8 to 10 per user request

// Row spacing - alternates between positive and negative rows
const ROW_HEIGHT = 96; // COUNTER_SIZE (80) + COUNTER_GAP (16)

/**
 * Calculates grid position for a counter based on its value type and index within that type.
 * Supports multiple rows alternating: positive row, negative row, positive row, negative row, ...
 * 
 * Row layout:
 * Y=32:  First positive row
 * Y=128: First negative row (32 + 96)
 * Y=224: Second positive row (128 + 96)
 * Y=320: Second negative row (224 + 96)
 * etc.
 */
function calculateGridPosition(value: number, indexInRow: number): { x: number; y: number } {
    const col = indexInRow % COUNTERS_PER_ROW;
    const rowNum = Math.floor(indexInRow / COUNTERS_PER_ROW);

    // First row for positives is Y=32, for negatives is Y=128
    // Each subsequent row alternates every ROW_HEIGHT*2 (one positive, one negative)
    const baseY = value > 0 ? 32 : 128;
    const y = baseY + (rowNum * ROW_HEIGHT * 2);

    return {
        x: GRID_PADDING + col * (COUNTER_SIZE + COUNTER_GAP),
        y: y
    };
}

/**
 * Helper to count how many counters of a given type (positive/negative) exist.
 */
function countByType(counters: Counter[], type: 'positive' | 'negative'): number {
    return counters.filter(c => type === 'positive' ? c.value > 0 : c.value < 0).length;
}

export function useCounters() {
    // Use history for undo support
    const {
        state: counters,
        pushState: pushCounters,
        updateState: updateCountersImmediate,
        undo,
        canUndo,
        clearHistory
    } = useHistory<Counter[]>([]);

    const [sortState, setSortState] = useState<SortState>('none');
    const [isOrdered, setIsOrdered] = useState(true);

    // Animation State
    const [isAnimating, setIsAnimating] = useState(false);
    const [highlightedPair, setHighlightedPair] = useState<number[]>([]);
    const [isSequentialMode, setIsSequentialMode] = useState(false);
    const [animSpeed, setAnimSpeed] = useState(1000);

    // Refs
    const nextIdRef = useRef(0);
    const animationQueueEndRef = useRef(0);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const abortAnimationRef = useRef(false);

    // Constants
    const POSITIVE = 1;
    const NEGATIVE = -1;

    // --- Helpers ---
    const wait = (ms: number) => new Promise(resolve => {
        const id = setTimeout(resolve, ms);
        timeoutsRef.current.push(id);
    });

    const clearTimeouts = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    };

    // --- Actions ---

    const addCounter = useCallback((value: number, count = 1, showNumberLine = false) => {
        // Instant Add (if Number Line hidden or just simple add)
        if (!showNumberLine) {
            pushCounters((prev: Counter[]) => {
                const newCounters: Counter[] = [];
                // Count existing counters of this type to determine position in row
                const existingCount = countByType(prev, value > 0 ? 'positive' : 'negative');

                for (let i = 0; i < count; i++) {
                    const pos = calculateGridPosition(value, existingCount + i);
                    newCounters.push({
                        id: nextIdRef.current++,
                        value: value,
                        x: pos.x,
                        y: pos.y,
                        isNew: true,
                    });
                }
                return [...prev, ...newCounters];
            });

            const tId = setTimeout(() => {
                updateCountersImmediate((prev: Counter[]) => prev.map(c => ({ ...c, isNew: false })));
            }, 100);
            timeoutsRef.current.push(tId);
            return;
        }

        // Sequential Add
        for (let i = 0; i < count; i++) {
            const now = Date.now();
            const startTime = Math.max(now, animationQueueEndRef.current);
            const delay = startTime - now;
            animationQueueEndRef.current = startTime + 500;

            const tId = setTimeout(() => {
                const newId = nextIdRef.current++;
                pushCounters((prev: Counter[]) => {
                    const existingCount = countByType(prev, value > 0 ? 'positive' : 'negative');
                    const pos = calculateGridPosition(value, existingCount);
                    return [...prev, {
                        id: newId,
                        value: value,
                        x: pos.x,
                        y: pos.y,
                        isNew: true
                    }];
                });

                const cleanTId = setTimeout(() => {
                    updateCountersImmediate((prev: Counter[]) => prev.map(c => c.id === newId ? { ...c, isNew: false } : c));
                }, 50);
                timeoutsRef.current.push(cleanTId);
            }, delay);

            timeoutsRef.current.push(tId);
        }
    }, [counters, pushCounters, updateCountersImmediate]);

    const addZeroPair = useCallback((showNumberLine = false) => {
        // ALWAYS add both counters simultaneously in a single setState
        pushCounters((prev: Counter[]) => {
            const posCount = countByType(prev, 'positive');
            const negCount = countByType(prev, 'negative');

            const posPos = calculateGridPosition(POSITIVE, posCount);
            const negPos = calculateGridPosition(NEGATIVE, negCount);

            return [
                ...prev,
                {
                    id: nextIdRef.current++,
                    value: POSITIVE,
                    x: posPos.x,
                    y: posPos.y,
                    isNew: true,
                },
                {
                    id: nextIdRef.current++,
                    value: NEGATIVE,
                    x: negPos.x,
                    y: negPos.y,
                    isNew: true,
                }
            ];
        });

        const tId = setTimeout(() => {
            updateCountersImmediate((prev: Counter[]) => prev.map(c => ({ ...c, isNew: false })));
        }, 100);
        timeoutsRef.current.push(tId);
    }, [pushCounters, updateCountersImmediate]);

    /**
     * Add a counter at a specific position (used for drag-from-sidebar).
     */
    const addCounterAtPosition = useCallback((value: number, x: number, y: number) => {
        pushCounters((prev: Counter[]) => [
            ...prev,
            {
                id: nextIdRef.current++,
                value: value,
                x: x,
                y: y,
                isNew: true,
            }
        ]);

        const tId = setTimeout(() => {
            updateCountersImmediate((prev: Counter[]) => prev.map(c => ({ ...c, isNew: false })));
        }, 100);
        timeoutsRef.current.push(tId);
    }, [pushCounters, updateCountersImmediate]);

    const flipCounter = useCallback((id: number) => {
        if (isAnimating) return;
        pushCounters((prev: Counter[]) => prev.map(c =>
            c.id === id ? { ...c, value: c.value * -1 } : c
        ));
        setSortState('none');
    }, [isAnimating, pushCounters]);

    const removeCounter = useCallback((id: number) => {
        if (isAnimating) return;
        // Simply filter out the counter - do NOT recalculate positions
        pushCounters((prev: Counter[]) => prev.filter(c => c.id !== id));
    }, [isAnimating, pushCounters]);

    const updateCounterPosition = useCallback((id: number, x: number, y: number) => {
        if (isAnimating) return;
        // Use updateCountersImmediate to avoid polluting history with drag positions
        updateCountersImmediate((prev: Counter[]) => prev.map(c =>
            c.id === id ? { ...c, x, y } : c
        ));
        // Moving a counter manually disables ordered mode
        setIsOrdered(false);
    }, [isAnimating, updateCountersImmediate]);

    const snapToOrder = useCallback(() => {
        pushCounters((prev: Counter[]) => {
            const positives = prev.filter(c => c.value > 0);
            const negatives = prev.filter(c => c.value < 0);

            return [
                ...positives.map((c, i) => ({ ...c, ...calculateGridPosition(1, i) })),
                ...negatives.map((c, i) => ({ ...c, ...calculateGridPosition(-1, i) }))
            ];
        });
        setIsOrdered(true);
    }, [pushCounters]);

    const flipAll = useCallback(() => {
        if (isAnimating) return;
        pushCounters((prev: Counter[]) => prev.map(c => ({ ...c, value: c.value * -1 })));
        setSortState('none');
    }, [isAnimating, pushCounters]);

    const organize = useCallback(() => {
        if (isAnimating) return;

        // Sort into two-row layout: positives on top, negatives on bottom
        pushCounters((currentCounters: Counter[]) => {
            const positives = currentCounters.filter(c => c.value === POSITIVE);
            const negatives = currentCounters.filter(c => c.value === NEGATIVE);

            return [
                ...positives.map((c, i) => ({ ...c, ...calculateGridPosition(1, i) })),
                ...negatives.map((c, i) => ({ ...c, ...calculateGridPosition(-1, i) }))
            ];
        });

        setSortState('grouped');
        setIsOrdered(true);
    }, [isAnimating, pushCounters]);

    const cancelZeroPairs = useCallback(async () => {
        if (isAnimating) return;

        // Calculate pairs
        const positives = counters.filter(c => c.value === POSITIVE);
        const negatives = counters.filter(c => c.value === NEGATIVE);
        const pairCount = Math.min(positives.length, negatives.length);

        if (pairCount === 0) return;

        setIsAnimating(true);
        abortAnimationRef.current = false;

        const pairs: number[][] = [];
        for (let i = 0; i < pairCount; i++) {
            pairs.push([positives[i].id, negatives[i].id]);
        }

        // SEQUENTIAL MODE
        if (isSequentialMode) {
            // Sort first - use immediate update for animation prep
            updateCountersImmediate((() => {
                const remaining = counters.filter(c => !pairs.flat().includes(c.id));
                const pairedObjs: Counter[] = [];
                pairs.forEach(([pId, nId]) => {
                    const p = counters.find(c => c.id === pId);
                    const n = counters.find(c => c.id === nId);
                    if (p && n) {
                        pairedObjs.push(p);
                        pairedObjs.push(n);
                    }
                });
                return [...pairedObjs, ...remaining];
            })());

            await wait(300);

            for (const [posId, negId] of pairs) {
                if (abortAnimationRef.current) break;
                setHighlightedPair([posId, negId]);
                await wait(animSpeed * 0.6);
                if (abortAnimationRef.current) break;

                updateCountersImmediate(counters.map(c =>
                    (c.id === posId || c.id === negId) ? { ...c, isLeaving: true } : c
                ));
                setHighlightedPair([]);

                const exitDuration = Math.min(600, animSpeed * 0.4);
                await wait(exitDuration);

                // Final removal - push to history for undo
                pushCounters((prev: Counter[]) => prev.filter(c => c.id !== posId && c.id !== negId));
            }
        }
        // BATCH MODE
        else {
            const allIdsToRemove = new Set(pairs.flat());
            updateCountersImmediate(counters.map(c =>
                allIdsToRemove.has(c.id) ? { ...c, isLeaving: true } : c
            ));
            await wait(600);
            // Final removal - push to history for undo
            pushCounters((prev: Counter[]) => prev.filter(c => !allIdsToRemove.has(c.id)));
        }

        setHighlightedPair([]);
        setIsAnimating(false);
    }, [counters, isAnimating, isSequentialMode, animSpeed, pushCounters, updateCountersImmediate]);

    const clearBoard = useCallback(() => {
        abortAnimationRef.current = true;
        clearTimeouts();
        animationQueueEndRef.current = 0;

        pushCounters([]);
        setHighlightedPair([]);
        setSortState('none');
        setIsAnimating(false);
    }, [pushCounters]);

    // Cleanup on unmount
    // useEffect(() => {
    //     return () => clearTimeouts();
    // }, []);
    // (Optional but good practice)

    /**
     * Import state from URL or external source.
     * Used for URL state restoration.
     */
    const setCountersFromState = useCallback((
        importedCounters: Counter[],
        importedSortState: SortState,
        importedIsOrdered: boolean,
        importedIsSequentialMode: boolean,
        importedAnimSpeed: number
    ) => {
        pushCounters(importedCounters);
        clearHistory(); // Clear history after URL restore
        setSortState(importedSortState);
        setIsOrdered(importedIsOrdered);
        setIsSequentialMode(importedIsSequentialMode);
        setAnimSpeed(importedAnimSpeed);
        // Update next ID to avoid collisions with imported counters
        if (importedCounters.length > 0) {
            nextIdRef.current = Math.max(...importedCounters.map(c => c.id)) + 1;
        }
    }, [pushCounters, clearHistory]);

    return {
        counters,
        sortState,
        isAnimating,
        highlightedPair,
        isSequentialMode,
        setIsSequentialMode,
        isOrdered,
        animSpeed,
        setAnimSpeed,
        addCounter,
        addCounterAtPosition,
        addZeroPair,
        flipCounter,
        removeCounter,
        updateCounterPosition,
        snapToOrder,
        flipAll,
        organize,
        cancelZeroPairs,
        clearBoard,
        setCountersFromState,
        undo,
        canUndo
    };
}
