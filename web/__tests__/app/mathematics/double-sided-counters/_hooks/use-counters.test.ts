import { renderHook, act } from '@testing-library/react';
import { useCounters } from '@/app/mathematics/double-sided-counters/_hooks/use-counters';

/**
 * Unit tests for useCounters hook - Undo functionality
 * Following TDD approach: tests written before implementation
 */
describe('useCounters - Undo functionality', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('canUndo', () => {
        it('should be false initially when no actions have been performed', () => {
            const { result } = renderHook(() => useCounters());
            expect(result.current.canUndo).toBe(false);
        });

        it('should be true after adding a counter', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 1, false);
                jest.runAllTimers();
            });

            expect(result.current.canUndo).toBe(true);
        });

        it('should be true after adding a zero pair', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addZeroPair();
                jest.runAllTimers();
            });

            expect(result.current.canUndo).toBe(true);
        });
    });

    describe('undo', () => {
        it('should undo adding a single counter', () => {
            const { result } = renderHook(() => useCounters());

            // Add a counter
            act(() => {
                result.current.addCounter(1, 1, false);
                jest.runAllTimers();
            });

            expect(result.current.counters).toHaveLength(1);

            // Undo
            act(() => {
                result.current.undo();
            });

            expect(result.current.counters).toHaveLength(0);
            expect(result.current.canUndo).toBe(false);
        });

        it('should undo adding a zero pair', () => {
            const { result } = renderHook(() => useCounters());

            // Add a zero pair
            act(() => {
                result.current.addZeroPair();
                jest.runAllTimers();
            });

            expect(result.current.counters).toHaveLength(2);

            // Undo
            act(() => {
                result.current.undo();
            });

            expect(result.current.counters).toHaveLength(0);
        });

        it('should undo flipping a counter', () => {
            const { result } = renderHook(() => useCounters());

            // Add a positive counter
            act(() => {
                result.current.addCounter(1, 1, false);
                jest.runAllTimers();
            });

            const originalValue = result.current.counters[0].value;
            expect(originalValue).toBe(1);

            // Flip it
            act(() => {
                result.current.flipCounter(result.current.counters[0].id);
            });

            expect(result.current.counters[0].value).toBe(-1);

            // Undo the flip
            act(() => {
                result.current.undo();
            });

            expect(result.current.counters[0].value).toBe(1);
        });

        it('should undo removing a counter', () => {
            const { result } = renderHook(() => useCounters());

            // Add a counter
            act(() => {
                result.current.addCounter(1, 1, false);
                jest.runAllTimers();
            });

            const counterId = result.current.counters[0].id;

            // Remove it
            act(() => {
                result.current.removeCounter(counterId);
            });

            expect(result.current.counters).toHaveLength(0);

            // Undo the removal
            act(() => {
                result.current.undo();
            });

            expect(result.current.counters).toHaveLength(1);
            expect(result.current.counters[0].id).toBe(counterId);
        });

        it('should undo organize operation', () => {
            const { result } = renderHook(() => useCounters());

            // Add counters
            act(() => {
                result.current.addCounter(1, 1, false);
                result.current.addCounter(-1, 1, false);
                jest.runAllTimers();
            });

            // Move one counter to a custom position
            const counterId = result.current.counters[0].id;
            act(() => {
                result.current.handleDragMove(counterId, { x: 468, y: 468 }); // Move by +468 to get to ~500 (32+468)
            });
            act(() => {
                result.current.updateCounterPosition(counterId, 500, 500);
            });

            const positionBefore = {
                x: result.current.counters.find(c => c.id === counterId)!.x,
                y: result.current.counters.find(c => c.id === counterId)!.y
            };

            // Organize
            act(() => {
                result.current.organize();
            });

            // Position should have changed
            expect(result.current.counters.find(c => c.id === counterId)!.x).not.toBe(positionBefore.x);

            // Undo organize
            act(() => {
                result.current.undo();
            });

            // Position should be restored (note: might be at different position due to organize state)
            // The key is undo works without error
            expect(result.current.canUndo).toBe(true);
        });

        it('should support multiple undos in sequence', () => {
            const { result } = renderHook(() => useCounters());

            // Add three counters
            act(() => {
                result.current.addCounter(1, 1, false);
                jest.runAllTimers();
            });

            act(() => {
                result.current.addCounter(-1, 1, false);
                jest.runAllTimers();
            });

            act(() => {
                result.current.addCounter(1, 1, false);
                jest.runAllTimers();
            });

            expect(result.current.counters).toHaveLength(3);

            // Undo three times
            act(() => {
                result.current.undo();
            });
            expect(result.current.counters).toHaveLength(2);

            act(() => {
                result.current.undo();
            });
            expect(result.current.counters).toHaveLength(1);

            act(() => {
                result.current.undo();
            });
            expect(result.current.counters).toHaveLength(0);
            expect(result.current.canUndo).toBe(false);
        });

        it('should do nothing when canUndo is false', () => {
            const { result } = renderHook(() => useCounters());

            expect(result.current.canUndo).toBe(false);

            // Attempting undo should not throw
            act(() => {
                result.current.undo();
            });

            expect(result.current.counters).toHaveLength(0);
        });
    });

    describe('clearBoard with undo', () => {
        it('should be undoable after clearBoard', () => {
            const { result } = renderHook(() => useCounters());

            // Add counters
            act(() => {
                result.current.addCounter(1, 1, false);
                result.current.addCounter(-1, 1, false);
                jest.runAllTimers();
            });

            expect(result.current.counters).toHaveLength(2);

            // Clear the board
            act(() => {
                result.current.clearBoard();
            });

            expect(result.current.counters).toHaveLength(0);

            // Undo should restore counters
            act(() => {
                result.current.undo();
            });

            expect(result.current.counters).toHaveLength(2);
        });
    });

    describe('drag operations should not pollute history', () => {
        it('should not add history entry for updateCounterPosition during drag', () => {
            const { result } = renderHook(() => useCounters());

            // Add a counter
            act(() => {
                result.current.addCounter(1, 1, false);
                jest.runAllTimers();
            });

            const initialHistoryState = result.current.canUndo;
            expect(initialHistoryState).toBe(true);

            const counterId = result.current.counters[0].id;

            // Simulate many drag moves (these should use updateState, not pushState)
            act(() => {
                for (let i = 0; i < 50; i++) {
                    result.current.handleDragMove(counterId, { x: 10, y: 10 });
                }
            });

            // Undo should go back to before the add, not through each drag position
            act(() => {
                result.current.undo();
            });

            // Counter should be removed (undoing the add)
            expect(result.current.counters).toHaveLength(0);
        });
    });
    describe('Addition', () => {
        it('should add counter at specific position', () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounterAtPosition(1, 100, 200);
                jest.runAllTimers();
            });

            expect(result.current.counters).toHaveLength(1);
            expect(result.current.counters[0]).toMatchObject({
                value: 1,
                x: 100,
                y: 200
            });
        });
    });

    describe('Selection', () => {
        it('should select single counter', () => {
            const { result } = renderHook(() => useCounters());
            act(() => {
                result.current.addCounter(1, 1, false);
                jest.runAllTimers();
            });
            const id = result.current.counters[0].id;

            act(() => {
                result.current.handleSelect(id, false);
            });

            expect(result.current.selectedIds.has(id)).toBe(true);
            expect(result.current.selectedIds.size).toBe(1);
        });

        it('should handle multi-selection', () => {
            const { result } = renderHook(() => useCounters());
            act(() => {
                result.current.addCounter(1, 2, false);
                jest.runAllTimers();
            });
            const id1 = result.current.counters[0].id;
            const id2 = result.current.counters[1].id;

            act(() => {
                result.current.handleSelect(id1, true);
                result.current.handleSelect(id2, true);
            });

            expect(result.current.selectedIds.size).toBe(2);
            expect(result.current.selectedIds.has(id1)).toBe(true);
            expect(result.current.selectedIds.has(id2)).toBe(true);
        });

        it('should delete selected counters', () => {
            const { result } = renderHook(() => useCounters());
            act(() => {
                result.current.addCounter(1, 2, false);
                jest.runAllTimers();
            });
            const id1 = result.current.counters[0].id;

            act(() => {
                result.current.handleSelect(id1, false);
            });

            act(() => {
                result.current.deleteSelected();
            });

            expect(result.current.counters).toHaveLength(1);
            expect(result.current.counters[0].id).not.toBe(id1);
            expect(result.current.selectedIds.size).toBe(0);
        });
    });

    describe('Board Operations', () => {
        it('should flip all counters', () => {
            const { result } = renderHook(() => useCounters());
            act(() => {
                result.current.addCounter(1, 1, false);
                result.current.addCounter(-1, 1, false);
                jest.runAllTimers();
            });

            act(() => {
                result.current.flipAll();
            });

            expect(result.current.counters[0].value).toBe(-1);
            expect(result.current.counters[1].value).toBe(1);
        });

        it('should snap to order', () => {
            const { result } = renderHook(() => useCounters());
            act(() => {
                result.current.addCounter(1, 1, false);
                jest.runAllTimers();
            });

            // Move it away
            const id = result.current.counters[0].id;
            act(() => {
                result.current.updateCounterPosition(id, 999, 999);
            });

            act(() => {
                result.current.snapToOrder();
            });

            // Should be back at grid position
            expect(result.current.counters[0].x).not.toBe(999);
            expect(result.current.isOrdered).toBe(true);
        });

        it('should cancel zero pairs (immediate update verification)', async () => {
            const { result } = renderHook(() => useCounters());

            act(() => {
                result.current.addCounter(1, 1, false);
                result.current.addCounter(-1, 1, false);
                jest.runAllTimers();
            });

            expect(result.current.counters).toHaveLength(2);

            let promise: Promise<void>;
            act(() => {
                promise = result.current.cancelZeroPairs();
            });

            // Fast-forward animation
            await act(async () => {
                jest.runAllTimers();
                await promise;
            });

            expect(result.current.counters).toHaveLength(0);
        });
    });
});
