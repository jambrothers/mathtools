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
    const { threshold = 5 } = options;

    // keeping track of local visual position during drag to avoid jank
    const [position, setPosition] = useState(initialPos);
    // Track if we are actively dragging (passed threshold)
    const [isDragging, setIsDragging] = useState(false);

    // Internal state for drag detection
    const [isPointerDown, setIsPointerDown] = useState(false);
    const [dragStartPointer, setDragStartPointer] = useState<Position | null>(null);
    const [startPos, setStartPos] = useState<Position | null>(null);
    const prevPointerRef = React.useRef<Position | null>(null);

    // Sync visual position if external reset happens (e.g. undo)
    useEffect(() => {
        if (!isDragging && (position.x !== initialPos.x || position.y !== initialPos.y)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPosition(initialPos);
        }
    }, [initialPos, isDragging, position.x, position.y]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (options.disabled) return;

        // Capture pointer for reliable tracking across element boundaries
        e.currentTarget.setPointerCapture(e.pointerId);

        setIsPointerDown(true);
        setStartPos(position);
        setDragStartPointer({ x: e.clientX, y: e.clientY });
        prevPointerRef.current = { x: e.clientX, y: e.clientY };

        // Do NOT set isDragging yet, wait for threshold
    }, [position, options]);

    useEffect(() => {
        if (!isPointerDown || !startPos || !dragStartPointer) return;

        const handlePointerMove = (e: PointerEvent) => {
            const scale = options.scale || 1;

            // Check threshold if not yet dragging
            if (!isDragging) {
                const dist = Math.sqrt(
                    Math.pow(e.clientX - dragStartPointer.x, 2) +
                    Math.pow(e.clientY - dragStartPointer.y, 2)
                );

                if (dist < threshold) return; // Ignore movements below threshold

                // Threshold crossed, start drag
                setIsDragging(true);
                options.onDragStart?.(id, startPos);
            }

            // Calculate incremental delta for external consumers
            const movementX = (e.clientX - (prevPointerRef.current?.x || dragStartPointer.x)) / scale;
            const movementY = (e.clientY - (prevPointerRef.current?.y || dragStartPointer.y)) / scale;
            prevPointerRef.current = { x: e.clientX, y: e.clientY };

            // Calculate total displacement for local position
            const dx = (e.clientX - dragStartPointer.x) / scale;
            const dy = (e.clientY - dragStartPointer.y) / scale;

            let newX = startPos.x + dx;
            let newY = startPos.y + dy;

            if (options.gridSize) {
                newX = Math.round(newX / options.gridSize) * options.gridSize;
                newY = Math.round(newY / options.gridSize) * options.gridSize;
            }

            const newPos = { x: newX, y: newY };
            setPosition(newPos);

            options.onDragMove?.(id, newPos, { x: movementX, y: movementY });
        };

        const handlePointerUp = () => {
            if (isDragging) {
                options.onDragEnd?.(id, position);
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
    }, [isPointerDown, isDragging, startPos, dragStartPointer, id, options, position, threshold]);

    // Keep backwards-compatible alias for handleMouseDown during migration
    return {
        position,
        isDragging,
        handlePointerDown,
        /** @deprecated Use handlePointerDown instead */
        handleMouseDown: handlePointerDown as unknown as (e: React.MouseEvent) => void
    };
}
