"use client"

import { FloatingPanel } from "@/components/tool-ui/floating-panel";

interface SummaryStatsProps {
    pos: number
    neg: number
    sum: number
}

export function SummaryStats({ pos, neg, sum }: SummaryStatsProps) {
    return (
        <FloatingPanel className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
                <div className="text-center">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Pos</span>
                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500 tabular-nums">+{pos}</span>
                </div>
                <div className="h-8 w-px bg-slate-300/50 dark:bg-slate-600/50"></div>
                <div className="text-center">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Neg</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-500 tabular-nums">-{neg}</span>
                </div>
                <div className="h-8 w-px bg-slate-300/50 dark:bg-slate-600/50"></div>
                <div className="text-center min-w-[2.5rem]">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Sum</span>
                    <span className={`text-xl font-bold tabular-nums ${sum > 0 ? 'text-green-600 dark:text-green-400' : sum < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {sum > 0 ? '+' : ''}{sum}
                    </span>
                </div>
            </div>
        </FloatingPanel>
    )
}
