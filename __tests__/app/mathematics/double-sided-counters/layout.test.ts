/**
 * Jest tests for the two-row layout system in double-sided counters.
 * 
 * TDD: These tests are written FIRST before implementation.
 * The tests define the expected behavior:
 * - Positive counters should appear on the top row
 * - Negative counters should appear on the bottom row
 * - Zero pairs should place each counter in its respective row
 * - Sort should organize all counters into the two-row layout
 */

import { renderHook, act } from '@testing-library/react';
import { useCounters } from '@/app/mathematics/double-sided-counters/_hooks/use-counters';

// Layout constants that should match the implementation
const COUNTER_SIZE = 80;
const COUNTER_GAP = 16;
const GRID_PADDING = 32;
const POSITIVE_ROW_Y = 32;  // Expected Y for positive counters
const NEGATIVE_ROW_Y = 128; // Expected Y for negative counters

describe('Two-Row Counter Layout', () => {
    describe('addCounter positioning', () => {
        it('places positive counters on the top row (lower Y value)', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 1, false); // Add one positive counter
            });

            expect(result.current.counters).toHaveLength(1);
            const counter = result.current.counters[0];
            expect(counter.value).toBe(1);
            expect(counter.y).toBe(POSITIVE_ROW_Y);
        });

        it('places negative counters on the bottom row (higher Y value)', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(-1, 1, false); // Add one negative counter
            });

            expect(result.current.counters).toHaveLength(1);
            const counter = result.current.counters[0];
            expect(counter.value).toBe(-1);
            expect(counter.y).toBe(NEGATIVE_ROW_Y);
        });

        it('places multiple positive counters in a row on the top', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 3, false); // Add 3 positive counters
            });

            expect(result.current.counters).toHaveLength(3);

            // All should be on top row
            result.current.counters.forEach((counter, index) => {
                expect(counter.value).toBe(1);
                expect(counter.y).toBe(POSITIVE_ROW_Y);
                // X positions should be sequential
                expect(counter.x).toBe(GRID_PADDING + index * (COUNTER_SIZE + COUNTER_GAP));
            });
        });

        it('places multiple negative counters in a row on the bottom', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(-1, 3, false); // Add 3 negative counters
            });

            expect(result.current.counters).toHaveLength(3);

            // All should be on bottom row
            result.current.counters.forEach((counter, index) => {
                expect(counter.value).toBe(-1);
                expect(counter.y).toBe(NEGATIVE_ROW_Y);
                expect(counter.x).toBe(GRID_PADDING + index * (COUNTER_SIZE + COUNTER_GAP));
            });
        });

        it('places mixed counters in their respective rows', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 2, false);  // 2 positive
                result.current.addCounter(-1, 2, false); // 2 negative
            });

            expect(result.current.counters).toHaveLength(4);

            const positives = result.current.counters.filter(c => c.value > 0);
            const negatives = result.current.counters.filter(c => c.value < 0);

            expect(positives).toHaveLength(2);
            expect(negatives).toHaveLength(2);

            // All positives on top row
            positives.forEach(c => expect(c.y).toBe(POSITIVE_ROW_Y));
            // All negatives on bottom row
            negatives.forEach(c => expect(c.y).toBe(NEGATIVE_ROW_Y));
        });
    });

    describe('addZeroPair positioning', () => {
        it('places positive on top row and negative on bottom row', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addZeroPair(false);
            });

            expect(result.current.counters).toHaveLength(2);

            const positive = result.current.counters.find(c => c.value > 0);
            const negative = result.current.counters.find(c => c.value < 0);

            expect(positive).toBeDefined();
            expect(negative).toBeDefined();
            expect(positive!.y).toBe(POSITIVE_ROW_Y);
            expect(negative!.y).toBe(NEGATIVE_ROW_Y);
        });

        it('places multiple zero pairs correctly filling rows left to right', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addZeroPair(false);
                result.current.addZeroPair(false);
                result.current.addZeroPair(false);
            });

            expect(result.current.counters).toHaveLength(6);

            const positives = result.current.counters.filter(c => c.value > 0);
            const negatives = result.current.counters.filter(c => c.value < 0);

            expect(positives).toHaveLength(3);
            expect(negatives).toHaveLength(3);

            // Positives should be on top row with sequential X positions
            positives.forEach((c, i) => {
                expect(c.y).toBe(POSITIVE_ROW_Y);
            });

            // Negatives should be on bottom row with sequential X positions
            negatives.forEach((c, i) => {
                expect(c.y).toBe(NEGATIVE_ROW_Y);
            });
        });
    });

    describe('organize (Sort) functionality', () => {
        it('sorts mixed counters into two-row layout', () => {
            const { result } = renderHook(() => useCounters());

            // Add counters and then manually move some out of order
            act(() => {
                result.current.addCounter(1, 2, false);
                result.current.addCounter(-1, 2, false);
            });

            // Manually mess up positions
            act(() => {
                result.current.updateCounterPosition(
                    result.current.counters[0].id,
                    200, 300 // Move positive counter to wrong position
                );
            });

            // Now sort
            act(() => {
                result.current.organize();
            });

            const positives = result.current.counters.filter(c => c.value > 0);
            const negatives = result.current.counters.filter(c => c.value < 0);

            // After sort, all positives should be on top row
            positives.forEach(c => expect(c.y).toBe(POSITIVE_ROW_Y));
            // All negatives should be on bottom row
            negatives.forEach(c => expect(c.y).toBe(NEGATIVE_ROW_Y));
        });

        it('maintains sequential X positions within each row after sort', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 3, false);
                result.current.addCounter(-1, 3, false);
            });

            act(() => {
                result.current.organize();
            });

            const positives = result.current.counters.filter(c => c.value > 0);
            const negatives = result.current.counters.filter(c => c.value < 0);

            // Check positive row X positions are sequential starting from GRID_PADDING
            const posXPositions = positives.map(c => c.x).sort((a, b) => a - b);
            posXPositions.forEach((x, i) => {
                expect(x).toBe(GRID_PADDING + i * (COUNTER_SIZE + COUNTER_GAP));
            });

            // Check negative row X positions are sequential starting from GRID_PADDING
            const negXPositions = negatives.map(c => c.x).sort((a, b) => a - b);
            negXPositions.forEach((x, i) => {
                expect(x).toBe(GRID_PADDING + i * (COUNTER_SIZE + COUNTER_GAP));
            });
        });
    });

    describe('counter removal updates row layout', () => {
        it('adjusts positions when a counter is removed from top row', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 3, false);
            });

            const firstCounterId = result.current.counters[0].id;

            act(() => {
                result.current.removeCounter(firstCounterId);
            });

            expect(result.current.counters).toHaveLength(2);

            // Remaining counters should still be on top row
            result.current.counters.forEach(c => {
                expect(c.y).toBe(POSITIVE_ROW_Y);
            });
        });
    });
});

