"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { SequenceTerm } from "./sequence-term"
import { cn } from "@/lib/utils"

interface SequenceDisplayProps {
    terms: number[];
    revealedCount: number;
    showCounters: boolean;
    showRule: boolean;
    showNthTerm: boolean;
    wordedRule: string;
    nthTermFormula: string;
    onRevealTerm: (index: number) => void;
}

export function SequenceDisplay({
    terms,
    revealedCount,
    showCounters,
    showRule,
    showNthTerm,
    wordedRule,
    nthTermFormula,
    onRevealTerm
}: SequenceDisplayProps) {
    return (
        <div className="w-full flex flex-col items-center gap-12 p-8 overflow-y-auto max-h-full">
            {/* Sequence Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-12 max-w-7xl">
                {terms.map((term, index) => (
                    <React.Fragment key={index}>
                        <SequenceTerm
                            n={index + 1}
                            value={term}
                            isRevealed={index < revealedCount}
                            showCounters={showCounters}
                            onReveal={() => onRevealTerm(index)}
                        />
                        {index < terms.length - 1 && (
                            <div className="flex items-center justify-center pt-6">
                                <ArrowRight className="text-slate-300 dark:text-slate-700" size={20} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Formula Area */}
            {(showRule || showNthTerm) && (
                <div className="flex flex-col items-center gap-4 text-center mt-4">
                    {showRule && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <span className="text-lg font-medium text-slate-700 dark:text-slate-300 italic">
                                "{wordedRule}"
                            </span>
                        </div>
                    )}

                    {showNthTerm && (
                        <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <span className="text-2xl font-bold font-serif text-[var(--color-primary)]">
                                {nthTermFormula}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
