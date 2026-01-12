"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* 
 * Composable Sidebar Components
 * Usage:
 * <ManipulativeSidebar>
 *   <SidebarSection title="Add Positive">
 *     <SidebarButton ... />
 *   </SidebarSection>
 *   
 *   <div className="mt-auto">
 *      ...footer content...
 *   </div>
 * </ManipulativeSidebar>
 */

interface ManipulativeSidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className, children, ...props }: ManipulativeSidebarProps) {
    return (
        <div
            className={cn(
                "w-48 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-6 shadow-sm overflow-y-auto z-10 shrink-0 h-full",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
}

export function SidebarSection({ title, className, children, ...props }: SidebarSectionProps) {
    return (
        <div className={cn(className)} {...props}>
            {title && (
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    {title}
                </h3>
            )}
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    )
}

interface SidebarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Optional icon to render on the left (usually a colored div representing the tile/counter) */
    icon?: React.ReactNode
    label: React.ReactNode
}

export function SidebarButton({ icon, label, className, ...props }: SidebarButtonProps) {
    return (
        <button
            className={cn(
                "flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md w-full transition-colors group text-left disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            {...props}
        >
            {icon && (
                <div className="shrink-0 flex items-center justify-center">
                    {icon}
                </div>
            )}
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-disabled:group-hover:text-slate-600 dark:group-disabled:group-hover:text-slate-400">
                {label}
            </span>
        </button>
    )
}
