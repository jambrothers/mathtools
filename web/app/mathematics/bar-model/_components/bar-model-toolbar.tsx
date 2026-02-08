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
    ArrowLeft,
    ArrowUp,
    Trash2,
    Undo2,
    ChevronDown,
    Sigma,
    Download,
    Tag,
} from "lucide-react"
import {
    Toolbar,
    ToolbarGroup,
    ToolbarButton,
    ToolbarSeparator,
} from "@/components/tool-ui/toolbar"
import { CopyLinkButton } from "@/components/tool-ui/copy-link-button"
import { QuickLabelType, RelativeDisplayFormat, BAR_COLORS } from "../constants"

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
    /** Callback for split into fifths */
    onSplitFifth: () => void;
    /** Callback for clone right */
    onCloneRight: () => void;
    /** Callback for clone down */
    onCloneDown: () => void;
    /** Callback for clone left */
    onCloneLeft: () => void;
    /** Callback for clone up */
    onCloneUp: () => void;
    /** Callback for quick label */
    onQuickLabel: (labelType: QuickLabelType) => void;
    /** Callback to toggle total/unit status */
    onToggleTotal: () => void;
    /** Callback to toggle relative label */
    onToggleRelative: () => void;
    /** Whether properties can be applied (checkboxes) */
    canToggleRelative: boolean;
    /** Current display format of selected bars (undefined if mixed) */
    displayFormat?: RelativeDisplayFormat;
    /** Callback to set display format */
    onSetDisplayFormat: (format: RelativeDisplayFormat) => void;
    /** Current color index of selected bars (undefined if mixed) */
    currentColorIndex?: number;
    /** Callback to set color index */
    onSetColorIndex: (index: number) => void;
    /** Whether format dropdown is enabled */
    canSetDisplayFormat: boolean;
    /** Split validation states */
    canSplit: {
        half: boolean;
        third: boolean;
        fifth: boolean;
    };
    /** Callback for clear all */
    onClear: () => void;
    /** Callback for undo */
    onUndo: () => void;
    /** Callback for copy link */
    onCopyLink: () => void;
    /** Callback for export */
    onExport: () => void;
}

