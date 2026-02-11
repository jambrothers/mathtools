import { renderHook, act } from '@testing-library/react';
import { usePercentageGrid } from './use-percentage-grid';
import { GRID_SIZE } from '../constants';

describe('usePercentageGrid', () => {
    const toSortedArray = (set: Set<number>) => Array.from(set).sort((a, b) => a - b);

    it('toggles a square on click', () => {
        const { result } = renderHook(() => usePercentageGrid());

        act(() => {
            result.current.toggleSquare(3);
        });

        expect(result.current.selectedIndices.has(3)).toBe(true);

        act(() => {
            result.current.toggleSquare(3);
        });

        expect(result.current.selectedIndices.has(3)).toBe(false);
    });

    it('drag paints when starting on empty and erases when starting on filled', () => {
        const { result } = renderHook(() => usePercentageGrid());

        act(() => {
            result.current.startDrag(0);
        });

        act(() => {
            result.current.dragEnter(1);
        });

        expect(result.current.selectedIndices.has(0)).toBe(true);
        expect(result.current.selectedIndices.has(1)).toBe(true);

        act(() => {
            result.current.endDrag();
        });

        act(() => {
            result.current.startDrag(1);
        });

        act(() => {
            result.current.dragEnter(0);
        });

        expect(result.current.selectedIndices.has(1)).toBe(false);
        expect(result.current.selectedIndices.has(0)).toBe(false);
    });

    it('fills by columns for quick fills', () => {
        const { result } = renderHook(() => usePercentageGrid());

        act(() => {
            result.current.fillPercent(10);
        });

        const expectedColumn0 = Array.from({ length: GRID_SIZE }, (_, row) => row * GRID_SIZE);
        expect(toSortedArray(result.current.selectedIndices)).toEqual(expectedColumn0);

        act(() => {
            result.current.fillPercent(25);
        });

        const expected25 = [
            ...Array.from({ length: GRID_SIZE }, (_, row) => row * GRID_SIZE + 0),
            ...Array.from({ length: GRID_SIZE }, (_, row) => row * GRID_SIZE + 1),
            2, 12, 22, 32, 42
        ];
        expect(toSortedArray(result.current.selectedIndices)).toEqual(expected25.sort((a, b) => a - b));

        act(() => {
            result.current.fillPercent(50);
        });

        const expected50 = [] as number[];
        for (let col = 0; col < 5; col += 1) {
            for (let row = 0; row < GRID_SIZE; row += 1) {
                expected50.push(row * GRID_SIZE + col);
            }
        }
        expect(toSortedArray(result.current.selectedIndices)).toEqual(expected50.sort((a, b) => a - b));
    });

    it('clears the grid', () => {
        const { result } = renderHook(() => usePercentageGrid());

        act(() => {
            result.current.fillPercent(50);
        });

        expect(result.current.selectedIndices.size).toBeGreaterThan(0);

        act(() => {
            result.current.clear();
        });

        expect(result.current.selectedIndices.size).toBe(0);
    });
});
