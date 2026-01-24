"use client"

/**
 * Toolbar for the bar model tool.
 *
 * Contains action buttons for bar operations, editing, and utilities.
 */

import {
    Combine,
    Scissors,
    Copy,
    Trash2,
    RefreshCcw,
    Undo2,
} from "lucide-react"
import {
    Toolbar,
    ToolbarGroup,
    ToolbarButton,
    ToolbarSeparator,
} from "@/components/tool-ui/toolbar"
import { CopyLinkButton } from "@/components/tool-ui/copy-link-button"

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
    /** Callback for clone operation */
    onClone: () => void;
    /** Callback for delete selected */
    onDeleteSelected: () => void;
    /** Callback for clear all */
    onClearAll: () => void;
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
    onClone,
    onDeleteSelected,
    onClearAll,
    onUndo,
    onCopyLink,
}: BarModelToolbarProps) {
    return (
        <Toolbar>
            <ToolbarGroup>
                {/* Selection info */}
                <span className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Selected: {selectedCount}
                </span>

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
                    icon={<Copy size={18} />}
                    label="Clone"
                    onClick={onClone}
                    disabled={selectedCount === 0}
                    title="Clone selected bars"
                />

                <ToolbarSeparator />

                {/* Edit actions */}
                <ToolbarButton
                    icon={<Trash2 size={18} />}
                    label="Delete"
                    variant="danger"
                    onClick={onDeleteSelected}
                    disabled={selectedCount === 0}
                    title="Delete selected bars"
                />
                <ToolbarButton
                    icon={<RefreshCcw size={18} />}
                    onClick={onClearAll}
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
