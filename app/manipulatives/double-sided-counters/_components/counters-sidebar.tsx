"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CountersSidebarProps {
    onAddPositive: () => void
    onAddNegative: () => void
    onAddZeroPair: () => void
    disabled?: boolean
}

export function CountersSidebar({ onAddPositive, onAddNegative, onAddZeroPair, disabled }: CountersSidebarProps) {
    return (
        <div className="w-48 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-6 shadow-sm overflow-y-auto z-10 shrink-0 h-full relative">

            {/* Add Positive */}
            <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Positive</h3>
                <button
                    onClick={onAddPositive}
                    disabled={disabled}
                    className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md w-full transition-colors group text-left disabled:opacity-50"
                >
                    <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-sm shrink-0 flex items-center justify-center text-yellow-900 font-bold text-xs select-none">
                        +
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        Add +1
                    </span>
                </button>
            </div>

            {/* Add Negative */}
            <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Negative</h3>
                <button
                    onClick={onAddNegative}
                    disabled={disabled}
                    className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md w-full transition-colors group text-left disabled:opacity-50"
                >
                    <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-red-600 shadow-sm shrink-0 flex items-center justify-center text-white font-bold text-xs select-none">
                        -
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        Add -1
                    </span>
                </button>
            </div>

            {/* Zero Pair */}
            <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Combinations</h3>
                <button
                    onClick={onAddZeroPair}
                    disabled={disabled}
                    className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md w-full transition-colors group text-left disabled:opacity-50"
                >
                    <div className="flex -space-x-2 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-sm relative z-10"></div>
                        <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-red-600 shadow-sm relative z-0"></div>
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        Zero Pair
                    </span>
                </button>
            </div>

            <div className="mt-auto pt-6 text-slate-500 dark:text-slate-400 text-sm">
                <h3 className="font-semibold mb-2 text-slate-600 dark:text-slate-300">Shortcuts:</h3>
                <ul className="space-y-1 list-disc pl-4 text-xs">
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Click</span> to flip sign.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Drag</span> to move.</li>
                </ul>
            </div>
        </div>
    )
}
