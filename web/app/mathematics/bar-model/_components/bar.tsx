"use client"

/**
 * Bar component for the bar model tool.
 *
 * Renders an individual bar with:
 * - Absolute positioning
 * - Color from BAR_COLORS palette
 * - Selection visual state
 * - Resize handle
 * - Editable label (double-click)
 */

import * as React from "react"
import { Move } from "lucide-react"
import { cn } from "@/lib/utils"
import { BAR_COLORS, BAR_HEIGHT, MIN_BAR_WIDTH, GRID_SIZE } from "../constants"
import { BarData } from "../_hooks/use-bar-model"
import { computeRelativeLabel } from "../_lib/compute-relative-label"

interface BarProps {
    /** Bar data */
    bar: BarData;
    /** The total bar for relative calculation */
    totalBar?: BarData;
    /** Whether this bar is selected */
    isSelected: boolean;
    /** Whether this bar is being dragged */
    isDragging?: boolean;
    /** Callback when bar is clicked/selected */
    onSelect: (id: string, additive: boolean) => void;
    /** Callback when bar drag starts */
    onDragStart: (id: string, e: React.PointerEvent) => void;
    /** Callback when bar is resized */
    onResize: (id: string, width: number) => void;
    /** Callback when label is updated */
    onLabelChange: (id: string, label: string) => void;
}

export function Bar({
    bar,
    totalBar,
    isSelected,
    isDragging,
    onSelect,
    onDragStart,
    onResize,
    onLabelChange,
}: BarProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [localLabel, setLocalLabel] = React.useState(bar.label);
    const [isResizing, setIsResizing] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const resizeRef = React.useRef<{
        startX: number;
        startWidth: number;
    } | null>(null);

    const color = BAR_COLORS[bar.colorIndex] || BAR_COLORS[0];

    // Compute display label
    const displayLabel = React.useMemo(() => {
        if (bar.showRelativeLabel) {
            if (!totalBar) return "?";
            return computeRelativeLabel(bar.width, totalBar.width, totalBar.label);
        }
        return bar.label;
    }, [bar.label, bar.width, bar.showRelativeLabel, totalBar]);

    // Sync local label with bar label when it changes externally
    React.useEffect(() => {
        setLocalLabel(bar.label);
    }, [bar.label]);

    // Focus input when editing
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isEditing) return;
        e.stopPropagation();

        // If shift key, toggle selection
        if (e.shiftKey) {
            onSelect(bar.id, true);
        }
        // If not selected, select it (exclusive)
        // If already selected, do nothing (wait for drag or click)
        else if (!isSelected) {
            onSelect(bar.id, false);
        }

        onDragStart(bar.id, e);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleLabelBlur = () => {
        setIsEditing(false);
        if (localLabel !== bar.label) {
            onLabelChange(bar.id, localLabel);
        }
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLabelBlur();
        } else if (e.key === 'Escape') {
            setLocalLabel(bar.label);
            setIsEditing(false);
        }
    };

    // Resize handle logic
    const handleResizePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setIsResizing(true);

        resizeRef.current = {
            startX: e.clientX,
            startWidth: bar.width,
        };
    };

    const handleResizePointerMove = (e: React.PointerEvent) => {
        if (!resizeRef.current) return;

        const delta = e.clientX - resizeRef.current.startX;
        const newWidth = Math.max(MIN_BAR_WIDTH, resizeRef.current.startWidth + delta);
        const snappedWidth = Math.round(newWidth / GRID_SIZE) * GRID_SIZE;
        onResize(bar.id, snappedWidth);
    };

    const handleResizePointerUp = (e: React.PointerEvent) => {
        resizeRef.current = null;
        setIsResizing(false);
        setIsResizing(false);
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    };

    return (
        <div
            data-testid={`bar-${bar.id}`}
            className={cn(
                "absolute flex items-center justify-center transition-shadow",
                "rounded-lg border-2 shadow-sm cursor-grab active:cursor-grabbing",
                color.bg, color.border, color.text,
                color.bgDark, color.borderDark, color.textDark,
                isSelected && "ring-2 ring-blue-500 ring-offset-1 z-10",
                isSelected && "ring-2 ring-blue-500 ring-offset-1 z-10",
                isDragging && "opacity-80",
                "touch-none"
            )}
            style={{
                left: bar.x,
                top: bar.y,
                width: bar.width,
                height: BAR_HEIGHT,
                transform: isSelected ? 'translateY(-2px)' : 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={(e) => {
                if (isEditing) return;
                // If it was a click (not a drag), and was already selected,
                // select ONLY this one to allow breaking out of multi-selection.
                // We check if event was likely a click by looking at move distance? 
                // Or just if drag didn't start. 
                // Actually, the requirement in the plan was:
                // "if a user clicks (down then up without dragging) an already selected bar"
                // The onPointerUp here fires after the global pointermove might have happened.
                if (isSelected && !isDragging && !e.shiftKey) {
                    onSelect(bar.id, false);
                }
            }}
            onDoubleClick={handleDoubleClick}
        >
            {/* Drag indicator for selected bars */}
            {isSelected && !isEditing && (
                <div className="absolute left-2 opacity-50">
                    <Move size={14} />
                </div>
            )}

            {/* Label - editable or display */}
            {isEditing ? (
                <input
                    ref={inputRef}
                    className={cn(
                        "w-full h-full bg-transparent text-center outline-none",
                        "font-bold text-lg",
                        color.text, color.textDark
                    )}
                    value={localLabel}
                    onChange={(e) => setLocalLabel(e.target.value)}
                    onBlur={handleLabelBlur}
                    onKeyDown={handleLabelKeyDown}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={cn(
                        "text-lg font-medium select-none truncate px-1",
                        color.text,
                        color.textDark
                    )}>
                        {displayLabel}
                    </span>
                </div>
            )}

            {/* Total Indicator */}
            {bar.isTotal && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 pointer-events-none">
                    TOTAL
                </div>
            )}

            {/* Resize handle */}
            <div
                className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center hover:bg-black/10 transition-colors rounded-r"
                onPointerDown={handleResizePointerDown}
                onPointerMove={handleResizePointerMove}
                onPointerUp={handleResizePointerUp}
                onPointerCancel={handleResizePointerUp}
            >
                <div className="w-1 h-4 bg-black/20 rounded-full" />
            </div>

            {/* Width indicator (shown only when resizing) */}
            {isResizing && (
                <div className="absolute -bottom-6 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-1 rounded border border-slate-200 dark:border-slate-700">
                    {Math.round(bar.width / GRID_SIZE)} units
                </div>
            )}
        </div>
    );
}
