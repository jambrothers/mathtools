"use client"

import * as React from "react"
import { createPortal } from "react-dom"
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
    /** Label text to display (optional) */
    label?: React.ReactNode
}

/**
 * A draggable sidebar item that can be dragged to the canvas.
 * Supports:
 * - Click-to-add interactions (onClick)
 * - Native HTML5 drag-and-drop for mouse
 * - Custom pointer-based drag for touch/pen (for interactive whiteboards)
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
    // State to trigger render when drag starts (and store initial visual position)
    const [activeDragPos, setActiveDragPos] = React.useState<{ x: number; y: number } | null>(null);

    // Refs for internal tracking
    const pointerDownPosRef = React.useRef<{ x: number; y: number } | null>(null);
    const ghostRef = React.useRef<HTMLDivElement>(null);

    const dragDataRef = React.useRef(dragData);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    // Keep dragData ref up-to-date
    React.useEffect(() => {
        dragDataRef.current = dragData;
    }, [dragData]);

    // Native HTML5 drag for mouse
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'copy';
    };

    // Touch/pen drag handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        // Only use custom drag for touch/pen, let mouse use native drag
        if (e.pointerType === 'mouse') return;

        // Don't capture or start drag yet - wait for move to confirm intent
        e.currentTarget.setPointerCapture(e.pointerId);

        pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse') return;
        if (!pointerDownPosRef.current) return;

        const currentX = e.clientX;
        const currentY = e.clientY;

        // If not yet dragging, check threshold
        if (!activeDragPos) {
            const startX = pointerDownPosRef.current.x;
            const startY = pointerDownPosRef.current.y;

            const dist = Math.sqrt(
                Math.pow(currentX - startX, 2) +
                Math.pow(currentY - startY, 2)
            );

            if (dist > 5) {
                // Start dragging: triggers render to mount ghost
                setActiveDragPos({ x: currentX, y: currentY });
            }
            return;
        }

        // If dragging, update ghost element directly (imperative update to avoid re-renders)
        if (ghostRef.current) {
            ghostRef.current.style.left = `${currentX}px`;
            ghostRef.current.style.top = `${currentY}px`;
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse') return;

        if (!activeDragPos) {
            // Was just a tap, not a drag - clean up
            pointerDownPosRef.current = null;
            return;
        }

        // Find element under pointer (guard for SSR/test environments)
        const target = typeof document !== 'undefined' && document.elementFromPoint
            ? document.elementFromPoint(e.clientX, e.clientY)
            : null;

        // Look for a canvas element (any element with data-testid containing "canvas")
        const canvas = target?.closest('[data-testid*="canvas"]');

        if (canvas) {
            // Dispatch custom touchdrop event
            const touchDropEvent = new CustomEvent('touchdrop', {
                bubbles: true,
                detail: {
                    dragData: dragDataRef.current,
                    clientX: e.clientX,
                    clientY: e.clientY
                }
            });
            canvas.dispatchEvent(touchDropEvent);
        }

        // Clean up
        setActiveDragPos(null);
        pointerDownPosRef.current = null;
    };

    const handlePointerCancel = () => {
        setActiveDragPos(null);
        pointerDownPosRef.current = null;
    };

    return (
        <>
            <button
                ref={buttonRef}
                draggable
                onDragStart={handleDragStart}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onClick={onClick}
                className={cn(
                    "flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md w-full transition-colors group text-left cursor-grab active:cursor-grabbing disabled:opacity-50 disabled:cursor-not-allowed touch-none",
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

            {/* Ghost element during touch drag */}
            {activeDragPos && typeof document !== 'undefined' && createPortal(
                <div
                    ref={ghostRef}
                    data-testid="drag-ghost"
                    className="fixed pointer-events-none z-[9999] opacity-80 scale-110"
                    style={{
                        left: activeDragPos.x,
                        top: activeDragPos.y,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {icon || (
                        <div className="w-8 h-8 rounded-full bg-indigo-500 shadow-lg" />
                    )}
                </div>,
                document.body
            )}
        </>
    );
}
