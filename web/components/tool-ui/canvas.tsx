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
        const selectionStartRef = React.useRef<{ x: number, y: number } | null>(null)
        const currentPosRef = React.useRef<{ x: number, y: number } | null>(null)
        const marqueeRef = React.useRef<HTMLDivElement>(null)
        const internalRef = React.useRef<HTMLDivElement>(null)
        const ignoreClickRef = React.useRef(false)

        // Ensure marquee is hidden on mount (for JSDOM/tests where CSS classes aren't applied)
        React.useEffect(() => {
            if (marqueeRef.current) {
                marqueeRef.current.style.display = 'none';
            }
        }, []);

        // Merge refs
        React.useImperativeHandle(ref, () => internalRef.current as HTMLDivElement)

        const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
            // Only start marquee if clicking directly on canvas (not on children)
            if (e.target !== internalRef.current && e.target !== e.currentTarget) return;

            const rect = internalRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            selectionStartRef.current = { x, y };
            currentPosRef.current = { x, y };

            if (marqueeRef.current) {
                marqueeRef.current.style.display = 'block';
                marqueeRef.current.style.left = `${x}px`;
                marqueeRef.current.style.top = `${y}px`;
                marqueeRef.current.style.width = '0px';
                marqueeRef.current.style.height = '0px';
            }
        };

        // Track movement for marquee selection box resize

        const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
            if (!selectionStartRef.current) return;
            const rect = internalRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            currentPosRef.current = { x, y };

            if (marqueeRef.current) {
                const start = selectionStartRef.current;
                const left = Math.min(start.x, x);
                const top = Math.min(start.y, y);
                const width = Math.abs(x - start.x);
                const height = Math.abs(y - start.y);

                marqueeRef.current.style.left = `${left}px`;
                marqueeRef.current.style.top = `${top}px`;
                marqueeRef.current.style.width = `${width}px`;
                marqueeRef.current.style.height = `${height}px`;
            }
        };

        const resetSelection = () => {
            if (marqueeRef.current) {
                marqueeRef.current.style.display = 'none';
            }
            selectionStartRef.current = null;
            currentPosRef.current = null;
        }

        const handlePointerUp = () => {
            if (selectionStartRef.current && currentPosRef.current && onSelectionEnd) {
                // Calculate rect
                const start = selectionStartRef.current;
                const current = currentPosRef.current;

                const x = Math.min(start.x, current.x);
                const y = Math.min(start.y, current.y);
                const width = Math.abs(current.x - start.x);
                const height = Math.abs(current.y - start.y);

                // Only consider it a selection if moved slightly (avoid clicking clearing selection twice)
                if (width > 5 || height > 5) {
                    onSelectionEnd(new DOMRect(x, y, width, height));
                    // Prevent next click from clearing selection
                    ignoreClickRef.current = true;
                    // Reset ignore after a tick to allow future clicks
                    setTimeout(() => { ignoreClickRef.current = false; }, 50);
                }
            }
            resetSelection();
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
                onPointerLeave={resetSelection}
                onPointerCancel={resetSelection}
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
                <div
                    ref={marqueeRef}
                    className="absolute bg-indigo-500/20 border border-indigo-500 z-50 pointer-events-none hidden"
                />
            </div>
        )
    }
)
Canvas.displayName = "Canvas"
