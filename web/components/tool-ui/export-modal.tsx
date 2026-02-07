"use client"

/**
 * Shared Export Modal Component
 * 
 * Reusable modal for exporting canvas content as PNG or SVG.
 * Provides a consistent UI across all tools.
 */

import { Image, FileCode, X } from "lucide-react"
import { useEffect } from "react"

interface ExportModalProps {
    /** Whether the modal is open */
    isOpen: boolean
    /** Callback to close the modal */
    onClose: () => void
    /** Callback when export format is selected */
    onExport: (format: 'png' | 'svg') => void
    /** Optional title for the modal. Default: "Export" */
    title?: string
}

/**
 * Export modal with PNG and SVG options.
 * Includes backdrop blur, keyboard accessibility, and click-outside-to-close.
 */
export function ExportModal({ isOpen, onClose, onExport, title = "Export" }: ExportModalProps) {
    // Handle escape key
    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 min-w-[320px] max-w-md relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
                    {title}
                </h2>

                {/* Export options */}
                <div className="space-y-3">
                    <button
                        onClick={() => onExport('png')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all group"
                    >
                        <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900/50 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900 transition-colors">
                            <Image size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-medium text-slate-900 dark:text-slate-100">PNG Image</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Raster format, best for presentations
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => onExport('svg')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all group"
                    >
                        <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-900 transition-colors">
                            <FileCode size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-medium text-slate-900 dark:text-slate-100">SVG Vector</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Scalable format, best for editing
                            </div>
                        </div>
                    </button>
                </div>

                {/* Cancel button */}
                <button
                    onClick={onClose}
                    className="w-full mt-4 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
