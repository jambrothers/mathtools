"use client"

import * as React from "react"
import { Eye, EyeOff, Trash2, RefreshCw, GitMerge, ArrowRightLeft, Timer } from "lucide-react"
import { ManipulativeToolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/manipulatives/toolbar"

interface CountersToolbarProps {
    showNumberLine: boolean
    setShowNumberLine: (v: boolean) => void
    showStats: boolean
    setShowStats: (v: boolean) => void
    sortState: 'none' | 'grouped' | 'paired'
    onOrganize: () => void
    onFlipAll: () => void
    onCancel: () => void
    isAnimating: boolean
    onClear: () => void
    onAddExpression: (expr: string) => void

    // Animation Controls
    isSequentialMode: boolean
    setIsSequentialMode: (v: boolean) => void
}

export function CountersToolbar({
    showNumberLine, setShowNumberLine,
    showStats, setShowStats,
    sortState, onOrganize,
    onFlipAll,
    onCancel,
    isAnimating,
    onClear,
    onAddExpression,
    isSequentialMode, setIsSequentialMode
}: CountersToolbarProps) {
    const [input, setInput] = React.useState("")

    const handleSubmit = () => {
        if (input.trim()) {
            onAddExpression(input);
            setInput("");
        }
    }

    return (
        <ManipulativeToolbar className="gap-4">
            {/* Search / Input */}
            <div className="flex-1 flex gap-2 min-w-[200px] max-w-md">
                <input
                    type="text"
                    placeholder="e.g. 5 + -3"
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    disabled={isAnimating}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!input || isAnimating}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                    Add
                </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
                <ToolbarGroup>
                    <ToolbarButton
                        icon={showNumberLine ? <Eye size={16} /> : <EyeOff size={16} />}
                        label="Number Line"
                        active={showNumberLine}
                        onClick={() => setShowNumberLine(!showNumberLine)}
                    />
                    <ToolbarButton
                        icon={showStats ? <Eye size={16} /> : <EyeOff size={16} />}
                        label="Stats"
                        active={showStats}
                        onClick={() => setShowStats(!showStats)}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
                    <ToolbarButton
                        icon={sortState === 'grouped' ? <GitMerge size={16} /> : <ArrowRightLeft size={16} />}
                        label={sortState === 'grouped' ? "Pair" : "Sort"}
                        onClick={onOrganize}
                        disabled={isAnimating}
                    />
                    <ToolbarButton
                        icon={<RefreshCw size={16} />}
                        label="Flip All"
                        onClick={onFlipAll}
                        disabled={isAnimating}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
                    {/* Cancel Zero Pairs */}
                    <div className="relative group">
                        <ToolbarButton
                            icon={<RefreshCw size={16} className={isAnimating ? "animate-spin" : ""} />}
                            label="Cancel Pairs"
                            variant="primary"
                            onClick={onCancel}
                            disabled={isAnimating}
                        />
                    </div>

                    {/* Slow Mode Toggle (Sequential) */}
                    <ToolbarButton
                        icon={<Timer size={16} />}
                        label="Slow"
                        active={isSequentialMode}
                        onClick={() => setIsSequentialMode(!isSequentialMode)}
                        disabled={isAnimating}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
                    <ToolbarButton
                        icon={<Trash2 size={16} />}
                        label="Clear"
                        variant="danger"
                        onClick={onClear}
                    />
                </ToolbarGroup>
            </div>
        </ManipulativeToolbar>
    )
}
