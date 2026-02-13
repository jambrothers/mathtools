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

    it('drag paints a rectangle when starting on empty', () => {
        const { result } = renderHook(() => usePercentageGrid());

        act(() => {
            result.current.startDrag(0);
        });

        act(() => {
            result.current.dragEnter(11);
        });

        const expected = [0, 1, 10, 11];
        expected.forEach(index => {
            expect(result.current.selectedIndices.has(index)).toBe(true);
        });

        act(() => {
            result.current.endDrag();
        });
    });

    it('drag erases a rectangle when starting on filled', () => {
        const { result } = renderHook(() => usePercentageGrid());

        act(() => {
            result.current.fillPercent(10);
        });

        expect(result.current.selectedIndices.has(0)).toBe(true);
        expect(result.current.selectedIndices.has(10)).toBe(true);

        act(() => {
            result.current.startDrag(0);
        });

        act(() => {
            result.current.dragEnter(11);
        });

        const erased = [0, 1, 10, 11];
        erased.forEach(index => {
            expect(result.current.selectedIndices.has(index)).toBe(false);
        });

        act(() => {
            result.current.endDrag();
        });
    });

    it('preserves existing selections outside the rectangle', () => {
        const { result } = renderHook(() => usePercentageGrid());

        act(() => {
            result.current.toggleSquare(55);
        });

        act(() => {
            result.current.startDrag(0);
        });

        act(() => {
            result.current.dragEnter(11);
        });

        expect(result.current.selectedIndices.has(55)).toBe(true);
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

    it('derives percentage and decimal display values', () => {
        const { result } = renderHook(() => usePercentageGrid());

        act(() => {
            result.current.fillPercent(34);
        });

        expect(result.current.percentageDisplay).toBe('34%');
        expect(result.current.decimalDisplay).toBe('0.34');
    });

    it('simplifies fraction display and handles zero', () => {
        const { result } = renderHook(() => usePercentageGrid());

        act(() => {
            result.current.fillPercent(50);
        });

        // Default: simplifyFraction = false -> unsimplified (50/100)
        expect(result.current.fractionDisplay).toBe('50/100');

        act(() => {
            result.current.toggleSimplifyFraction();
        });

        // Toggled: simplifyFraction = true -> simplified (1/2)
        expect(result.current.fractionDisplay).toBe('1/2');

        act(() => {
            result.current.clear();
            result.current.toggleSimplifyFraction(); // Toggle back to false
        });

        expect(result.current.fractionDisplay).toBe('0/100');
    });

    it('toggles visibility controls for the panel', () => {
        const { result } = renderHook(() => usePercentageGrid());

        expect(result.current.showFraction).toBe(false);
        expect(result.current.simplifyFraction).toBe(false);
        expect(result.current.showLabels).toBe(false);

        act(() => {
            result.current.togglePanel();
            result.current.toggleShowPercentage();
            result.current.toggleShowDecimal();
            result.current.toggleShowFraction();
            result.current.toggleSimplifyFraction();
            result.current.toggleShowLabels();
        });

        expect(result.current.showPanel).toBe(false);
        expect(result.current.showPercentage).toBe(true);
        expect(result.current.showDecimal).toBe(true);
        expect(result.current.showFraction).toBe(true);
        expect(result.current.simplifyFraction).toBe(true);
        expect(result.current.showLabels).toBe(true);
    });

    it('showLabels defaults to false and toggles', () => {
        const { result } = renderHook(() => usePercentageGrid());

        // Default off
        expect(result.current.showLabels).toBe(false);

        act(() => {
            result.current.toggleShowLabels();
        });
        expect(result.current.showLabels).toBe(true);

        act(() => {
            result.current.toggleShowLabels();
        });
        expect(result.current.showLabels).toBe(false);
    });

});

it('calculates FDP correctly for 10x1 mode (10 cells)', () => {
    const { result } = renderHook(() => usePercentageGrid());

    act(() => {
        result.current.setGridMode('10x1');
    });

    // cellValue is 10
    act(() => {
        // Select 1 cell
        result.current.toggleSquare(0);
    });

    // cellValue is 10
    act(() => {
        // Fill 10% (1 cell)
        result.current.fillPercent(10);
    });



    expect(result.current.percentageDisplay).toBe('10%');
    expect(result.current.decimalDisplay).toBe('0.10');
    expect(result.current.fractionDisplay).toBe('1/10');
});

it('uses dynamic columns for drag rectangle', () => {
    const { result } = renderHook(() => usePercentageGrid());

    act(() => {
        result.current.setGridMode('10x2'); // 10 cols, 2 rows
    });

    // Start at 0 (row 0, col 0)
    act(() => {
        result.current.startDrag(0);
    });

    // Drag to 11 (row 1, col 1)
    // In 10x2 grid, index 11 is row 1, col 1
    // Rectangle should include:
    // Row 0: 0, 1
    // Row 1: 10, 11
    act(() => {
        result.current.dragEnter(11);
    });

    expect(result.current.selectedIndices.has(0)).toBe(true);
    expect(result.current.selectedIndices.has(1)).toBe(true);
    expect(result.current.selectedIndices.has(10)).toBe(true);
    expect(result.current.selectedIndices.has(11)).toBe(true);
    expect(result.current.selectedIndices.size).toBe(4);
});

