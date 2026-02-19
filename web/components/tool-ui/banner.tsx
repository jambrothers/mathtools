"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BannerProps {
    title: string
    description: string
    onDismiss: () => void
    icon?: React.ReactNode
    dismissLabel?: string
    layout?: "centered" | "row"
    className?: string
}

export function Banner({
    title,
    description,
    onDismiss,
    icon,
    dismissLabel = "Continue Anyway",
    layout = "centered",
    className
}: BannerProps) {
    if (layout === "row") {
        return (
            <div className={cn(
                "w-full bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800 p-3 flex items-center justify-between gap-4",
                className
            )}>
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="text-indigo-600 dark:text-indigo-400 shrink-0">
                            {icon}
                        </div>
                    )}
                    <div className="text-sm">
                        <span className="font-semibold text-indigo-900 dark:text-indigo-100 mr-1.5">
                            {title}
                        </span>
                        <span className="text-indigo-700 dark:text-indigo-300">
                            {description}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onDismiss}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 whitespace-nowrap px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors"
                >
                    {dismissLabel}
                </button>
            </div>
        )
    }

    // Centered layout (default, matches existing ResolutionGuard style)
    return (
        <div className={cn(
            "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-center space-y-6",
            className
        )}>
            {icon && (
                <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    {icon}
                </div>
            )}

            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    {description}
                </p>
            </div>

            <div className="pt-2">
                <button
                    onClick={onDismiss}
                    className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    {dismissLabel}
                </button>
            </div>
        </div>
    )
}
