import { useState, useRef, useCallback } from 'react';

export interface Counter {
    id: number;
    value: number; // 1 or -1
    isNew?: boolean;
    isLeaving?: boolean;
}

export type SortState = 'none' | 'grouped' | 'paired';

export function useCounters() {
    const [counters, setCounters] = useState<Counter[]>([]);
    const [sortState, setSortState] = useState<SortState>('none');

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
        // User didn't specify distinct behavior for number line in the refactor plan besides visibility, 
        // but the original code had distinct sequential add logic for number line. 
        // We will keep the logic to be safe.

        if (!showNumberLine) {
            const newCounters: Counter[] = [];
            for (let i = 0; i < count; i++) {
                newCounters.push({
                    id: nextIdRef.current++,
                    value: value,
                    isNew: true,
                });
            }
            setCounters(prev => [...prev, ...newCounters]);

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
                setCounters(prev => [...prev, {
                    id: newId,
                    value: value,
                    isNew: true
                }]);

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
                if (nextMode === 'grouped') {
                    return [...currentCounters].sort((a, b) => b.value - a.value);
                } else {
                    const positives = currentCounters.filter(c => c.value === POSITIVE);
                    const negatives = currentCounters.filter(c => c.value === NEGATIVE);
                    const sorted: Counter[] = [];
                    const pairCount = Math.min(positives.length, negatives.length);

                    for (let i = 0; i < pairCount; i++) {
                        sorted.push(positives[i]);
                        sorted.push(negatives[i]);
                    }

                    if (positives.length > pairCount) sorted.push(...positives.slice(pairCount));
                    if (negatives.length > pairCount) sorted.push(...negatives.slice(pairCount));

                    return sorted;
                }
            });

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
        animSpeed,
        setAnimSpeed,
        addCounter,
        addZeroPair,
        flipCounter,
        flipAll,
        organize,
        cancelZeroPairs,
        clearBoard
    };
}
