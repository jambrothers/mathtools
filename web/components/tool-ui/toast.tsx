"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
    message: string
    isVisible: boolean
    onClose: () => void
    duration?: number
}

/**
 * A simple, accessible toast notification component.
 * Renders at the bottom-center of the screen using a Portal.
 */
export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [isVisible, duration, onClose])

    if (!mounted || !isVisible) return null

    return createPortal(
        <div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300"
            role="status"
            aria-live="polite"
        >
            <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg border",
                "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                "text-slate-900 dark:text-slate-100 font-medium text-sm"
            )}>
                <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />
                <span>{message}</span>
            </div>
        </div>,
        document.body
    )
}
