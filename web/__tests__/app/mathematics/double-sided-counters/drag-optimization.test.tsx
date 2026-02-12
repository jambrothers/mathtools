import { renderHook, act } from '@testing-library/react';
import { useCounters } from '@/app/mathematics/double-sided-counters/_hooks/use-counters';

// Create a spy for updateState
const updateStateSpy = jest.fn();

// Mock useHistory hook
jest.mock('@/lib/hooks/use-history', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useHistory: (initialState: any) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const [state, setState] = require('react').useState(initialState);
        return {
            state,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pushState: (newState: any) => {
                if (typeof newState === 'function') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setState((prev: any) => newState(prev));
                } else {
                    setState(newState);
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updateState: (newState: any) => {
                updateStateSpy(newState); // Call the spy
                if (typeof newState === 'function') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setState((prev: any) => newState(prev));
                } else {
                    setState(newState);
                }
            },
            undo: jest.fn(),
            redo: jest.fn(),
            canUndo: true,
            canRedo: true,
            beginTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            cancelTransaction: jest.fn(),
        };
    }
}));

describe('useCounters Drag Optimization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        updateStateSpy.mockClear();
    });

    it('should NOT update state when dragging a single counter (optimization)', () => {
        const { result } = renderHook(() => useCounters());

        // Add a counter
        act(() => {
            result.current.addCounter(1, 1, false);
        });

        // Wait for async initialization if needed?
        // addCounter uses setTimeout for isNew flag, but adds to state immediately via pushState.
        // However, useHistory mock is synchronous.

        const counterId = result.current.counters[0].id;

        // Drag it
        act(() => {
            result.current.handleDragMove(counterId, { x: 10, y: 10 });
        });

        // Expectation: updateState should NOT be called because it's a single counter drag
        // This confirms the optimization: local state handles visual drag, global state update is skipped.
        expect(updateStateSpy).not.toHaveBeenCalled();
    });

    it('should update state when dragging multiple counters', () => {
        const { result } = renderHook(() => useCounters());

        // Add two counters
        // Note: addCounter handles multiple counts internally, but let's do separate calls or use count param
        act(() => {
            result.current.addCounter(1, 1, false);
        });
        act(() => {
            result.current.addCounter(1, 1, false);
        });

        const id1 = result.current.counters[0].id;
        const id2 = result.current.counters[1].id;

        // Select both
        act(() => {
            result.current.handleSelect(id1, true);
            result.current.handleSelect(id2, true);
        });

        // Drag one
        act(() => {
            result.current.handleDragMove(id1, { x: 10, y: 10 });
        });

        // Expectation: updateState SHOULD be called
        expect(updateStateSpy).toHaveBeenCalled();
    });
});
