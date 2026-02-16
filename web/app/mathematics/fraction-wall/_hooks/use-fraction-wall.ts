import { useState, useCallback } from 'react';
import { FractionWallState, ShadedSegment, LabelMode } from '../_lib/url-state';

export function useFractionWall() {
    const [visibleDenominators, setVisibleDenominators] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const [shadedSegments, setShadedSegments] = useState<ShadedSegment[]>([]);
    const [labelMode, setLabelMode] = useState<LabelMode>('fraction');
    const [showEquivalenceLines, setShowEquivalenceLines] = useState(false);
    const [comparisonPair, setComparisonPair] = useState<[ShadedSegment, ShadedSegment] | null>(null);

    const toggleDenominator = useCallback((d: number) => {
        setVisibleDenominators(prev =>
            prev.includes(d) ? prev.filter(x => x !== d) : [...prev].sort((a, b) => a - b).concat(d).sort((a, b) => a - b)
        );
    }, []);

    const toggleSegment = useCallback((d: number, i: number) => {
        setShadedSegments(prev => {
            const exists = prev.find(s => s.d === d && s.i === i);
            if (exists) {
                return prev.filter(s => !(s.d === d && s.i === i));
            } else {
                return [...prev, { d, i }];
            }
        });
    }, []);

    const clearShading = useCallback(() => {
        setShadedSegments([]);
        setComparisonPair(null);
    }, []);

    const initFromState = useCallback((state: FractionWallState) => {
        setVisibleDenominators(state.visibleDenominators);
        setShadedSegments(state.shadedSegments);
        setLabelMode(state.labelMode);
        setShowEquivalenceLines(state.showEquivalenceLines);
        setComparisonPair(state.comparisonPair);
    }, []);

    const toggleComparison = useCallback((d: number, i: number) => {
        setComparisonPair(prev => {
            const newSeg = { d, i };
            if (!prev) return [newSeg, newSeg]; // Start with both same, or just one? Let's say it needs two.

            // If we have a pair, replace the second one
            if (prev[0].d === d && prev[0].i === i) return null; // Toggle off if clicking first again
            if (prev[1].d === d && prev[1].i === i) return null; // Toggle off if clicking second again

            // This is a bit simplified. Let's just cycle or pick specifically.
            // For now, let's just allow picking two.
            return [prev[1], newSeg];
        });
    }, []);

    return {
        visibleDenominators,
        shadedSegments,
        labelMode,
        showEquivalenceLines,
        comparisonPair,

        setVisibleDenominators,
        setShadedSegments,
        setLabelMode,
        setShowEquivalenceLines,
        setComparisonPair,

        toggleDenominator,
        toggleSegment,
        clearShading,
        initFromState,
        toggleComparison
    };
}
