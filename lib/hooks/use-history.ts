"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface UseHistoryOptions<T> {
    maxHistory?: number;
}

export function useHistory<T>(initialState: T, options: UseHistoryOptions<T> = {}) {
    // Current state is separate to allow for fast updates without pushing to history every frame
    const [state, setState] = useState<T>(initialState);
    const stateRef = useRef<T>(state); // Keep ref for clean access in functional tools

    // Sync ref
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // History stack: [oldest ... newest]
    // The "current" state is conceptually after the last item in past
    const [past, setPast] = useState<T[]>([]);
    const [future, setFuture] = useState<T[]>([]);

    const { maxHistory = 20 } = options;

    const pushState = useCallback((newStateOrFn: T | ((prev: T) => T), currentOverride?: T) => {
        const currentState = stateRef.current; // Use ref to ensure we have latest commit
        const newState = typeof newStateOrFn === 'function'
            ? (newStateOrFn as (prev: T) => T)(currentState)
            : newStateOrFn;

        setPast(prev => {
            const itemToPush = currentOverride !== undefined ? currentOverride : currentState;
            const newPast = [...prev, itemToPush];
            if (newPast.length > maxHistory) {
                return newPast.slice(newPast.length - maxHistory);
            }
            return newPast;
        });
        setState(newState);
        setFuture([]); // Clear future on new action
    }, [maxHistory]);

    // Update state WITHOUT pushing to history (e.g. during drag)
    const updateState = useCallback((newState: T) => {
        setState(newState);
    }, []);

    const undo = useCallback(() => {
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setPast(newPast);
        setFuture(prev => [state, ...prev]);
        setState(previous);
    }, [past, state]);

    const redo = useCallback(() => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, state]);
        setFuture(newFuture);
        setState(next);
    }, [future, state]);

    const clearHistory = useCallback(() => {
        setPast([]);
        setFuture([]);
    }, []);

    return {
        state,
        pushState,
        updateState,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        clearHistory
    };
}
