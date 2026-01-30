"use client"

import { useRef, useCallback, useEffect } from "react"

interface UseClickStackOptions {
    delay?: number
}

// Map event names to their priority (higher executes over lower)
type PriorityMap = Record<string, number>;
type HandlerMap = Record<string, () => void>;

export function useClickStack(
    priorities: PriorityMap,
    handlers: HandlerMap,
    options: UseClickStackOptions = {}
) {
    const { delay = 200 } = options; // Default to 200ms for realistic clicking speed

    const stackRef = useRef<Set<string>>(new Set());
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Stable refs for handlers so we don't re-create callbacks
    const handlersRef = useRef(handlers);
    const prioritiesRef = useRef(priorities);

    useEffect(() => {
        handlersRef.current = handlers;
        prioritiesRef.current = priorities;
    }, [handlers, priorities]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const processStack = useCallback(() => {
        const stack = stackRef.current;
        if (stack.size === 0) return;

        // Find highest priority event
        let highestPriorityEvent: string | null = null;
        let highestPriority = -1;

        stack.forEach(event => {
            const priority = prioritiesRef.current[event] || 0;
            if (priority > highestPriority) {
                highestPriority = priority;
                highestPriorityEvent = event;
            }
        });

        // Execute handler
        if (highestPriorityEvent && handlersRef.current[highestPriorityEvent]) {
            handlersRef.current[highestPriorityEvent]();
        }

        // Clear stack
        stackRef.current.clear();
        timerRef.current = null;
    }, []);

    const pushEvent = useCallback((event: string) => {
        // Add to stack
        stackRef.current.add(event);

        // Reset timer (debounce)
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(processStack, delay);
    }, [delay, processStack]);

    return {
        pushEvent
    };
}
