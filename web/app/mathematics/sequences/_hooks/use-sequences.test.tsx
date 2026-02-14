import { renderHook, act } from '@testing-library/react';
import { useSequences } from './use-sequences';

describe('useSequences', () => {
    it('initializes with empty default state (termCount=0)', () => {
        const { result } = renderHook(() => useSequences());

        expect(result.current.termCount).toBe(0);
        expect(result.current.terms).toEqual([]);
        expect(result.current.revealedCount).toBe(0);
        expect(result.current.showConfig).toBe(false);
    });

    it('updates parameters and termCount', () => {
        const { result } = renderHook(() => useSequences());

        act(() => {
            result.current.setTermCount(5);
            result.current.setA(10);
            result.current.setD(5);
        });

        expect(result.current.terms).toEqual([10, 15, 20, 25, 30]);
        // When setting termCount explicitly, revealedCount should match by default or follow existing logic
        // For teaching, if we manually set a sequence, maybe we reveal all? 
        // Let's say it stays 0 unless revealed.
        expect(result.current.revealedCount).toBe(0);
    });

    it('toggles all terms revealed/hidden', () => {
        const { result } = renderHook(() => useSequences());

        act(() => {
            result.current.setTermCount(4);
        });

        expect(result.current.revealedCount).toBe(0);

        act(() => {
            result.current.toggleAllRevealed();
        });
        expect(result.current.revealedCount).toBe(4);

        act(() => {
            result.current.toggleAllRevealed();
        });
        expect(result.current.revealedCount).toBe(0);
    });

    it('addNextTerm() increments termCount and auto-reveals', () => {
        const { result } = renderHook(() => useSequences());

        act(() => {
            result.current.setTermCount(2);
            result.current.toggleAllRevealed(); // revealed 2
        });

        act(() => {
            result.current.addNextTerm();
        });

        expect(result.current.termCount).toBe(3);
        expect(result.current.revealedCount).toBe(3);
    });

    it('addNextTerm() respects max length of 12', () => {
        const { result } = renderHook(() => useSequences());

        act(() => {
            result.current.setTermCount(12);
        });

        act(() => {
            result.current.addNextTerm();
        });

        expect(result.current.termCount).toBe(12);
    });

    it('toggles config panel visibility', () => {
        const { result } = renderHook(() => useSequences());

        expect(result.current.showConfig).toBe(false);

        act(() => {
            result.current.setShowConfig(true);
        });

        expect(result.current.showConfig).toBe(true);
    });

    it('randomize() sets parameters and termCount', () => {
        const { result } = renderHook(() => useSequences());

        act(() => {
            result.current.randomize();
        });

        expect(result.current.termCount).toBeGreaterThan(0);
        expect(result.current.revealedCount).toBe(0); // Random sequence hidden by default
    });
});
