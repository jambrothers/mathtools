"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Data transferred during drag operations from sidebar items.
 * Tools should extend this interface for their specific needs.
 */
export interface SidebarDragData {
    type: string
    value: number
    [key: string]: unknown
}

interface DraggableSidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Data to include in the drag transfer */
    dragData: SidebarDragData
    /** Visual icon/preview to display on the left (e.g., a colored div representing the item) */
    icon?: React.ReactNode
    /** Label text to display */
    label: React.ReactNode
}

/**
 * A draggable sidebar item that can be dragged to the canvas.
 * Supports both drag-and-drop and click-to-add interactions.
 * 
 * Used by: algebra-tiles sidebar, double-sided-counters sidebar
 */
export function DraggableSidebarItem({
    dragData,
    icon,
    label,
    className,
    onClick,
    ...props
}: DraggableSidebarItemProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <button
            draggable
            onDragStart={handleDragStart}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md w-full transition-colors group text-left cursor-grab active:cursor-grabbing disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            {...props}
        >
            {icon && (
                <div className="shrink-0 flex items-center justify-center">
                    {icon}
                </div>
            )}
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-disabled:group-hover:text-slate-600 dark:group-disabled:group-hover:text-slate-400">
                {label}
            </span>
        </button>
    );
}
