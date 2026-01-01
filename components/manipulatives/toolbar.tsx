"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* 
 * Composable Toolbar Components 
 * Usage:
 * <ManipulativeToolbar>
 *   <ToolbarButton ... />
 *   <ToolbarSeparator />
 *   <ToolbarGroup>...</ToolbarGroup>
 * </ManipulativeToolbar>
 */

/**
 * Main container for the manipulative toolbar.
 */

export function ManipulativeToolbar({ className, children }: { className?: string, children?: React.ReactNode }) {
    return (
        <div className={cn("p-2 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 z-10 flex flex-wrap gap-2 items-center justify-between", className)}>
            {children}
        </div>
    )
}

/**
 * A wrapper to group related toolbar buttons together.
 */
export function ToolbarGroup({ className, children }: { className?: string, children?: React.ReactNode }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {children}
        </div>
    )
}

/**
 * A visual separator line for toolbar groups.
 */
export function ToolbarSeparator() {
    return <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
}

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode
    label?: string
    active?: boolean
    /** Visual style variant of the button. */
    variant?: 'default' | 'danger' | 'primary' | 'success'
}

/**
 * A standardized button component for the toolbar.
 */
export function ToolbarButton({ icon, label, active, variant = 'default', className, ...props }: ToolbarButtonProps) {
    const variants = {
        default: active
            ? "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-200 dark:border-indigo-700"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700",
        danger: "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800",
        primary: "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
        success: "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
    };

    return (
        <button
            type="button"
            className={cn(
                "px-3 py-2 border text-sm font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        >
            {icon}
            {label && <span className="hidden sm:inline">{label}</span>}
        </button>
    )
}
