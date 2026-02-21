import { renderHook, act } from '@testing-library/react';
import { useClickStack } from '@/lib/hooks/use-click-stack';

describe('useClickStack', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should execute the handler after the specified delay', () => {
        const handler = jest.fn();
        const { result } = renderHook(() => useClickStack(
            { 'click': 1 },
            { 'click': handler },
            { delay: 100 }
        ));

        act(() => {
            result.current.pushEvent('click');
        });

        expect(handler).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should use default delay of 200ms if not specified', () => {
        const handler = jest.fn();
        const { result } = renderHook(() => useClickStack(
            { 'click': 1 },
            { 'click': handler }
        ));

        act(() => {
            result.current.pushEvent('click');
        });

        act(() => {
            jest.advanceTimersByTime(199);
        });
        expect(handler).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should prioritize higher priority events', () => {
        const lowPriorityHandler = jest.fn();
        const highPriorityHandler = jest.fn();

        const priorities = { 'low': 1, 'high': 10 };
        const handlers = { 'low': lowPriorityHandler, 'high': highPriorityHandler };

        const { result } = renderHook(() => useClickStack(priorities, handlers, { delay: 100 }));

        act(() => {
            result.current.pushEvent('low');
            result.current.pushEvent('high');
        });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(highPriorityHandler).toHaveBeenCalledTimes(1);
        expect(lowPriorityHandler).not.toHaveBeenCalled();
    });

    it('should debounce multiple calls and only execute once', () => {
        const handler = jest.fn();
        const { result } = renderHook(() => useClickStack(
            { 'click': 1 },
            { 'click': handler },
            { delay: 100 }
        ));

        act(() => {
            result.current.pushEvent('click');
        });

        // Advance half way, push again
        act(() => {
            jest.advanceTimersByTime(50);
            result.current.pushEvent('click');
        });

        // Original timer would have fired here (100ms total), but it should be reset
        act(() => {
            jest.advanceTimersByTime(50);
        });

        expect(handler).not.toHaveBeenCalled();

        // Advance to complete the second timer (50 + 50 more needed)
        act(() => {
            jest.advanceTimersByTime(50);
        });

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple different events and pick the highest priority one', () => {
        const handlerA = jest.fn();
        const handlerB = jest.fn();
        const handlerC = jest.fn();

        const priorities = { 'A': 1, 'B': 2, 'C': 3 };
        const handlers = { 'A': handlerA, 'B': handlerB, 'C': handlerC };

        const { result } = renderHook(() => useClickStack(priorities, handlers, { delay: 100 }));

        act(() => {
            result.current.pushEvent('A');
            result.current.pushEvent('C');
            result.current.pushEvent('B');
        });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(handlerC).toHaveBeenCalledTimes(1);
        expect(handlerA).not.toHaveBeenCalled();
        expect(handlerB).not.toHaveBeenCalled();
    });

    it('should gracefully handle events with no handler', () => {
        const { result } = renderHook(() => useClickStack(
            { 'click': 1 },
            {}, // No handlers
            { delay: 100 }
        ));

        act(() => {
            result.current.pushEvent('click');
        });

        // Should not throw
        act(() => {
            jest.advanceTimersByTime(100);
        });
    });

    it('should clear timer on unmount', () => {
        const handler = jest.fn();
        const { result, unmount } = renderHook(() => useClickStack(
            { 'click': 1 },
            { 'click': handler },
            { delay: 100 }
        ));

        act(() => {
            result.current.pushEvent('click');
        });

        unmount();

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(handler).not.toHaveBeenCalled();
    });

    it('should update handlers if props change', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        const { result, rerender } = renderHook(
            (props) => useClickStack({ 'click': 1 }, props.handlers, { delay: 100 }),
            { initialProps: { handlers: { 'click': handler1 } } }
        );

        act(() => {
            result.current.pushEvent('click');
        });

        // Change handler before execution
        rerender({ handlers: { 'click': handler2 } });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should use default priority 0 if not specified', () => {
        const handler = jest.fn();
        const priorities = {}; // 'unknown' is missing, implies 0
        const handlers = { 'unknown': handler };

        const { result } = renderHook(() => useClickStack(priorities, handlers, { delay: 100 }));

        act(() => {
            result.current.pushEvent('unknown');
        });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(handler).toHaveBeenCalledTimes(1);
    });
});
