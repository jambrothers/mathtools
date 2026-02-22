import { renderHook, act } from '@testing-library/react'
import { useClickStack } from '@/lib/hooks/use-click-stack'

describe('useClickStack', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should debounce execution of handlers', () => {
        const handler = jest.fn()
        const priorities = { 'click': 1 }
        const handlers = { 'click': handler }

        const { result } = renderHook(() => useClickStack(priorities, handlers))

        act(() => {
            result.current.pushEvent('click')
        })

        expect(handler).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(100)
        })

        expect(handler).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(100)
        })

        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should prioritize higher priority events', () => {
        const highPriorityHandler = jest.fn()
        const lowPriorityHandler = jest.fn()

        const priorities = { 'high': 10, 'low': 1 }
        const handlers = { 'high': highPriorityHandler, 'low': lowPriorityHandler }

        const { result } = renderHook(() => useClickStack(priorities, handlers))

        act(() => {
            result.current.pushEvent('low')
            result.current.pushEvent('high')
        })

        act(() => {
            jest.advanceTimersByTime(200)
        })

        expect(highPriorityHandler).toHaveBeenCalledTimes(1)
        expect(lowPriorityHandler).not.toHaveBeenCalled()
    })

    it('should execute only the highest priority handler among stacked events', () => {
        const highPriorityHandler = jest.fn()
        const mediumPriorityHandler = jest.fn()
        const lowPriorityHandler = jest.fn()

        const priorities = { 'high': 10, 'medium': 5, 'low': 1 }
        const handlers = {
            'high': highPriorityHandler,
            'medium': mediumPriorityHandler,
            'low': lowPriorityHandler
        }

        const { result } = renderHook(() => useClickStack(priorities, handlers))

        act(() => {
            result.current.pushEvent('low')
            result.current.pushEvent('medium')
            // 'high' is not pushed
        })

        act(() => {
            jest.advanceTimersByTime(200)
        })

        expect(mediumPriorityHandler).toHaveBeenCalledTimes(1)
        expect(lowPriorityHandler).not.toHaveBeenCalled()
        expect(highPriorityHandler).not.toHaveBeenCalled()
    })

    it('should clear stack after execution', () => {
        const handler = jest.fn()
        const priorities = { 'click': 1 }
        const handlers = { 'click': handler }

        const { result } = renderHook(() => useClickStack(priorities, handlers))

        act(() => {
            result.current.pushEvent('click')
        })

        act(() => {
            jest.advanceTimersByTime(200)
        })

        expect(handler).toHaveBeenCalledTimes(1)

        // Clear mock calls
        handler.mockClear()

        // Push event again - should be processed again
        act(() => {
            result.current.pushEvent('click')
        })

        act(() => {
            jest.advanceTimersByTime(200)
        })

        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not throw if handler is missing for an event', () => {
        const priorities = { 'click': 1 }
        const handlers = {} // No handler for 'click'

        const { result } = renderHook(() => useClickStack(priorities, handlers))

        act(() => {
            result.current.pushEvent('click')
        })

        act(() => {
            jest.advanceTimersByTime(200)
        })

        // Implicitly asserting no error thrown
    })

    it('should use custom delay', () => {
        const handler = jest.fn()
        const priorities = { 'click': 1 }
        const handlers = { 'click': handler }
        const delay = 500

        const { result } = renderHook(() => useClickStack(priorities, handlers, { delay }))

        act(() => {
            result.current.pushEvent('click')
        })

        act(() => {
            jest.advanceTimersByTime(200)
        })
        expect(handler).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(300)
        })
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should use updated handlers', () => {
        const handler1 = jest.fn()
        const handler2 = jest.fn()
        const priorities = { 'click': 1 }

        const { result, rerender } = renderHook(
            ({ handlers }) => useClickStack(priorities, handlers),
            { initialProps: { handlers: { 'click': handler1 } } }
        )

        act(() => {
            result.current.pushEvent('click')
        })

        // Rerender with new handler before timer fires
        rerender({ handlers: { 'click': handler2 } })

        act(() => {
            jest.advanceTimersByTime(200)
        })

        expect(handler1).not.toHaveBeenCalled()
        expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should handle event with no defined priority (default 0)', () => {
        const handler = jest.fn()
        const priorities = {} // No priority for 'click'
        const handlers = { 'click': handler }

        const { result } = renderHook(() => useClickStack(priorities, handlers))

        act(() => {
            result.current.pushEvent('click')
        })

        act(() => {
            jest.advanceTimersByTime(200)
        })

        // Default priority is 0, which is > -1, so it should execute
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not execute handler if priority is too low (negative)', () => {
        // Implementation detail: highestPriority starts at -1.
        // If we provide a priority <= -1, it won't be selected.
        const handler = jest.fn()
        const priorities = { 'click': -5 }
        const handlers = { 'click': handler }

        const { result } = renderHook(() => useClickStack(priorities, handlers))

        act(() => {
            result.current.pushEvent('click')
        })

        act(() => {
            jest.advanceTimersByTime(200)
        })

        expect(handler).not.toHaveBeenCalled()
    })
})
