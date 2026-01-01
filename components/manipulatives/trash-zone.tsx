"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrashZoneProps extends React.HTMLAttributes<HTMLDivElement> {
    isHovered?: boolean
}

export const TrashZone = React.forwardRef<HTMLDivElement, TrashZoneProps>(
    ({ className, isHovered, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "absolute bottom-4 right-4 p-4 rounded-full transition-all duration-200 z-40 border-2",
                    isHovered
                        ? "bg-red-100 dark:bg-red-900/40 border-red-500 scale-110 shadow-lg text-red-600 dark:text-red-300"
                        : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-red-300 dark:hover:border-red-800",
                    className
                )}
                {...props}
            >
                <Trash2 size={24} />
            </div>
        )
    }
)
TrashZone.displayName = "TrashZone"
