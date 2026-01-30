"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Position } from "@/types/manipulatives"

/**
 * Props for the TileBase component.
 */
interface TileBaseProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Absolute position on the canvas. */
    position: Position
    /** Rotation angle in degrees. */
    rotation?: number // in degrees
    /** Whether the tile is currently being dragged (applies z-index and cursor styles). */
    isDragging?: boolean
    /** Whether the tile is selected (applies highlight ring). */
    isSelected?: boolean
    /** Handler for pointer down events (supports mouse, touch, and pen). */
    onPointerDown?: (e: React.PointerEvent) => void
}

/**
 * A base component for draggable manipulative tiles.
 * Handles common styles like positioning, rotation, selection highlighting, and drag states.
 */

export function TileBase({
    position,
    rotation = 0,
    isDragging,
    isSelected,
    onPointerDown,
    className,
    style,
    children,
    ...props
}: TileBaseProps) {
    return (
        <div
            className={cn(
                "absolute cursor-grab active:cursor-grabbing select-none will-change-transform",
                "bg-white dark:bg-slate-800 shadow-sm rounded border border-slate-300 dark:border-slate-600", // Default styles (can be overridden)
                isSelected && "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 z-10",
                isDragging && "z-50 cursor-grabbing", // Remove scale/shadow pop
                className
            )}
            style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                left: 0,
                top: 0,
                touchAction: 'none',
                ...style
            }} // Avoid overriding transform if possible, but here we set position
            onPointerDown={onPointerDown}
            {...props}
        >
            {children}
        </div>
    )
}
