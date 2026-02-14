import { renderHook, act } from '@testing-library/react';
import { useSequences } from './use-sequences';

describe('useSequences', () => {
    it('initializes with default values', () => {
        const { result } = renderHook(() => useSequences());

        expect(result.current.sequenceType).toBe('arithmetic');
        expect(result.current.a).toBe(2);
        expect(result.current.d).toBe(3);
        expect(result.current.termCount).toBe(6);
        expect(result.current.revealedCount).toBe(6);
        expect(result.current.showCounters).toBe(true);
    });

    it('updates parameters and recalculates terms', () => {
        const { result } = renderHook(() => useSequences());

        act(() => {
            result.current.setA(5);
            result.current.setD(2);
        });

        expect(result.current.terms).toEqual([5, 7, 9, 11, 13, 15]);
    });

    it('switches sequence type', () => {
        const { result } = renderHook(() => useSequences());

        act(() => {
            result.current.setSequenceType('geometric');
            result.current.setA(3);
            result.current.setR(2);
        });

        expect(result.current.sequenceType).toBe('geometric');
        expect(result.current.terms).toEqual([3, 6, 12, 24, 48, 96]);
    });

    it('handles quadratic sequences', () => {
        const { result } = renderHook(() => useSequences());

        act(() => {
            result.current.setSequenceType('quadratic');
            result.current.setA(1);
            result.current.setD(3);
            result.current.setD2(2);
        });

        expect(result.current.terms).toEqual([1, 4, 9, 16, 25, 36]);
    });

    it('manages term visibility', () => {
        const { result } = renderHook(() => useSequences());

        // Default all revealed
        expect(result.current.revealedCount).toBe(6);

        act(() => {
            result.current.hideAll();
        });
        expect(result.current.revealedCount).toBe(0);

        act(() => {
            result.current.revealNext();
        });
        expect(result.current.revealedCount).toBe(1);

        act(() => {
            result.current.revealAll();
        });
        expect(result.current.revealedCount).toBe(6);
    });

    it('updates term count and clamps revealedCount', () => {
        const { result } = renderHook(() => useSequences());

        act(() => {
            result.current.setTermCount(8);
        });
        expect(result.current.terms.length).toBe(8);
        expect(result.current.revealedCount).toBe(8);

        act(() => {
            result.current.setTermCount(4);
        });
        expect(result.current.terms.length).toBe(4);
        expect(result.current.revealedCount).toBe(4);

        act(() => {
            result.current.hideAll(); // revealed 0
            result.current.setTermCount(10);
        });
        expect(result.current.revealedCount).toBe(0);
    });

    it('toggles display options', () => {
        const { result } = renderHook(() => useSequences());

        expect(result.current.showCounters).toBe(true);
        expect(result.current.showRule).toBe(false);

        act(() => {
            result.current.setShowCounters(false);
            result.current.setShowRule(true);
        });

        expect(result.current.showCounters).toBe(false);
        expect(result.current.showRule).toBe(true);
    });
});
