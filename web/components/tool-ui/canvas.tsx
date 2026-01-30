"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ManipulativeCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Optional grid size in pixels for the background pattern. */
    gridSize?: number
    /** Callback triggered when a marquee selection ends. Returns the selected rectangle. */
    onSelectionEnd?: (rect: DOMRect) => void
}

/**
 * A canvas component that supports drag-based marquee selection and grid background.
 * ForwardRef exposes the underlying div element.
 * 
 * Uses pointer events for touch/pen compatibility.
 */
export const Canvas = React.forwardRef<HTMLDivElement, ManipulativeCanvasProps>(
    ({ className, gridSize, children, onSelectionEnd, onClick, ...props }, ref) => {
        const [selectionBox, setSelectionBox] = React.useState<{ start: { x: number, y: number }, current: { x: number, y: number } } | null>(null)
        const internalRef = React.useRef<HTMLDivElement>(null)
        const ignoreClickRef = React.useRef(false)

        // Merge refs
        React.useImperativeHandle(ref, () => internalRef.current as HTMLDivElement)

        const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
            // Only start marquee if clicking directly on canvas (not on children)
            if (e.target !== internalRef.current && e.target !== e.currentTarget) return;

            const rect = internalRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setSelectionBox({ start: { x, y }, current: { x, y } });
        };

        // Track movement for marquee selection box resize

        const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
            if (!selectionBox) return;
            const rect = internalRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setSelectionBox(prev => prev ? { ...prev, current: { x, y } } : null);
        };

        const handlePointerUp = () => {
            if (selectionBox && onSelectionEnd) {
                // Calculate rect
                const x = Math.min(selectionBox.start.x, selectionBox.current.x);
                const y = Math.min(selectionBox.start.y, selectionBox.current.y);
                const width = Math.abs(selectionBox.current.x - selectionBox.start.x);
                const height = Math.abs(selectionBox.current.y - selectionBox.start.y);

                // Only consider it a selection if moved slightly (avoid clicking clearing selection twice)
                if (width > 5 || height > 5) {
                    onSelectionEnd(new DOMRect(x, y, width, height));
                    // Prevent next click from clearing selection
                    ignoreClickRef.current = true;
                    // Reset ignore after a tick to allow future clicks
                    setTimeout(() => { ignoreClickRef.current = false; }, 50);
                }
            }
            setSelectionBox(null);
        };

        const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (ignoreClickRef.current) {
                ignoreClickRef.current = false;
                return;
            }
            onClick?.(e);
        };

        return (
            <div
                ref={internalRef}
                className={cn(
                    "relative flex-1 bg-slate-50 dark:bg-slate-950 overflow-hidden touch-none select-none",
                    className
                )}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={() => setSelectionBox(null)}
                onPointerCancel={() => setSelectionBox(null)}
                onClick={handleContainerClick}
                {...props}
            >
                {/* Optional Grid Background */}
                {gridSize && (
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                        style={{
                            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                            backgroundSize: `${gridSize}px ${gridSize}px`
                        }}
                    />
                )}
                {children}

                {/* Marquee Box */}
                {selectionBox && (
                    <div
                        className="absolute bg-indigo-500/20 border border-indigo-500 z-50 pointer-events-none"
                        style={{
                            left: Math.min(selectionBox.start.x, selectionBox.current.x),
                            top: Math.min(selectionBox.start.y, selectionBox.current.y),
                            width: Math.abs(selectionBox.current.x - selectionBox.start.x),
                            height: Math.abs(selectionBox.current.y - selectionBox.start.y),
                        }}
                    />
                )}
            </div>
        )
    }
)
Canvas.displayName = "Canvas"
