"use client"

import * as React from "react"
import { useDraggable } from "@/lib/hooks/use-draggable"
import { Counter, CounterType } from "../_hooks/use-counters"
import { Position } from "@/types/manipulatives"
import { getCounterLabel } from "./counter-type-select"

interface DraggableCounterProps {
    counter: Counter
    counterType: CounterType
    isAnimating: boolean
    isBreathing: boolean
    isSelected: boolean
    onRemove: (id: number) => void
    onSelect: (id: number, multi: boolean) => void
    onFlip: (id: number) => void
    onDragStart: (id: number) => void

    onDragMove: (id: number, delta: { x: number, y: number }, position: Position) => void
    onDragEnd: (id: number, x: number, y: number) => void
}

// CLICK_DELAY_MS and DOUBLE_CLICK_COOLDOWN_MS removed as they are no longer used

/**
 * A draggable counter component.
 * - Single click removes the counter (after short delay to detect double-click)
 * - Double click flips the counter
 * - Drag to move (drag threshold prevents accidental removal)
 */
export function DraggableCounter({
    counter,
    counterType,
    isAnimating,
    isBreathing,
    isSelected,
    onRemove, // eslint-disable-line @typescript-eslint/no-unused-vars
    onSelect,
    onFlip,
    onDragStart,
    onDragMove,
    onDragEnd
}: DraggableCounterProps) {
    const didDragRef = React.useRef(false)
    // Removed complex timeout refs for click-to-delete as we now select on click

    const { position, isDragging, handlePointerDown } = useDraggable(
        String(counter.id),
        { x: counter.x, y: counter.y },
        {
            disabled: isAnimating,
            onDragStart: () => {
                didDragRef.current = true
                onDragStart(counter.id)
            },
            onDragMove: (id: string, newPos: Position, delta: Position) => {
                onDragMove(counter.id, delta, newPos)
            },
            onDragEnd: (id: string, pos: Position) => {
                onDragEnd(counter.id, pos.x, pos.y)
            }
        }
    )

    // Removed cleanup effect for clickTimeout

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        // If we didn't drag, treat as select
        if (!didDragRef.current && !isAnimating) {
            onSelect(counter.id, e.shiftKey || e.metaKey || e.ctrlKey);
        }
    }

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()

        if (!isAnimating) {
            onFlip(counter.id)
        }
    }

    const handlePointerDownWrapper = (e: React.PointerEvent) => {
        didDragRef.current = false
        // Select on down if not already selected (for immediate drag of unselected item)
        // If shift key is held, we want to toggle, but usually drag start handles movement.
        // If we select here, we might deselect other items.
        // Best approach: If not selected, select it (exclusive). If selected, do nothing (wait for drag or click in handleClick)
        if (!isSelected && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
            onSelect(counter.id, false);
        }
        else if (e.shiftKey || e.metaKey || e.ctrlKey) {
            // Don't toggle selection on down, wait for click, UNLESS we drag.
            // But if we drag, we want it to be part of the group.
            // Common pattern: Toggle on click, but ensure it's selected on drag start?
            // Actually, let logic in handleClick handle toggle.
        }

        handlePointerDown(e)
    }

    // Separate transition for entering/leaving vs dragging
    // No transition during drag for immediate response
    const transitionClass = isDragging
        ? ''
        : (counter.isNew || counter.isLeaving)
            ? 'transition-all duration-500'
            : 'transition-shadow duration-150'

    return (
        <div
            data-testid="counter"
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDownWrapper}
            className={`
                absolute w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg border-4 
                flex items-center justify-center text-3xl font-bold 
                ${transitionClass}
                select-none cursor-grab active:cursor-grabbing
                ${counter.value > 0
                    ? 'bg-yellow-400 border-yellow-500 text-yellow-900 ring-yellow-200'
                    : 'bg-red-500 border-red-600 text-white ring-red-200'
                }
                ${!isAnimating && !isDragging ? 'hover:shadow-xl hover:brightness-105' : ''}
                ${isDragging ? 'z-50 shadow-2xl cursor-grabbing brightness-105' : ''}
                ${counter.isNew ? 'scale-0 opacity-0' : ''}
                ${counter.isLeaving ? 'scale-0 opacity-0' : ''}
                ${isBreathing ? 'shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-4 ring-blue-400 ring-opacity-60 z-20' : ''}
                ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-100 z-30' : ''}
                touch-none
            `}
            style={{
                left: 0,
                top: 0,
                transform: `translate(${position.x}px, ${position.y}px)${isDragging ? ' scale(1.05)' : ''}`,
                touchAction: 'none'
            }}
        >
            <span className="relative z-10 drop-shadow-md pointer-events-none text-lg md:text-xl font-bold">
                {getCounterLabel(counterType, counter.value > 0)}
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none" />
            <div className="absolute top-2 left-2 w-1/3 h-1/3 bg-white/30 rounded-full blur-[2px] pointer-events-none" />
        </div>
    )
}
