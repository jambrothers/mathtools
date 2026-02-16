"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Play, RotateCcw, Lightbulb } from "lucide-react"
import { Puzzle, formatSolution } from "../_lib/countdown-solver"

interface CountdownCanvasProps {
    puzzle: Puzzle;
    isRevealed: boolean;
    timeLeft: number;
    isTimerRunning: boolean;
    startTimer: () => void;
    resetTimer: () => void;
}

export function CountdownCanvas({
    puzzle,
    isRevealed,
    timeLeft,
    isTimerRunning,
    startTimer,
    resetTimer
}: CountdownCanvasProps) {
    const formattedSolution = React.useMemo(() => formatSolution(puzzle.solution), [puzzle.solution]);

    // Analog clock degrees (30 seconds = 360 degrees)
    const secondHandRotation = (30 - timeLeft) * 12; // 360 / 30 = 12 degrees per second

    return (
        <div className="w-full h-full flex flex-col items-center p-8 pt-12 bg-slate-50 dark:bg-slate-900 overflow-y-auto custom-scrollbar pb-32">
            <div className="max-w-4xl w-full space-y-12 flex flex-col items-center">

                {/* Clock and Target Section */}
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                    {/* Analog-style Clock Visual */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                        <div className="relative w-48 h-48 rounded-full border-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl flex items-center justify-center overflow-hidden">
                            {/* Tick marks */}
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-3 bg-slate-200 dark:bg-slate-800"
                                    style={{
                                        transform: `rotate(${i * 30}deg) translateY(-85px)`
                                    }}
                                />
                            ))}

                            {/* Countdown Progress Sector */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="176"
                                    strokeDasharray="553"
                                    strokeDashoffset={553 - (553 * (30 - timeLeft) / 30)}
                                    className="text-indigo-500/10 dark:text-indigo-500/10 transition-all duration-1000 ease-linear"
                                />
                            </svg>

                            {/* Second hand */}
                            <div
                                className="absolute bottom-1/2 left-1/2 w-1 h-[45%] bg-indigo-600 dark:bg-indigo-500 origin-bottom rounded-full transition-transform duration-1000 ease-linear shadow-sm"
                                style={{ transform: `translateX(-50%) rotate(${secondHandRotation}deg)` }}
                            />

                            {/* Center cap */}
                            <div className="absolute w-3 h-3 bg-slate-900 dark:bg-white rounded-full shadow-lg z-10" />

                            {/* Digital fallback/overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className={cn(
                                    "text-4xl font-black font-mono transition-colors",
                                    timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-slate-300 dark:text-slate-700"
                                )}>
                                    {timeLeft}
                                </span>
                            </div>
                        </div>

                        {/* Clock Controls Overlay */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                            {!isTimerRunning ? (
                                <button
                                    onClick={startTimer}
                                    className="bg-indigo-600 text-white p-2.5 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95"
                                    title="Start Timer"
                                >
                                    <Play size={18} fill="currentColor" />
                                </button>
                            ) : (
                                <button
                                    onClick={resetTimer}
                                    className="bg-slate-600 text-white p-2.5 rounded-full shadow-lg hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
                                    title="Reset Timer"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Target Display */}
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Target</span>
                        <div className="relative">
                            <div className="absolute inset-x-0 -bottom-2 h-4 bg-indigo-600/20 blur-xl rounded-full" />
                            <div className="relative bg-slate-900 dark:bg-indigo-950 border-y-4 border-indigo-500 px-12 py-8 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] text-center">
                                {/* Digital segmented look background */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                                    <span className="text-[120px] font-mono leading-none font-black italic">888</span>
                                </div>
                                <span className="text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                    {puzzle.target}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Source Tiles */}
                <div className="w-full max-w-2xl px-4">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {puzzle.sources.map((num, idx) => {
                            const isLarge = num > 10;
                            return (
                                <div
                                    key={`${num}-${idx}`}
                                    className={cn(
                                        "aspect-square flex items-center justify-center rounded-2xl border-b-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group",
                                        isLarge
                                            ? "bg-indigo-600 border-indigo-800 text-white"
                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-md"
                                    )}
                                >
                                    <span className={cn(
                                        "text-4xl font-black transition-transform duration-300 group-hover:scale-110",
                                        isLarge ? "drop-shadow-sm" : ""
                                    )}>
                                        {num}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Solution Reveal Area */}
                <div className="w-full max-w-xl min-h-[120px] relative">
                    {!isRevealed ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4 text-slate-300 dark:text-slate-700">
                                <Lightbulb size={48} className="opacity-20 translate-y-2 animate-bounce animate-duration-1000" />
                                <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Solution Hidden</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-inner animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Step by Step</h3>
                            </div>
                            <div className="space-y-4">
                                {formattedSolution.map((step, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 text-lg font-mono font-bold text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-left duration-500"
                                        style={{ animationDelay: `${idx * 150}ms` }}
                                    >
                                        <span className="text-indigo-500/50 text-xs">{(idx + 1).toString().padStart(2, '0')}</span>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
