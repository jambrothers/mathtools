import { renderHook, act } from '@testing-library/react';
import { useCounters } from '@/app/mathematics/double-sided-counters/_hooks/use-counters';

// Mock useHistory to just use basic state for testing logic if needed, 
// OR we can use the real one if it's not too complex. 
// Given the bug was about stale closures in async loops, using the real hook is best.
// But useHistory might need mocking if it uses browser specific things? 
// It uses useState/useRef, so it should be fine in JSDOM.

// We need to mock timers for the animation loop
jest.useFakeTimers();

describe('useCounters Hook', () => {
    it('cancels zero pairs without resurrecting counters', async () => {
        const { result } = renderHook(() => useCounters());

        // Add 2 zero pairs (2 positives, 2 negatives)
        // We use immediate updates or wait for timeouts
        act(() => {
            result.current.addZeroPair();
        });
        act(() => {
            jest.advanceTimersByTime(200); // Wait for add animation
        });

        act(() => {
            result.current.addZeroPair();
        });
        act(() => {
            jest.advanceTimersByTime(200);
        });

        expect(result.current.counters).toHaveLength(4);

        // Enable Slow Mode (Sequential) which users reported the bug in
        act(() => {
            result.current.setIsSequentialMode(true);
            result.current.setAnimSpeed(100); // Fast speed for test
        });

        // Trigger Cancel Pairs
        let promise: Promise<void>;
        act(() => {
            promise = result.current.cancelZeroPairs();
        });

        // Advance timers to simulate animation steps
        // The loop is async awaiting 'wait' which uses setTimeout.
        // We need to advance timers repeatedly to flush promises.

        // Loop through the iterations
        // We have 2 pairs, so 2 loops.
        // Instead of manual timing, we can run all timers repeatedly until empty?
        // But the loop is async, so it generates new timers after awaits.

        // Loop through everything aggressively
        // We just need to ensure all async actions complete.
        await act(async () => {
            for (let i = 0; i < 10; i++) {
                jest.runAllTimers();
                await Promise.resolve();
                await Promise.resolve();
            }
        }); // In the bug, counters would re-appear. 
        // Only 0 should remain.
        expect(result.current.counters).toHaveLength(0);
    });
});
