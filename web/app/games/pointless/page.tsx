"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { InteractiveToolLayout } from "@/components/tool-ui/interactive-tool-layout"
import { usePointless } from "./_hooks/use-pointless"
import { pointlessURLSerializer } from "./_lib/url-state"
import { PointlessSidebar } from "./_components/pointless-sidebar"
import { PointlessCanvas } from "./_components/pointless-canvas"
import { TimerWidget } from "@/components/tool-ui/timer-widget"
import { RefreshCw, Eye, EyeOff, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function PointlessGame() {
    const searchParams = useSearchParams()

    // Initialize from URL if present
    const urlState = React.useMemo(() => {
        return pointlessURLSerializer.deserialize(searchParams)
    }, [searchParams])

    const {
        category,
        setCategory,
        params,
        setParams,
        question,
        isRevealed,
        toggleReveal,
        nextQuestion
    } = usePointless(urlState?.category, urlState?.params)

    return (
        <InteractiveToolLayout
            sidebar={
                <PointlessSidebar
                    category={category}
                    setCategory={setCategory}
                    params={params}
                    setParams={setParams}
                />
            }
            toolbarOverlay={
                <TimerWidget className="animate-in fade-in slide-in-from-left-4 duration-500" />
            }
            footerOverlay={
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={nextQuestion}
                        className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all font-bold text-slate-700 dark:text-slate-300 active:scale-95"
                    >
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                        Next Question
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
                                Hide Answers
                            </>
                        ) : (
                            <>
                                <Eye size={18} />
                                Reveal Answers
                            </>
                        )}
                    </button>

                    {!isRevealed && (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800/50 text-[10px] font-black uppercase tracking-widest animate-pulse">
                            Ready <ChevronRight size={10} />
                        </div>
                    )}
                </div>
            }
        >
            <PointlessCanvas
                question={question}
                isRevealed={isRevealed}
            />
        </InteractiveToolLayout>
    )
}

export default function PointlessPage() {
    return (
        <React.Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Loading Game...</p>
                </div>
            </div>
        }>
            <PointlessGame />
        </React.Suspense>
    )
}
