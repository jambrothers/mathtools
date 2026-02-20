"use client"

import * as React from "react"
import {
    QuestionCategory
} from "../_lib/question-generator"
import {
    Settings2,
    Share2,
    ChevronRight,
    Calculator
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CopyLinkButton } from "@/components/tool-ui/copy-link-button"
import { generateShareableURL, copyURLToClipboard } from "@/lib/url-state"
import { pointlessURLSerializer } from "../_lib/url-state"

interface PointlessSidebarProps {
    category: QuestionCategory;
    setCategory: (cat: QuestionCategory) => void;
    params: Record<string, number | string>;
    setParams: (params: Record<string, number | string>) => void;
}

const CATEGORIES: { id: QuestionCategory; label: string; icon: string }[] = [
    { id: "factors", label: "Factors", icon: "÷" },
    { id: "multiples-in-range", label: "Multiples", icon: "×" },
    { id: "primes-in-range", label: "Primes", icon: "P" },
    { id: "squares-in-range", label: "Square Numbers", icon: "x²" },
    { id: "cubes-in-range", label: "Cube Numbers", icon: "x³" },
    { id: "powers-of-2", label: "Powers of 2", icon: "2ⁿ" },
    { id: "triangular-numbers", label: "Triangular Numbers", icon: "Δ" },
];

export function PointlessSidebar({
    category,
    setCategory,
    params,
    setParams
}: PointlessSidebarProps) {
    const id = React.useId();

    const handleParamChange = (key: string, value: string) => {
        const num = Number(value);
        setParams({
            ...params,
            [key]: isNaN(num) ? value : num
        });
    }

    const handleCopyLink = async () => {
        const url = generateShareableURL(pointlessURLSerializer, { category, params });
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
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Configuration</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Set up your Pointless game</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Category Selection */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Settings2 size={16} className="text-slate-400" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Game Category</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border transition-all text-left group",
                                    category === cat.id
                                        ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold font-mono",
                                        category === cat.id
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                                    )}>
                                        {cat.icon}
                                    </span>
                                    <span className="text-sm font-semibold">{cat.label}</span>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className={cn(
                                        "transition-transform",
                                        category === cat.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                </section>

                {/* Dynamic Parameters */}
                <section className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Parameters</h3>
                    </div>

                    <div className="space-y-4">
                        {category === "factors" && (
                            <div className="space-y-1.5">
                                <label htmlFor={`${id}-n`} className="text-xs font-bold text-slate-500 dark:text-slate-400">Target Number</label>
                                <input
                                    id={`${id}-n`}
                                    type="number"
                                    min={1}
                                    max={10000}
                                    value={params.n || ""}
                                    onChange={(e) => handleParamChange("n", e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                />
                            </div>
                        )}

                        {category === "multiples-in-range" && (
                            <>
                                <div className="space-y-1.5">
                                    <label htmlFor={`${id}-multiplier`} className="text-xs font-bold text-slate-500 dark:text-slate-400">Multiplier</label>
                                    <input
                                        id={`${id}-multiplier`}
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={params.multiplier || ""}
                                        onChange={(e) => handleParamChange("multiplier", e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label htmlFor={`${id}-min`} className="text-xs font-bold text-slate-500 dark:text-slate-400">Min</label>
                                        <input
                                            id={`${id}-min`}
                                            type="number"
                                            min={0}
                                            max={10000}
                                            value={params.min || ""}
                                            onChange={(e) => handleParamChange("min", e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor={`${id}-max`} className="text-xs font-bold text-slate-500 dark:text-slate-400">Max</label>
                                        <input
                                            id={`${id}-max`}
                                            type="number"
                                            min={0}
                                            max={10000}
                                            value={params.max || ""}
                                            onChange={(e) => handleParamChange("max", e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {(category === "primes-in-range" ||
                            category === "squares-in-range" ||
                            category === "cubes-in-range" ||
                            category === "powers-of-2" ||
                            category === "triangular-numbers") && (
                                <div className="space-y-1.5">
                                    <label htmlFor={`${id}-max-val`} className="text-xs font-bold text-slate-500 dark:text-slate-400">Max Value</label>
                                    <input
                                        id={`${id}-max-val`}
                                        type="number"
                                        min={1}
                                        max={category === "powers-of-2" ? 1000000 : 100000}
                                        value={params.max || ""}
                                        onChange={(e) => handleParamChange("max", e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            )}
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
