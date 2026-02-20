"use client"

import * as React from "react"
import {
    Settings2,
    Share2,
    Calculator,
    Check,
    Dices
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CopyLinkButton } from "@/components/tool-ui/copy-link-button"
import { generateShareableURL, copyURLToClipboard } from "@/lib/url-state"
import { countdownURLSerializer } from "../_lib/url-state"
import { Operation, GameConfig } from "../_lib/countdown-solver"

interface CountdownSidebarProps {
    config: GameConfig;
    sources: number[];
    target: number;
    toggleOperation: (op: Operation) => void;
    setTargetRange: (min: number, max: number) => void;
    setLargeNumbersCount: (count: number | 'random') => void;
    newPuzzle: (config?: GameConfig) => void;
}

const OPERATIONS: { id: Operation; label: string; symbol: string }[] = [
    { id: '+', label: 'Addition', symbol: '+' },
    { id: '-', label: 'Subtraction', symbol: '−' },
    { id: '*', label: 'Multiplication', symbol: '×' },
    { id: '/', label: 'Division', symbol: '÷' },
    { id: '^', label: 'Indices', symbol: 'xⁿ' },
];

const PRESETS: { label: string; config: GameConfig }[] = [
    {
        label: "Foundation",
        config: {
            allowedOperations: ['+', '-'],
            largeNumbersCount: 0,
            targetRange: [10, 50]
        }
    },
    {
        label: "Standard",
        config: {
            allowedOperations: ['+', '-', '*', '/'],
            largeNumbersCount: 1,
            targetRange: [100, 999]
        }
    },
    {
        label: "Advanced",
        config: {
            allowedOperations: ['+', '-', '*', '/', '^'],
            largeNumbersCount: 2,
            targetRange: [1, 9999]
        }
    }
];

export function CountdownSidebar({
    config,
    sources,
    target,
    toggleOperation,
    setTargetRange,
    setLargeNumbersCount,
    newPuzzle
}: CountdownSidebarProps) {

    const handleCopyLink = async () => {
        const url = generateShareableURL(countdownURLSerializer, { config, sources, target });
        await copyURLToClipboard(url);
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Calculator size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Countdown</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Configure the numbers game</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Difficulty Presets */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Dices size={16} className="text-slate-400" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quick Presets</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => newPuzzle(preset.config)}
                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-left group"
                            >
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{preset.label}</span>
                                <div className="flex gap-1">
                                    {preset.config.allowedOperations.slice(0, 3).map(op => (
                                        <span key={op} className="text-[10px] w-4 h-4 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded text-slate-500">{op}</span>
                                    ))}
                                    {preset.config.allowedOperations.length > 3 && <span className="text-[10px] text-slate-400 leading-4">...</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Operations */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Settings2 size={16} className="text-slate-400" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Allowed Operations</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {OPERATIONS.map((op) => {
                            const isEnabled = config.allowedOperations.includes(op.id);
                            return (
                                <button
                                    key={op.id}
                                    onClick={() => toggleOperation(op.id)}
                                    aria-pressed={isEnabled}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                        isEnabled
                                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold",
                                            isEnabled ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                        )}>
                                            {op.symbol}
                                        </div>
                                        <span className="text-sm font-semibold">{op.label}</span>
                                    </div>
                                    {isEnabled && <Check size={16} className="text-indigo-600" />}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Number Constraints */}
                <section className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Numbers Configuration</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block px-1">Large Numbers (0-4)</label>
                            <div className="flex gap-1 justify-between p-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                                {['random', 0, 1, 2, 3, 4].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setLargeNumbersCount(val as number | 'random')}
                                        aria-pressed={config.largeNumbersCount === val}
                                        aria-label={val === 'random' ? "Set random large numbers" : `Set ${val} large number${val === 1 ? '' : 's'}`}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tight transition-all",
                                            config.largeNumbersCount === val
                                                ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block px-1">Target Range</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 ml-1">Min</span>
                                    <input
                                        type="number"
                                        aria-label="Minimum target value"
                                        value={config.targetRange[0]}
                                        onChange={(e) => setTargetRange(Number(e.target.value), config.targetRange[1])}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 ml-1">Max</span>
                                    <input
                                        type="number"
                                        aria-label="Maximum target value"
                                        value={config.targetRange[1]}
                                        onChange={(e) => setTargetRange(config.targetRange[0], Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-4">
                    <Share2 size={16} className="text-slate-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sharing</h3>
                </div>
                <CopyLinkButton
                    onCopyLink={handleCopyLink}
                    className="w-full h-12 justify-center"
                    label="Share Game Link"
                />
            </div>
        </div>
    )
}
