"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SequenceTermProps {
    n: number;
    value: number;
    isRevealed: boolean;
    showCounters: boolean;
    onReveal: () => void;
}

export function SequenceTerm({ n, value, isRevealed, showCounters, onReveal }: SequenceTermProps) {
    // Determine dots to show
    const absoluteValue = Math.abs(value);
    const integerPart = Math.floor(absoluteValue);
    const decimalPart = Math.round((absoluteValue - integerPart) * 10) / 10;
    const isNegative = value < 0;
    const isZero = value === 0;

    // Total dots to potentially show (integer part + 1 partial if decimal exists)
    const dotCount = Math.min(integerPart + (decimalPart > 0 ? 1 : 0), 50);

    // Arrange dots in rows of 5
    const rows = [];
    for (let i = 0; i < dotCount; i += 5) {
        const rowLength = Math.min(5, dotCount - i);
        const row = Array.from({ length: rowLength }).map((_, idx) => {
            const overallIndex = i + idx;
            const isPartial = overallIndex === integerPart && decimalPart > 0;
            return { isPartial, decimal: decimalPart };
        });
        rows.push(row);
    }

    return (
        <div className="flex flex-col items-center gap-2 group">
            {/* Position Label */}
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                n = {n}
            </span>

            {/* Term Card */}
            <div
                onClick={!isRevealed ? onReveal : undefined}
                className={cn(
                    "w-24 h-32 rounded-xl border-2 flex flex-col items-center justify-between p-3 transition-all duration-300 select-none shadow-sm",
                    isRevealed
                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        : "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md"
                )}
            >
                {isRevealed ? (
                    <>
                        {/* Visual Counters */}
                        <div className="flex-1 flex flex-col items-center justify-center gap-1 w-full overflow-hidden">
                            {showCounters && !isZero ? (
                                <div className="flex flex-col gap-1 items-center justify-center">
                                    {rows.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex gap-1">
                                            {row.map((dot, dotIndex) => (
                                                <div
                                                    key={dotIndex}
                                                    className={cn(
                                                        "w-2.5 h-2.5 rounded-full border shadow-sm flex items-center justify-center overflow-hidden",
                                                        isNegative
                                                            ? "bg-red-500 border-red-600 text-red-500"
                                                            : "bg-yellow-400 border-yellow-500 text-yellow-400"
                                                    )}
                                                    style={dot.isPartial ? {
                                                        background: `conic-gradient(currentColor ${dot.decimal * 100}%, transparent 0)`,
                                                        borderStyle: 'dashed' // Visual hint for partial
                                                    } : undefined}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                    {absoluteValue > 50 && (
                                        <span className="text-[10px] text-slate-400 font-bold">...</span>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    {/* Placeholder for when counters are off */}
                                </div>
                            )}
                        </div>

                        {/* Value */}
                        <span className="text-xl font-bold text-slate-900 dark:text-white mt-auto">
                            {value}
                        </span>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-3xl font-bold text-slate-300 dark:text-slate-700">?</span>
                    </div>
                )}
            </div>
        </div>
    )
}
