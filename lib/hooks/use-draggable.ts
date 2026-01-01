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
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [dragStartMouse, setDragStartMouse] = useState<Position | null>(null);
    const [startPos, setStartPos] = useState<Position | null>(null);
    const prevMouseRef = React.useRef<Position | null>(null);

    // Sync visual position if external reset happens (e.g. undo)
    useEffect(() => {
        if (!isDragging) {
            setPosition(initialPos);
        }
    }, [initialPos.x, initialPos.y, isDragging]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (options.disabled) return;

        setIsMouseDown(true);
        setStartPos(position);
        setDragStartMouse({ x: e.clientX, y: e.clientY });
        prevMouseRef.current = { x: e.clientX, y: e.clientY };

        // Do NOT set isDragging yet, wait for threshold
    }, [position, options]);

    useEffect(() => {
        if (!isMouseDown || !startPos || !dragStartMouse) return;

        const handleMouseMove = (e: MouseEvent) => {
            const scale = options.scale || 1;

            // Check threshold if not yet dragging
            if (!isDragging) {
                const dist = Math.sqrt(
                    Math.pow(e.clientX - dragStartMouse.x, 2) +
                    Math.pow(e.clientY - dragStartMouse.y, 2)
                );

                if (dist < threshold) return; // Ignore movements below threshold

                // Threshold crossed, start drag
                setIsDragging(true);
                options.onDragStart?.(id, startPos);
            }

            // Calculate incremental delta for external consumers
            const movementX = (e.clientX - (prevMouseRef.current?.x || dragStartMouse.x)) / scale;
            const movementY = (e.clientY - (prevMouseRef.current?.y || dragStartMouse.y)) / scale;
            prevMouseRef.current = { x: e.clientX, y: e.clientY };

            // Calculate total displacement for local position
            const dx = (e.clientX - dragStartMouse.x) / scale;
            const dy = (e.clientY - dragStartMouse.y) / scale;

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

        const handleMouseUp = (e: MouseEvent) => {
            if (isDragging) {
                options.onDragEnd?.(id, position);
            }

            setIsMouseDown(false);
            setIsDragging(false);
            setStartPos(null);
            setDragStartMouse(null);
            prevMouseRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isMouseDown, isDragging, startPos, dragStartMouse, id, options, position, threshold]);

    return {
        position,
        isDragging,
        handleMouseDown
    };
}
