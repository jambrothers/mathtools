import { renderHook, act } from '@testing-library/react';
import { useFractionWall } from './use-fraction-wall';

describe('useFractionWall', () => {
    test('initial state', () => {
        const { result } = renderHook(() => useFractionWall());
        expect(result.current.visibleDenominators).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        expect(result.current.shadedSegments).toEqual([]);
        expect(result.current.labelMode).toBe('fraction');
    });

    test('toggleDenominator', () => {
        const { result } = renderHook(() => useFractionWall());

        act(() => {
            result.current.toggleDenominator(12);
        });
        expect(result.current.visibleDenominators).not.toContain(12);

        act(() => {
            result.current.toggleDenominator(12);
        });
        expect(result.current.visibleDenominators).toContain(12);
    });

    test('toggleSegment', () => {
        const { result } = renderHook(() => useFractionWall());

        act(() => {
            result.current.toggleSegment(2, 0);
        });
        expect(result.current.shadedSegments).toEqual([{ d: 2, i: 0 }]);

        act(() => {
            result.current.toggleSegment(2, 0);
        });
        expect(result.current.shadedSegments).toEqual([]);
    });

    test('clearShading', () => {
        const { result } = renderHook(() => useFractionWall());

        act(() => {
            result.current.toggleSegment(2, 0);
            result.current.clearShading();
        });
        expect(result.current.shadedSegments).toEqual([]);
    });
});
