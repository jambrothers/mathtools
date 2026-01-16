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
