"use client"

/**
 * Toolbar for the bar model tool.
 *
 * Contains action buttons for bar operations, editing, and utilities.
 */

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import {
    Combine,
    Scissors,
    ArrowRight,
    ArrowDown,
    Trash2,
    Undo2,
    ChevronDown,
    Sigma,
} from "lucide-react"
import {
    Toolbar,
    ToolbarGroup,
    ToolbarButton,
    ToolbarSeparator,
} from "@/components/tool-ui/toolbar"
import { CopyLinkButton } from "@/components/tool-ui/copy-link-button"
import { QuickLabelType } from "../constants"

interface BarModelToolbarProps {
    /** Number of selected bars */
    selectedCount: number;
    /** Whether undo is available */
    canUndo: boolean;
    /** Callback for join operation */
    onJoin: () => void;
    /** Callback for split into halves */
    onSplitHalf: () => void;
    /** Callback for split into thirds */
    onSplitThird: () => void;
    /** Callback for clone right */
    onCloneRight: () => void;
    /** Callback for clone down */
    onCloneDown: () => void;
    /** Callback for quick label */
    onQuickLabel: (labelType: QuickLabelType) => void;
    /** Callback to toggle total/unit status */
    onToggleTotal: () => void;
    /** Callback for clear all */
    onClear: () => void;
    /** Callback for undo */
    onUndo: () => void;
    /** Callback for copy link */
    onCopyLink: () => void;
}

export function BarModelToolbar({
    selectedCount,
    canUndo,
    onJoin,
    onSplitHalf,
    onSplitThird,
    onCloneRight,
    onCloneDown,
    onQuickLabel,
    onToggleTotal,
    onClear,
    onUndo,
    onCopyLink,
}: BarModelToolbarProps) {
    const [showQuickLabel, setShowQuickLabel] = useState(false);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    // Update dropdown position when it opens
    useEffect(() => {
        if (showQuickLabel && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4, // 4px gap below button
                left: rect.left,
            });
        }
    }, [showQuickLabel]);

    const handleQuickLabel = (labelType: QuickLabelType) => {
        onQuickLabel(labelType);
        setShowQuickLabel(false);
    };

    return (
        <Toolbar>
            <ToolbarGroup>
                {/* Quick Label Dropdown */}
                <div className="relative" ref={buttonRef}>
                    <ToolbarButton
                        icon={<ChevronDown size={18} />}
                        label="Quick Label"
                        onClick={() => setShowQuickLabel(!showQuickLabel)}
                        disabled={selectedCount === 0}
                        title="Apply quick labels to selected bars"
                    />
                </div>
                {showQuickLabel && dropdownPos && typeof document !== 'undefined' && createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={() => setShowQuickLabel(false)}
                        />
                        {/* Dropdown menu - using portal so it renders above everything */}
                        <div
                            className="fixed z-[101] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg min-w-[140px]"
                            style={{
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                            }}
                        >
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-lg transition-colors"
                                onClick={() => handleQuickLabel('x')}
                            >
                                x
                            </button>
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => handleQuickLabel('y')}
                            >
                                y
                            </button>
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => handleQuickLabel('?')}
                            >
                                ?
                            </button>
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => handleQuickLabel('units')}
                            >
                                Units
                            </button>
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 last:rounded-b-lg transition-colors"
                                onClick={() => handleQuickLabel('relative')}
                            >
                                Relative
                            </button>
                        </div>
                    </>,
                    document.body
                )}

                {/* Toggle Total */}
                <ToolbarButton
                    icon={<Sigma size={18} />}
                    label="Set Total"
                    onClick={onToggleTotal}
                    disabled={selectedCount !== 1}
                    title="Mark selected bar as Total for relative calculations"
                />

                <ToolbarSeparator />

                {/* Operations */}
                <ToolbarButton
                    icon={<Combine size={18} />}
                    label="Join"
                    onClick={onJoin}
                    disabled={selectedCount < 1}
                    title="Create a new bar equal to the total length of selected bars"
                />
                <ToolbarButton
                    icon={<Scissors size={18} />}
                    label="Split ½"
                    onClick={onSplitHalf}
                    disabled={selectedCount === 0}
                    title="Split selected bars in half"
                />
                <ToolbarButton
                    icon={<Scissors size={18} />}
                    label="Split ⅓"
                    onClick={onSplitThird}
                    disabled={selectedCount === 0}
                    title="Split selected bars into thirds"
                />
                <ToolbarButton
                    icon={<ArrowRight size={18} />}
                    label="Clone R"
                    onClick={onCloneRight}
                    disabled={selectedCount === 0}
                    title="Clone selected bars to the right"
                />
                <ToolbarButton
                    icon={<ArrowDown size={18} />}
                    label="Clone D"
                    onClick={onCloneDown}
                    disabled={selectedCount === 0}
                    title="Clone selected bars below"
                />

                <ToolbarSeparator />

                {/* Clear */}
                <ToolbarButton
                    icon={<Trash2 size={18} />}
                    label="Clear"
                    variant="danger"
                    onClick={onClear}
                    title="Clear all bars"
                />
            </ToolbarGroup>

            <ToolbarGroup>
                {/* Undo */}
                <ToolbarButton
                    icon={<Undo2 size={18} />}
                    label="Undo"
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Undo last action (Ctrl+Z)"
                />

                <ToolbarSeparator />

                {/* Copy link */}
                <CopyLinkButton onCopyLink={onCopyLink} />
            </ToolbarGroup>
        </Toolbar>
    );
}