export function BarModelToolbar({
    selectedCount,
    canUndo,
    onJoin,
    onSplitHalf,
    onSplitThird,
    onSplitFifth,
    onCloneRight,
    onCloneLeft,
    onCloneDown,
    onCloneUp,
    onQuickLabel,
    onToggleTotal,
    onToggleRelative,
    canToggleRelative,
    displayFormat,
    onSetDisplayFormat,
    canSetDisplayFormat,
    currentColorIndex,
    onSetColorIndex,
    canSplit,
    onClear,
    onUndo,
    onCopyLink,
    onExport,
}: BarModelToolbarProps) {
    const [activeDropdown, setActiveDropdown] = useState<'quickLabel' | 'split' | 'clone' | 'format' | 'color' | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

    const quickLabelRef = useRef<HTMLDivElement>(null);
    const splitRef = useRef<HTMLDivElement>(null);
    const cloneRef = useRef<HTMLDivElement>(null);
    const formatRef = useRef<HTMLDivElement>(null);
    const colorRef = useRef<HTMLDivElement>(null);

    // Update dropdown position when it opens
    useEffect(() => {
        let ref: React.RefObject<HTMLDivElement | null> | null = null;
        if (activeDropdown === 'quickLabel') ref = quickLabelRef;
        else if (activeDropdown === 'split') ref = splitRef;
        else if (activeDropdown === 'clone') ref = cloneRef;
        else if (activeDropdown === 'format') ref = formatRef;
        else if (activeDropdown === 'color') ref = colorRef;

        if (ref && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4, // 4px gap below button
                left: rect.left,
            });
        }
    }, [activeDropdown]);

    const handleQuickLabel = (labelType: QuickLabelType) => {
        onQuickLabel(labelType);
        setActiveDropdown(null);
    };

    return (
        <Toolbar className="gap-x-4 gap-y-2">
            <ToolbarGroup>
                {/* Quick Label Dropdown */}
                <div className="relative" ref={quickLabelRef}>
                    <ToolbarButton
                        icon={<Tag size={18} />}
                        rightIcon={<ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" />}
                        label="Quick Label"
                        onClick={() => setActiveDropdown(activeDropdown === 'quickLabel' ? null : 'quickLabel')}
                        disabled={selectedCount === 0}
                        title="Apply quick labels to selected bars"
                    />
                </div>
                {activeDropdown === 'quickLabel' && dropdownPos && typeof document !== 'undefined' && createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={() => setActiveDropdown(null)}
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

                        </div>
                    </>,
                    document.body
                )}

                {/* Colour Dropdown */}
                <div className="relative" ref={colorRef}>
                    <ToolbarButton
                        icon={
                            <div
                                className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden"
                                style={{
                                    backgroundColor: currentColorIndex !== undefined
                                        ? undefined // Use class
                                        : '#cbd5e1' // slate-300
                                }}
                            >
                                {currentColorIndex !== undefined && (
                                    <div className={`w-full h-full ${BAR_COLORS[currentColorIndex].bg}`} />
                                )}
                            </div>
                        }
                        rightIcon={<ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" />}
                        label="Color"
                        onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
                        disabled={selectedCount === 0}
                        title="Change bar color"
                    />
                </div>
                {activeDropdown === 'color' && dropdownPos && typeof document !== 'undefined' && createPortal(
                    <>
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={() => setActiveDropdown(null)}
                        />
                        <div
                            className="fixed z-[101] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg min-w-[140px]"
                            style={{
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                            }}
                        >
                            {BAR_COLORS.map((color, index) => (
                                <button
                                    key={index}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3
                                        ${index === 0 ? 'rounded-t-lg' : ''}
                                        ${index === BAR_COLORS.length - 1 ? 'rounded-b-lg' : ''}
                                        ${currentColorIndex === index ? 'bg-slate-50 dark:bg-slate-700/50 font-medium' : ''}
                                    `}
                                    onClick={() => { onSetColorIndex(index); setActiveDropdown(null); }}
                                >
                                    <div className={`w-3 h-3 rounded-full ${color.bg} border ${color.border}`} />
                                    <span>{color.name}</span>
                                </button>
                            ))}
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

                {/* Toggle Relative */}
                <ToolbarButton
                    icon={<span className="text-xs font-bold">%</span>}
                    label="Relative"
                    onClick={onToggleRelative}
                    disabled={!canToggleRelative}
                    title="Toggle relative label display"
                />

                {/* Format Dropdown */}
                <div className="relative" ref={formatRef}>
                    <ToolbarButton
                        icon={<span className="text-xs font-bold">FDP</span>}
                        rightIcon={<ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" />}
                        label="Format"
                        onClick={() => setActiveDropdown(activeDropdown === 'format' ? null : 'format')}
                        disabled={!canSetDisplayFormat}
                        title="Set display format (Fraction, Decimal, Percentage)"
                    />
                </div>
                {activeDropdown === 'format' && dropdownPos && typeof document !== 'undefined' && createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={() => setActiveDropdown(null)}
                        />
                        {/* Dropdown menu */}
                        <div
                            className="fixed z-[101] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg min-w-[140px]"
                            style={{
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                            }}
                        >
                            <button
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-lg transition-colors flex items-center justify-between ${displayFormat === 'total' || !displayFormat ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
                                onClick={() => { onSetDisplayFormat('total'); setActiveDropdown(null); }}
                            >
                                Match Total
                            </button>
                            <button
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${displayFormat === 'fraction' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
                                onClick={() => { onSetDisplayFormat('fraction'); setActiveDropdown(null); }}
                            >
                                Fraction
                            </button>
                            <button
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${displayFormat === 'decimal' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
                                onClick={() => { onSetDisplayFormat('decimal'); setActiveDropdown(null); }}
                            >
                                Decimal
                            </button>
                            <button
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 last:rounded-b-lg transition-colors flex items-center justify-between ${displayFormat === 'percentage' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
                                onClick={() => { onSetDisplayFormat('percentage'); setActiveDropdown(null); }}
                            >
                                Percentage
                            </button>
                        </div>
                    </>,
                    document.body
                )}

                <ToolbarSeparator />

                {/* Operations */}
                <ToolbarButton
                    icon={<Combine size={18} />}
                    label="Join"
                    onClick={onJoin}
                    disabled={selectedCount < 1}
                    title="Create a new bar equal to the total length of selected bars"
                />

                {/* Split Dropdown */}
                <div className="relative" ref={splitRef}>
                    <ToolbarButton
                        icon={<Scissors size={18} />}
                        rightIcon={<ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" />}
                        label="Split"
                        onClick={() => setActiveDropdown(activeDropdown === 'split' ? null : 'split')}
                        disabled={!(canSplit.half || canSplit.third || canSplit.fifth)}
                        title="Split selected bars"
                    />
                </div>
                {activeDropdown === 'split' && dropdownPos && typeof document !== 'undefined' && createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={() => setActiveDropdown(null)}
                        />
                        {/* Dropdown menu */}
                        <div
                            className="fixed z-[101] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg min-w-[140px]"
                            style={{
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                            }}
                        >
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => { onSplitHalf(); setActiveDropdown(null); }}
                                disabled={!canSplit.half}
                            >
                                Split ½
                            </button>
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => { onSplitThird(); setActiveDropdown(null); }}
                                disabled={!canSplit.third}
                            >
                                Split ⅓
                            </button>
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 last:rounded-b-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => { onSplitFifth(); setActiveDropdown(null); }}
                                disabled={!canSplit.fifth}
                            >
                                Split ⅕
                            </button>
                        </div>
                    </>,
                    document.body
                )}

                {/* Clone Dropdown */}
                <div className="relative" ref={cloneRef}>
                    <ToolbarButton
                        icon={<ArrowRight size={18} />}
                        rightIcon={<ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" />}
                        label="Clone"
                        onClick={() => setActiveDropdown(activeDropdown === 'clone' ? null : 'clone')}
                        disabled={selectedCount === 0}
                        title="Clone selected bars"
                    />
                </div>
                {activeDropdown === 'clone' && dropdownPos && typeof document !== 'undefined' && createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={() => setActiveDropdown(null)}
                        />
                        {/* Dropdown menu */}
                        <div
                            className="fixed z-[101] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg min-w-[160px]"
                            style={{
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                            }}
                        >
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-lg transition-colors flex items-center gap-2"
                                onClick={() => { onCloneRight(); setActiveDropdown(null); }}
                            >
                                <ArrowRight size={14} /> Clone Right
                            </button>
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                onClick={() => { onCloneLeft(); setActiveDropdown(null); }}
                            >
                                <ArrowLeft size={14} /> Clone Left
                            </button>
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                onClick={() => { onCloneUp(); setActiveDropdown(null); }}
                            >
                                <ArrowUp size={14} /> Clone Up
                            </button>
                            <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 last:rounded-b-lg transition-colors flex items-center gap-2"
                                onClick={() => { onCloneDown(); setActiveDropdown(null); }}
                            >
                                <ArrowDown size={14} /> Clone Down
                            </button>
                        </div>
                    </>,
                    document.body
                )}

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

                {/* Export */}
                <ToolbarButton
                    icon={<Download size={18} />}
                    label="Export"
                    onClick={onExport}
                    title="Export as PNG or SVG"
                />

                {/* Copy link */}
                <CopyLinkButton onCopyLink={onCopyLink} />
            </ToolbarGroup>
        </Toolbar>
    );
}
