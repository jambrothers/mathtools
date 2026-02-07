import { renderHook, act } from '@testing-library/react';
import { useHistory } from '@/lib/hooks/use-history';

describe('useHistory', () => {
    it('should initialize with initial state', () => {
        const { result } = renderHook(() => useHistory(0));
        expect(result.current.state).toBe(0);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    it('should push state and allow undo', () => {
        const { result } = renderHook(() => useHistory(0));

        act(() => {
            result.current.pushState(1);
        });

        expect(result.current.state).toBe(1);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);

        act(() => {
            result.current.undo();
        });

        expect(result.current.state).toBe(0);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(true);
    });

    it('should redo after undo', () => {
        const { result } = renderHook(() => useHistory(0));

        act(() => {
            result.current.pushState(1);
        });
        act(() => {
            result.current.undo();
        });
        act(() => {
            result.current.redo();
        });

        expect(result.current.state).toBe(1);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it('should clear future on new push', () => {
        const { result } = renderHook(() => useHistory(0));

        act(() => {
            result.current.pushState(1);
        });
        act(() => {
            result.current.undo();
        });

        // Current state is 0, Future is [1]
        expect(result.current.canRedo).toBe(true);

        act(() => {
            result.current.pushState(2);
        });

        // Current state is 2, Future should be empty
        expect(result.current.state).toBe(2);
        expect(result.current.canRedo).toBe(false);
    });

    it('should update state without history', () => {
        const { result } = renderHook(() => useHistory(0));

        act(() => {
            result.current.updateState(1);
        });

        expect(result.current.state).toBe(1);
        expect(result.current.canUndo).toBe(false); // No history entry created
    });

    it('should handle functional updates', () => {
        const { result } = renderHook(() => useHistory(0));

        act(() => {
            result.current.pushState((prev) => prev + 1);
        });

        expect(result.current.state).toBe(1);

        act(() => {
            result.current.updateState((prev) => prev + 1);
        });

        expect(result.current.state).toBe(2);
    });

    it('should respect maxHistory limit', () => {
        const { result } = renderHook(() => useHistory(0, { maxHistory: 2 }));

        act(() => {
            result.current.pushState(1);
            result.current.pushState(2);
            result.current.pushState(3);
        });

        expect(result.current.state).toBe(3);

        // Undo 1: 3 -> 2
        act(() => { result.current.undo(); });
        expect(result.current.state).toBe(2);

        // Undo 2: 2 -> 1
        act(() => { result.current.undo(); });
        expect(result.current.state).toBe(1);

        // Undo 3: Should not be possible (0 was dropped)
        expect(result.current.canUndo).toBe(false);
    });

    it('should use currentOverride when provided', () => {
        const { result } = renderHook(() => useHistory(0));

        // We are at 0.
        // We push 2, but we say the "previous" state (override) was 10.
        // This is useful if we dragged from 0 to 10, but only want to commit the jump from 10 to 2?
        // Wait, let's read the code for pushState.
        // const itemToPush = currentOverride !== undefined ? currentOverride : currentState;
        // setPast(prev => [...prev, itemToPush]);
        // setState(newState);

        // So if we are at 0.
        // pushState(2, 10).
        // Past becomes [10]. State becomes 2.
        // Undo should go to 10.

        act(() => {
            result.current.pushState(2, 10);
        });

        expect(result.current.state).toBe(2);

        act(() => {
            result.current.undo();
        });

        expect(result.current.state).toBe(10);
    });

    it('should clear history', () => {
        const { result } = renderHook(() => useHistory(0));

        act(() => {
            result.current.pushState(1);
        });

        expect(result.current.canUndo).toBe(true);

        act(() => {
            result.current.clearHistory();
        });

        expect(result.current.state).toBe(1); // State remains
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });
});
