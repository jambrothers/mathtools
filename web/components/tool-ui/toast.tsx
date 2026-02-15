"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ToastProps {
    message: string
    isVisible: boolean
    onClose?: () => void
    variant?: 'default' | 'success' | 'error'
}

export function Toast({ message, isVisible, onClose, variant = 'success' }: ToastProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted || !isVisible) return null

    // We use createPortal to render the toast at the root of the document
    // This ensures it appears above all other content (z-index) and is not clipped by overflow:hidden containers
    return createPortal(
        <div
            className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg border flex items-center gap-2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-200",
                variant === 'success' && "bg-green-50 dark:bg-green-900/80 border-green-200 dark:border-green-800 text-green-700 dark:text-green-200",
                variant === 'error' && "bg-red-50 dark:bg-red-900/80 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200",
                variant === 'default' && "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            )}
            role="status"
            aria-live="polite"
        >
            {variant === 'success' && <Check size={16} />}
            <span className="text-sm font-medium">{message}</span>
        </div>,
        document.body
    )
}
