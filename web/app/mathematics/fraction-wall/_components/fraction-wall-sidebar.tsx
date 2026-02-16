import React from 'react';
import { LabelMode } from '../_lib/url-state';
import { Sidebar, SidebarSection } from '@/components/tool-ui/sidebar';
import { ControlToggle } from '@/components/tool-ui/control-panel';
import { Trash2, Hash, Percent, Binary, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FractionWallSidebarProps {
    visibleDenominators: number[];
    onToggleDenominator: (d: number) => void;
    labelMode: LabelMode;
    onLabelModeChange: (mode: LabelMode) => void;
    showEquivalenceLines: boolean;
    onToggleEquivalenceLines: (show: boolean) => void;
    onClear: () => void;
    onCopyLink: () => void;
    onExport: () => void;
}

export function FractionWallSidebar({
    visibleDenominators,
    onToggleDenominator,
    labelMode,
    onLabelModeChange,
    showEquivalenceLines,
    onToggleEquivalenceLines,
    onClear,
    onCopyLink,
    onExport
}: FractionWallSidebarProps) {
    const denominators = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return (
        <Sidebar className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
            <SidebarSection title="Display Options">
                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Labels</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'fraction', label: 'Fraction', icon: Hash },
                            { id: 'decimal', label: 'Decimal', icon: Binary },
                            { id: 'percent', label: 'Percent', icon: Percent },
                            { id: 'none', label: 'None', icon: EyeOff }
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => onLabelModeChange(mode.id as LabelMode)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors",
                                    labelMode === mode.id
                                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                                )}
                            >
                                <mode.icon size={16} />
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-2">
                    <ControlToggle
                        label="Equivalence Lines"
                        checked={showEquivalenceLines}
                        onChange={(e) => onToggleEquivalenceLines(e.target.checked)}
                    />
                </div>
            </SidebarSection>

            <SidebarSection title="Visible Rows">
                <div className="grid grid-cols-4 gap-2">
                    {denominators.map(d => (
                        <button
                            key={d}
                            onClick={() => onToggleDenominator(d)}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-md border transition-all",
                                visibleDenominators.includes(d)
                                    ? "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                                    : "bg-white border-slate-100 text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-700"
                            )}
                        >
                            <span className="text-xs text-slate-500 mb-1">Row</span>
                            <span className="text-lg font-bold">{d}</span>
                        </button>
                    ))}
                </div>
            </SidebarSection>

            <SidebarSection title="Actions">
                <div className="space-y-2">
                    <button
                        onClick={onClear}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Trash2 size={16} />
                        Clear Shading
                    </button>
                    <button
                        onClick={onCopyLink}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Copy Shareable Link
                    </button>
                    <button
                        onClick={onExport}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                    >
                        Export Wall
                    </button>
                </div>
            </SidebarSection>
        </Sidebar>
    );
}
