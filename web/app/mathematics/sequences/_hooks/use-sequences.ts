import { useState, useMemo, useCallback } from 'react';
import { SequenceType, computeSequence, getWordedRule, getNthTermFormula } from '../_lib/sequences';

export function useSequences() {
    const [sequenceType, setSequenceType] = useState<SequenceType>('arithmetic');
    const [a, setA] = useState(2);
    const [d, setD] = useState(3);
    const [r, setR] = useState(2);
    const [d2, setD2] = useState(2);
    const [termCount, setTermCount] = useState(6);
    const [revealedCount, setRevealedCount] = useState(6);
    const [showCounters, setShowCounters] = useState(true);
    const [showRule, setShowRule] = useState(false);
    const [showNthTerm, setShowNthTerm] = useState(false);

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
    const revealAll = useCallback(() => {
        setRevealedCount(termCount);
    }, [termCount]);

    const hideAll = useCallback(() => {
        setRevealedCount(0);
    }, []);

    const revealNext = useCallback(() => {
        setRevealedCount(prev => Math.min(prev + 1, termCount));
    }, [termCount]);

    const handleSetTermCount = useCallback((count: number) => {
        const newCount = Math.max(1, Math.min(count, 12));
        setTermCount(newCount);
        // If we were showing all, keep showing all
        setRevealedCount(prev => prev === termCount ? newCount : Math.min(prev, newCount));
    }, [termCount]);

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

        // Actions
        revealAll,
        hideAll,
        revealNext,
        setFromState
    };
}
