import { useState, useRef, useCallback } from 'react';

export interface Counter {
    id: number;
    value: number; // 1 or -1
    x: number;
    y: number;
    isNew?: boolean;
    isLeaving?: boolean;
}

export type SortState = 'none' | 'grouped' | 'paired';

// Constants for counter grid layout
const COUNTER_SIZE = 80; // px (matches w-20 h-20)
const COUNTER_GAP = 16; // px (gap-4)
const GRID_PADDING = 32; // px (p-8)
const COUNTERS_PER_ROW = 8;

/**
 * Calculates grid position for a counter at a given index.
 */
function calculateGridPosition(index: number): { x: number; y: number } {
    const col = index % COUNTERS_PER_ROW;
    const row = Math.floor(index / COUNTERS_PER_ROW);
    return {
        x: GRID_PADDING + col * (COUNTER_SIZE + COUNTER_GAP),
        y: GRID_PADDING + row * (COUNTER_SIZE + COUNTER_GAP)
    };
}

export function useCounters() {
    const [counters, setCounters] = useState<Counter[]>([]);
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
            setCounters(prev => {
                const newCounters: Counter[] = [];
                for (let i = 0; i < count; i++) {
                    const pos = calculateGridPosition(prev.length + i);
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
                setCounters(prev => prev.map(c => ({ ...c, isNew: false })));
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
                setCounters(prev => {
                    const pos = calculateGridPosition(prev.length);
                    return [...prev, {
                        id: newId,
                        value: value,
                        x: pos.x,
                        y: pos.y,
                        isNew: true
                    }];
                });

                const cleanTId = setTimeout(() => {
                    setCounters(prev => prev.map(c => c.id === newId ? { ...c, isNew: false } : c));
                }, 50);
                timeoutsRef.current.push(cleanTId);
            }, delay);

            timeoutsRef.current.push(tId);
        }
    }, []);

    const addZeroPair = useCallback((showNumberLine = false) => {
        addCounter(POSITIVE, 1, showNumberLine);
        addCounter(NEGATIVE, 1, showNumberLine);
    }, [addCounter]);

    const flipCounter = useCallback((id: number) => {
        if (isAnimating) return;
        setCounters(prev => prev.map(c =>
            c.id === id ? { ...c, value: c.value * -1 } : c
        ));
        setSortState('none');
    }, [isAnimating]);

    const removeCounter = useCallback((id: number) => {
        if (isAnimating) return;
        setCounters(prev => {
            const filtered = prev.filter(c => c.id !== id);
            // If ordered, recalculate positions
            if (isOrdered) {
                return filtered.map((c, i) => ({
                    ...c,
                    ...calculateGridPosition(i)
                }));
            }
            return filtered;
        });
    }, [isAnimating, isOrdered]);

    const updateCounterPosition = useCallback((id: number, x: number, y: number) => {
        if (isAnimating) return;
        setCounters(prev => prev.map(c =>
            c.id === id ? { ...c, x, y } : c
        ));
        // Moving a counter manually disables ordered mode
        setIsOrdered(false);
    }, [isAnimating]);

    const snapToOrder = useCallback(() => {
        setCounters(prev => prev.map((c, i) => ({
            ...c,
            ...calculateGridPosition(i)
        })));
        setIsOrdered(true);
    }, []);

    const flipAll = useCallback(() => {
        if (isAnimating) return;
        setCounters(prev => prev.map(c => ({ ...c, value: c.value * -1 })));
        setSortState('none');
    }, [isAnimating]);

    const organize = useCallback(() => {
        if (isAnimating) return;
        setSortState(prev => {
            const nextMode = prev === 'grouped' ? 'paired' : 'grouped';

            setCounters(currentCounters => {
                let sorted: Counter[];
                if (nextMode === 'grouped') {
                    sorted = [...currentCounters].sort((a, b) => b.value - a.value);
                } else {
                    const positives = currentCounters.filter(c => c.value === POSITIVE);
                    const negatives = currentCounters.filter(c => c.value === NEGATIVE);
                    sorted = [];
                    const pairCount = Math.min(positives.length, negatives.length);

                    for (let i = 0; i < pairCount; i++) {
                        sorted.push(positives[i]);
                        sorted.push(negatives[i]);
                    }

                    if (positives.length > pairCount) sorted.push(...positives.slice(pairCount));
                    if (negatives.length > pairCount) sorted.push(...negatives.slice(pairCount));
                }
                // Recalculate positions after organizing
                return sorted.map((c, i) => ({
                    ...c,
                    ...calculateGridPosition(i)
                }));
            });

            setIsOrdered(true);
            return nextMode;
        });
    }, [isAnimating]);

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
            // Sort first
            setCounters(prev => {
                const remaining = prev.filter(c => !pairs.flat().includes(c.id));
                const pairedObjs: Counter[] = [];
                pairs.forEach(([pId, nId]) => {
                    const p = prev.find(c => c.id === pId);
                    const n = prev.find(c => c.id === nId);
                    if (p && n) {
                        pairedObjs.push(p);
                        pairedObjs.push(n);
                    }
                });
                return [...pairedObjs, ...remaining];
            });

            await wait(300);

            for (const [posId, negId] of pairs) {
                if (abortAnimationRef.current) break;
                setHighlightedPair([posId, negId]);
                await wait(animSpeed * 0.6);
                if (abortAnimationRef.current) break;

                setCounters(prev => prev.map(c =>
                    (c.id === posId || c.id === negId) ? { ...c, isLeaving: true } : c
                ));
                setHighlightedPair([]);

                const exitDuration = Math.min(600, animSpeed * 0.4);
                await wait(exitDuration);

                setCounters(prev => prev.filter(c => c.id !== posId && c.id !== negId));
            }
        }
        // BATCH MODE
        else {
            const allIdsToRemove = new Set(pairs.flat());
            setCounters(prev => prev.map(c =>
                allIdsToRemove.has(c.id) ? { ...c, isLeaving: true } : c
            ));
            await wait(600);
            setCounters(prev => prev.filter(c => !allIdsToRemove.has(c.id)));
        }

        setHighlightedPair([]);
        setIsAnimating(false);
    }, [counters, isAnimating, isSequentialMode, animSpeed]);

    const clearBoard = useCallback(() => {
        abortAnimationRef.current = true;
        clearTimeouts();
        animationQueueEndRef.current = 0;

        setCounters([]);
        setHighlightedPair([]);
        setSortState('none');
        setIsAnimating(false);
    }, []);

    // Cleanup on unmount
    // useEffect(() => {
    //     return () => clearTimeouts();
    // }, []);
    // (Optional but good practice)

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
        addZeroPair,
        flipCounter,
        removeCounter,
        updateCounterPosition,
        snapToOrder,
        flipAll,
        organize,
        cancelZeroPairs,
        clearBoard
    };
}