describe('Counter drag functionality', () => {
    it('allows counters to be dragged to any position', () => {
        const { result } = renderHook(() => useCounters());

        act(() => {
            result.current.addCounter(1, 1, false);
        });

        const counterId = result.current.counters[0].id;

        act(() => {
            result.current.updateCounterPosition(counterId, 500, 400);
        });

        expect(result.current.counters[0].x).toBe(500);
        expect(result.current.counters[0].y).toBe(400);
    });
});

describe('Counter layout enhancements', () => {
    const COUNTERS_PER_ROW = 10; // Updated from 8 to 10

    describe('10 counters per row', () => {
        it('places up to 10 positive counters on first positive row', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 10, false);
            });

            expect(result.current.counters).toHaveLength(10);

            // All should be on first positive row with same Y
            const firstPosY = result.current.counters[0].y;
            result.current.counters.forEach(c => {
                expect(c.y).toBe(firstPosY);
            });
        });

        it('wraps to second positive row after 10 counters', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 12, false); // 12 positive counters
            });

            expect(result.current.counters).toHaveLength(12);

            // First 10 should be on first row
            const firstRowCounters = result.current.counters.slice(0, 10);
            const firstRowY = firstRowCounters[0].y;
            firstRowCounters.forEach(c => expect(c.y).toBe(firstRowY));

            // Next 2 should be on second row (different Y)
            const secondRowCounters = result.current.counters.slice(10, 12);
            const secondRowY = secondRowCounters[0].y;
            expect(secondRowY).not.toBe(firstRowY);
            secondRowCounters.forEach(c => expect(c.y).toBe(secondRowY));
        });

        it('alternates positive and negative rows: +, -, +, -, ...', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 12, false);  // 12 positive (2 rows)
                result.current.addCounter(-1, 12, false); // 12 negative (2 rows)
            });

            const positives = result.current.counters.filter(c => c.value > 0);
            const negatives = result.current.counters.filter(c => c.value < 0);

            // Get unique Y positions for positives and negatives
            const posYs = [...new Set(positives.map(c => c.y))].sort((a, b) => a - b);
            const negYs = [...new Set(negatives.map(c => c.y))].sort((a, b) => a - b);

            expect(posYs).toHaveLength(2); // 2 positive rows
            expect(negYs).toHaveLength(2); // 2 negative rows

            // Positive rows should be at Y=32, Y=224 (32 + 96*2)
            // Negative rows should be at Y=128, Y=320 (128 + 96*2)
            expect(posYs[0]).toBeLessThan(negYs[0]); // First + row above first - row
            expect(negYs[0]).toBeLessThan(posYs[1]); // First - row above second + row
        });
    });

    describe('counter removal does not shift others', () => {
        it('removes counter without shifting remaining counters', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 5, false);
            });

            // Store original positions
            const originalPositions = result.current.counters.map(c => ({
                id: c.id,
                x: c.x,
                y: c.y
            }));

            const middleCounterId = result.current.counters[2].id;

            act(() => {
                result.current.removeCounter(middleCounterId);
            });

            expect(result.current.counters).toHaveLength(4);

            // Check that remaining counters kept their original positions
            result.current.counters.forEach(c => {
                const original = originalPositions.find(op => op.id === c.id);
                expect(original).toBeDefined();
                expect(c.x).toBe(original!.x);
                expect(c.y).toBe(original!.y);
            });
        });

        it('removes multiple counters without affecting others', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 3, false);
                result.current.addCounter(-1, 3, false);
            });

            const originalPositions = result.current.counters.map(c => ({
                id: c.id,
                x: c.x,
                y: c.y
            }));

            // Remove first positive and first negative
            const firstPos = result.current.counters.find(c => c.value > 0)!;
            const firstNeg = result.current.counters.find(c => c.value < 0)!;

            act(() => {
                result.current.removeCounter(firstPos.id);
                result.current.removeCounter(firstNeg.id);
            });

            expect(result.current.counters).toHaveLength(4);

            // Remaining counters should have kept their positions
            result.current.counters.forEach(c => {
                const original = originalPositions.find(op => op.id === c.id);
                expect(original).toBeDefined();
                expect(c.x).toBe(original!.x);
                expect(c.y).toBe(original!.y);
            });
        });
    });

    describe('zero pair simultaneous addition', () => {
        it('adds both counters of zero pair simultaneously', () => {
            const { result } = renderHook(() => useCounters());


            act(() => {
                result.current.addZeroPair(false);
            });

            expect(result.current.counters).toHaveLength(2);

            // Both should exist from the start
            const positive = result.current.counters.find(c => c.value > 0);
            const negative = result.current.counters.find(c => c.value < 0);

            expect(positive).toBeDefined();
            expect(negative).toBeDefined();
        });
    });
});
