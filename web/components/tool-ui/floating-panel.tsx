"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type FloatingPanelProps = React.HTMLAttributes<HTMLDivElement>

export function FloatingPanel({ className, children, ...props }: FloatingPanelProps) {
    return (
        <div
            className={cn(
                "absolute bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg z-30 animate-in fade-in zoom-in-95 duration-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
