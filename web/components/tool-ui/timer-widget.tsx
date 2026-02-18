"use client"

import * as React from "react"
import { Play, Pause, RotateCcw, Timer } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A reusable timer component designed to be used as a tool-ui widget.
 * 
 * Features:
 * - Start, Pause, and Reset functionality.
 * - Preset duration selections (30s, 1m, 2m).
 * - Visual countdown display in MM:SS format.
 * - Responsive and themed (light/dark mode support).
 */
export function TimerWidget({ className }: { className?: string }) {
    const [seconds, setSeconds] = React.useState(0)
    const [isRunning, setIsRunning] = React.useState(false)
    const [isComplete, setIsComplete] = React.useState(false)
    const timerRef = React.useRef<NodeJS.Timeout | null>(null)

    const startTimer = () => {
        if (seconds > 0) {
            setIsRunning(true)
            setIsComplete(false)
        }
    }

    const pauseTimer = () => {
        setIsRunning(false)
    }

    const resetTimer = () => {
        setIsRunning(false)
        setSeconds(0)
        setIsComplete(false)
    }

    const setPreset = (s: number) => {
        setSeconds(s)
        setIsRunning(false)
        setIsComplete(false)
    }

    React.useEffect(() => {
        if (isRunning && seconds > 0) {
            timerRef.current = setInterval(() => {
                setSeconds((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false)
                        setIsComplete(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isRunning, seconds])

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60)
        const secs = s % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className={cn(
            "flex flex-col gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg pointer-events-auto min-w-[140px] select-none",
            className
        )}>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                <Timer size={14} className={cn(isRunning && "animate-pulse")} aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Timer</span>
            </div>

            <div
                className={cn(
                    "text-3xl font-mono font-bold text-slate-900 dark:text-white text-center tabular-nums leading-none tracking-tight transition-colors duration-300",
                    isComplete && "text-red-600 dark:text-red-400 animate-pulse"
                )}
                role="timer"
                aria-live={isRunning ? "off" : "polite"}
            >
                {formatTime(seconds)}
            </div>

            {isComplete && (
                <div role="alert" className="sr-only">Timer finished</div>
            )}

            <div className="flex items-center justify-center gap-3 mt-2">
                {!isRunning ? (
                    <button
                        onClick={startTimer}
                        disabled={seconds === 0}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-30 disabled:grayscale text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        aria-label="Start timer"
                    >
                        <Play size={18} fill="currentColor" className="ml-0.5" aria-hidden="true" />
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        aria-label="Pause timer"
                    >
                        <Pause size={18} fill="currentColor" aria-hidden="true" />
                    </button>
                )}
                <button
                    onClick={resetTimer}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                    aria-label="Reset timer"
                >
                    <RotateCcw size={18} aria-hidden="true" />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-2">
                {[30, 60, 120].map((s) => (
                    <button
                        key={s}
                        onClick={() => setPreset(s)}
                        className={cn(
                            "px-1 py-1 text-[11px] font-semibold rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                            seconds === s
                                ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600"
                        )}
                        aria-label={`Set timer for ${s === 60 ? '1 minute' : s === 120 ? '2 minutes' : s + ' seconds'}`}
                    >
                        {s === 60 ? '1m' : s === 120 ? '2m' : s + 's'}
                    </button>
                ))}
            </div>
        </div>
    )
}
