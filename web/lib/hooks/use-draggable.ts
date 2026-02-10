"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Position } from "@/types/manipulatives"

interface UseDraggableOptions {
    onDragStart?: (id: string, initialPos: Position) => void
    onDragMove?: (id: string, newPos: Position, delta: Position) => void
    onDragEnd?: (id: string, finalPos: Position) => void
    gridSize?: number
    scale?: number
    disabled?: boolean
    threshold?: number // Minimum movement pixels to trigger drag
}

export function useDraggable(
    id: string,
    initialPos: Position,
    options: UseDraggableOptions = {}
) {
    // keeping track of local visual position during drag to avoid jank
    const [position, setPosition] = useState(initialPos);
    // Track if we are actively dragging (passed threshold)
    const [isDragging, setIsDragging] = useState(false);

    // Internal state for drag detection
    const [isPointerDown, setIsPointerDown] = useState(false);
    const [dragStartPointer, setDragStartPointer] = useState<Position | null>(null);
    const [startPos, setStartPos] = useState<Position | null>(null);
    const prevPointerRef = React.useRef<Position | null>(null);

    // Refs to avoid re-attaching listeners on every render/move
    const optionsRef = React.useRef(options);

    React.useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const positionRef = React.useRef(position);
    React.useEffect(() => {
        positionRef.current = position;
    }, [position]);

    const { x: initialX, y: initialY } = initialPos;
    // Sync visual position if external reset happens (e.g. undo)
    useEffect(() => {
        if (!isDragging && (position.x !== initialX || position.y !== initialY)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPosition({ x: initialX, y: initialY });
        }
    }, [initialX, initialY, isDragging, position.x, position.y]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (optionsRef.current.disabled) return;

        // Capture pointer for reliable tracking across element boundaries
        e.currentTarget.setPointerCapture(e.pointerId);

        setIsPointerDown(true);
        setStartPos(positionRef.current);
        setDragStartPointer({ x: e.clientX, y: e.clientY });
        prevPointerRef.current = { x: e.clientX, y: e.clientY };

        // Do NOT set isDragging yet, wait for threshold
    }, []);

    useEffect(() => {
        if (!isPointerDown || !startPos || !dragStartPointer) return;

        const handlePointerMove = (e: PointerEvent) => {
            const currentOptions = optionsRef.current;
            const scale = currentOptions.scale || 1;
            const threshold = currentOptions.threshold ?? 5;

            // Check threshold if not yet dragging
            if (!isDragging) {
                const dist = Math.sqrt(
                    Math.pow(e.clientX - dragStartPointer.x, 2) +
                    Math.pow(e.clientY - dragStartPointer.y, 2)
                );

                if (dist < threshold) return; // Ignore movements below threshold

                // Threshold crossed, start drag
                setIsDragging(true);
                currentOptions.onDragStart?.(id, startPos);
            }

            // Calculate total displacement for local position
            const dx = (e.clientX - dragStartPointer.x) / scale;
            const dy = (e.clientY - dragStartPointer.y) / scale;

            let newX = startPos.x + dx;
            let newY = startPos.y + dy;

            if (currentOptions.gridSize) {
                newX = Math.round(newX / currentOptions.gridSize) * currentOptions.gridSize;
                newY = Math.round(newY / currentOptions.gridSize) * currentOptions.gridSize;
            }

            const newPos = { x: newX, y: newY };

            // Optimization: Skip updates if position hasn't changed (throttling for grid snap)
            if (newPos.x === positionRef.current.x && newPos.y === positionRef.current.y) {
                return;
            }

            // Use snapped delta so external consumers update in sync with visual snap
            const deltaX = newPos.x - positionRef.current.x;
            const deltaY = newPos.y - positionRef.current.y;

            setPosition(newPos);
            positionRef.current = newPos; // Update ref immediately so handlers see it

            currentOptions.onDragMove?.(id, newPos, { x: deltaX, y: deltaY });

            prevPointerRef.current = { x: e.clientX, y: e.clientY };
        };

        const handlePointerUp = () => {
            const currentOptions = optionsRef.current;
            if (isDragging) {
                currentOptions.onDragEnd?.(id, positionRef.current);
            }

            setIsPointerDown(false);
            setIsDragging(false);
            setStartPos(null);
            setDragStartPointer(null);
            prevPointerRef.current = null;
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        // Also listen to pointercancel for touch interruptions
        window.addEventListener('pointercancel', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [isPointerDown, isDragging, startPos, dragStartPointer, id]);

    // Keep backwards-compatible alias for handleMouseDown during migration
    return {
        position,
        isDragging,
        handlePointerDown,
        /** @deprecated Use handlePointerDown instead */
        handleMouseDown: handlePointerDown as unknown as (e: React.MouseEvent) => void
    };
}
