import { useState, useMemo, useCallback } from 'react';
import { SequenceType, computeSequence, getWordedRule, getNthTermFormula, generateRandomParams } from '../_lib/sequences';

export function useSequences() {
    const [sequenceType, setSequenceType] = useState<SequenceType>('arithmetic');
    const [a, setA] = useState(2);
    const [d, setD] = useState(3);
    const [r, setR] = useState(2);
    const [d2, setD2] = useState(2);

    // New: termCount starts at 0
    const [termCount, setTermCount] = useState(0);
    const [revealedCount, setRevealedCount] = useState(0);

    const [showCounters, setShowCounters] = useState(true);
    const [showRule, setShowRule] = useState(false);
    const [showNthTerm, setShowNthTerm] = useState(false);

    // New: Config panel visibility
    const [showConfig, setShowConfig] = useState(false);

    // Terms and formulas are derived from parameters
    const terms = useMemo(() =>
        computeSequence(sequenceType, a, d, r, d2, termCount),
        [sequenceType, a, d, r, d2, termCount]
    );

    const wordedRule = useMemo(() =>
        getWordedRule(sequenceType, a, d, r, d2),
        [sequenceType, a, d, r, d2]
    );

    const nthTermFormula = useMemo(() =>
        getNthTermFormula(sequenceType, a, d, r, d2),
        [sequenceType, a, d, r, d2]
    );

    // Actions
    const toggleAllRevealed = useCallback(() => {
        setRevealedCount(prev => prev === termCount ? 0 : termCount);
    }, [termCount]);

    const revealAll = useCallback(() => {
        setRevealedCount(termCount);
    }, [termCount]);

    const hideAll = useCallback(() => {
        setRevealedCount(0);
    }, []);

    const revealNext = useCallback(() => {
        setRevealedCount(prev => Math.min(prev + 1, termCount));
    }, [termCount]);

    const addNextTerm = useCallback(() => {
        setTermCount(prev => {
            const newCount = Math.min(prev + 1, 12);
            // If we were at 12, don't change anything
            if (newCount === prev) return prev;

            // Auto-reveal the new term
            setRevealedCount(newCount);
            return newCount;
        });
    }, []);

    const handleSetTermCount = useCallback((count: number) => {
        const newCount = Math.max(0, Math.min(count, 12));
        setTermCount(newCount);
        // If we were showing all (and not at 0), keep showing all
        // If we were at 0, keep it hidden
        setRevealedCount(prev => (prev === termCount && termCount > 0) ? newCount : Math.min(prev, newCount));
    }, [termCount]);

    const randomize = useCallback((allowedTypes?: SequenceType[]) => {
        const params = generateRandomParams(allowedTypes);
        setSequenceType(params.sequenceType);
        setA(params.a);
        setD(params.d);
        setR(params.r);
        setD2(params.d2);
        setTermCount(params.termCount);
        setRevealedCount(0); // Random sequences start hidden
    }, []);

    const setFromState = useCallback((state: {
        sequenceType: SequenceType;
        a: number;
        d: number;
        r: number;
        d2: number;
        termCount: number;
        revealedCount: number;
        showCounters: boolean;
        showRule: boolean;
        showNthTerm: boolean;
        showConfig?: boolean;
    }) => {
        setSequenceType(state.sequenceType);
        setA(state.a);
        setD(state.d);
        setR(state.r);
        setD2(state.d2);
        setTermCount(state.termCount);
        setRevealedCount(state.revealedCount);
        setShowCounters(state.showCounters);
        setShowRule(state.showRule);
        setShowNthTerm(state.showNthTerm);
        if (state.showConfig !== undefined) setShowConfig(state.showConfig);
    }, []);

    return {
        // State
        sequenceType,
        a,
        d,
        r,
        d2,
        termCount,
        revealedCount,
        showCounters,
        showRule,
        showNthTerm,
        showConfig,

        // Derived
        terms,
        wordedRule,
        nthTermFormula,

        // Setters
        setSequenceType,
        setA,
        setD,
        setR,
        setD2,
        setTermCount: handleSetTermCount,
        setRevealedCount,
        setShowCounters,
        setShowRule,
        setShowNthTerm,
        setShowConfig,

        // Actions
        toggleAllRevealed,
        revealAll,
        hideAll,
        revealNext,
        addNextTerm,
        randomize,
        setFromState
    };
}
