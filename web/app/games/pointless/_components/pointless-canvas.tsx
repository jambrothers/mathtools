"use client"

import * as React from "react"
import { Question } from "../_lib/question-generator"
import { cn } from "@/lib/utils"

interface PointlessCanvasProps {
    question: Question;
    isRevealed: boolean;
}

export function PointlessCanvas({
    question,
    isRevealed
}: PointlessCanvasProps) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Question Text */}
            <div className={cn(
                "transition-all duration-700 ease-out",
                isRevealed ? "mb-12 scale-90" : "scale-100"
            )}>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm font-[family-name:var(--font-heading)]">
                    {question.text}
                </h1>
                <div className="w-24 h-1.5 bg-indigo-500 rounded-full mx-auto mt-6 opacity-30" />
            </div>

            {/* Answer Reveal Area */}
            <div className={cn(
                "w-full max-w-5xl transition-all duration-500 transform",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none h-0"
            )}>
                <div className="p-8 md:p-12 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 relative z-10 tabular-nums">
                        {question.answers.sort((a, b) => a - b).map((ans, idx) => (
                            <span
                                key={idx}
                                className="px-4 py-2 md:px-6 md:py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-lg md:text-2xl font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-default shadow-sm hover:shadow-md"
                            >
                                {ans}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 md:mt-12 text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-center gap-3">
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 max-w-[40px]" />
                        {question.answers.length} {question.answers.length === 1 ? 'Correct Answer' : 'Correct Answers'}
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 max-w-[40px]" />
                    </div>
                </div>
            </div>
        </div>
    )
}
