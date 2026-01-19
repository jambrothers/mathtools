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
    onRemove: (id: number) => void
    onFlip: (id: number) => void
    onDragEnd: (id: number, x: number, y: number) => void
}

const CLICK_DELAY_MS = 250 // Delay before single-click removal to allow double-click
const DOUBLE_CLICK_COOLDOWN_MS = 100 // Ignore clicks after double-click for this duration

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
    onRemove,
    onFlip,
    onDragEnd
}: DraggableCounterProps) {
    const didDragRef = React.useRef(false)
    const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const doubleClickedAtRef = React.useRef<number>(0)

    const { position, isDragging, handleMouseDown } = useDraggable(
        String(counter.id),
        { x: counter.x, y: counter.y },
        {
            disabled: isAnimating,
            onDragStart: () => {
                didDragRef.current = true
                // Cancel pending click if we start dragging
                if (clickTimeoutRef.current) {
                    clearTimeout(clickTimeoutRef.current)
                    clickTimeoutRef.current = null
                }
            },
            onDragEnd: (id: string, pos: Position) => {
                onDragEnd(counter.id, pos.x, pos.y)
            }
        }
    )

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current)
            }
        }
    }, [])

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()

        // Ignore clicks during cooldown after double-click
        const timeSinceDoubleClick = Date.now() - doubleClickedAtRef.current
        if (timeSinceDoubleClick < DOUBLE_CLICK_COOLDOWN_MS) {
            return
        }

        // Only schedule removal if we didn't just drag
        if (!didDragRef.current && !isAnimating) {
            // Cancel any existing timeout first
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current)
            }
            // Schedule removal after delay (will be cancelled if double-click occurs)
            clickTimeoutRef.current = setTimeout(() => {
                onRemove(counter.id)
                clickTimeoutRef.current = null
            }, CLICK_DELAY_MS)
        }
    }

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()

        // Record when we double-clicked to create a cooldown period
        doubleClickedAtRef.current = Date.now()

        // Cancel pending single-click removal
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current)
            clickTimeoutRef.current = null
        }
        if (!isAnimating) {
            onFlip(counter.id)
        }
    }

    const handleMouseDownWrapper = (e: React.MouseEvent) => {
        didDragRef.current = false
        handleMouseDown(e)
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
            onMouseDown={handleMouseDownWrapper}
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
