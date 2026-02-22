import { renderHook, act } from '@testing-library/react';
import { useAreaModel } from '@/app/mathematics/area-model/_hooks/use-area-model';

describe('useAreaModel', () => {
    it('initializes with default state', () => {
        const { result } = renderHook(() => useAreaModel());

        expect(result.current.model).toBeNull();
        expect(result.current.products).toBeNull();
        expect(result.current.showFactorLabels).toBe(true);
        expect(result.current.showPartialProducts).toBe(true);
        expect(result.current.showTotal).toBe(true);
        expect(result.current.showGridLines).toBe(true);
        expect(result.current.showArray).toBe(false);
        expect(result.current.revealedCells.size).toBe(0);
        expect(result.current.factorA).toBe('');
        expect(result.current.factorB).toBe('');
    });

    it('sets factors and visualises', () => {
        const { result } = renderHook(() => useAreaModel());

        act(() => {
            result.current.setFactorA('3');
            result.current.setFactorB('4');
        });

        expect(result.current.factorA).toBe('3');
        expect(result.current.factorB).toBe('4');

        act(() => {
            result.current.visualise();
        });

        expect(result.current.model).not.toBeNull();
        expect(result.current.model?.rowTerms).toEqual([{ coefficient: 3 }]);
        expect(result.current.products).toHaveLength(1);
        expect(result.current.total).toBe('12');
    });

    it('respects autoPartition setting', () => {
        const { result } = renderHook(() => useAreaModel());

        act(() => {
            result.current.setFactorA('23');
            result.current.setFactorB('15');
            result.current.setAutoPartition(true);
        });

        act(() => {
            result.current.visualise();
        });

        expect(result.current.model?.rowTerms).toHaveLength(2); // [20, 3]

        act(() => {
            result.current.setAutoPartition(false);
        });

        act(() => {
            result.current.visualise();
        });

        expect(result.current.model?.rowTerms).toHaveLength(1); // [23]
    });

    it('toggles visibility flags', () => {
        const { result } = renderHook(() => useAreaModel());

        act(() => {
            result.current.toggleFactorLabels();
            result.current.togglePartialProducts();
            result.current.toggleArray();
        });

        expect(result.current.showFactorLabels).toBe(false);
        expect(result.current.showPartialProducts).toBe(false);
        expect(result.current.showArray).toBe(true);
    });

    it('disables array toggle for algebraic models', () => {
        const { result } = renderHook(() => useAreaModel());

        act(() => {
            result.current.setFactorA('x + 1');
            result.current.setFactorB('x + 2');
        });

        act(() => {
            result.current.visualise();
        });

        expect(result.current.isAlgebraic).toBe(true);

        act(() => {
            result.current.toggleArray();
        });

        expect(result.current.showArray).toBe(false); // Should remain false
    });

    it('handles progressive reveal', () => {
        const { result } = renderHook(() => useAreaModel());

        act(() => {
            result.current.setFactorA('20, 3');
            result.current.setFactorB('10, 5');
        });

        act(() => {
            result.current.visualise();
        });

        act(() => {
            result.current.hideAll();
        });
        expect(result.current.revealedCells.size).toBe(0);

        act(() => {
            result.current.revealCell('0-1');
        });
        expect(result.current.revealedCells.has('0-1')).toBe(true);
        expect(result.current.revealedCells.size).toBe(1);

        act(() => {
            result.current.revealAll();
        });
        expect(result.current.revealedCells.size).toBe(4);
    });

    it('increments/decrements factors', () => {
        const { result } = renderHook(() => useAreaModel());

        act(() => {
            result.current.setFactorA('5');
        });

        act(() => {
            result.current.incrementFactorA();
        });
        expect(result.current.factorA).toBe('6');

        act(() => {
            result.current.decrementFactorA();
        });
        expect(result.current.factorA).toBe('5');
    });

    it('clears all state', () => {
        const { result } = renderHook(() => useAreaModel());

        act(() => {
            result.current.setFactorA('5');
        });

        act(() => {
            result.current.visualise();
        });

        act(() => {
            result.current.clear();
        });

        expect(result.current.model).toBeNull();
        expect(result.current.factorA).toBe('');
    });
});
