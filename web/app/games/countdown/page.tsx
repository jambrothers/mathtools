"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { InteractiveToolLayout } from "@/components/tool-ui/interactive-tool-layout"
import { useCountdown } from "./_hooks/use-countdown"
import { countdownURLSerializer } from "./_lib/url-state"
import { CountdownSidebar } from "./_components/countdown-sidebar"
import { CountdownCanvas } from "./_components/countdown-canvas"
import { RefreshCw, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function CountdownGame() {
    const searchParams = useSearchParams()

    // Initialize from URL if present
    const urlState = React.useMemo(() => {
        return countdownURLSerializer.deserialize(searchParams)
    }, [searchParams])

    const {
        config,
        puzzle,
        isRevealed,
        timeLeft,
        isTimerRunning,
        startTimer,
        resetTimer,
        newPuzzle,
        toggleReveal,
        toggleOperation,
        setTargetRange,
        setLargeNumbersCount
    } = useCountdown(urlState || undefined)

    if (!puzzle) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Generating Puzzle...</p>
                </div>
            </div>
        )
    }

    return (
        <InteractiveToolLayout
            sidebar={
                <CountdownSidebar
                    config={config}
                    sources={puzzle.sources}
                    target={puzzle.target}
                    toggleOperation={toggleOperation}
                    setTargetRange={setTargetRange}
                    setLargeNumbersCount={setLargeNumbersCount}
                    newPuzzle={newPuzzle}
                />
            }
            footerOverlay={
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => newPuzzle()}
                        className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all font-bold text-slate-700 dark:text-slate-300 active:scale-95"
                    >
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                        New Puzzle
                    </button>

                    <button
                        onClick={toggleReveal}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-bold text-white active:scale-95 ring-offset-2 ring-offset-slate-900 focus:ring-2 focus:ring-indigo-500",
                            isRevealed
                                ? "bg-slate-600 hover:bg-slate-700"
                                : "bg-indigo-600 hover:bg-indigo-700"
                        )}
                    >
                        {isRevealed ? (
                            <>
                                <EyeOff size={18} />
                                Hide Solution
                            </>
                        ) : (
                            <>
                                <Eye size={18} />
                                Reveal Solution
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <CountdownCanvas
                puzzle={puzzle}
                isRevealed={isRevealed}
                timeLeft={timeLeft}
                isTimerRunning={isTimerRunning}
                startTimer={startTimer}
                resetTimer={resetTimer}
            />
        </InteractiveToolLayout>
    )
}

export default function CountdownPage() {
    return (
        <React.Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Loading Countdown...</p>
                </div>
            </div>
        }>
            <CountdownGame />
        </React.Suspense>
    )
}
