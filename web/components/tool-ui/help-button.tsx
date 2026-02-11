"use client"

import * as React from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface HelpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Click handler to open the help modal */
    onClick: () => void
}

/**
 * A help button component positioned in the bottom-left corner of the canvas.
 * Matches the TrashZone styling (rounded-full, p-4, 24px icon).
 */

export const HelpButton = React.forwardRef<HTMLButtonElement, HelpButtonProps>(
    ({ className, onClick, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                onClick={onClick}
                aria-label="Help"
                className={cn(
                    "absolute bottom-4 left-4 p-4 rounded-full transition-all duration-200 z-40 border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
                    "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700",
                    "text-slate-400 dark:text-slate-500",
                    "hover:border-indigo-300 dark:hover:border-indigo-700",
                    "hover:text-indigo-500 dark:hover:text-indigo-400",
                    "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
                    className
                )}
                {...props}
            >
                <Info size={24} />
            </button>
        )
    }
)
HelpButton.displayName = "HelpButton"
