"use client"

import * as React from "react"
import { X, HelpCircle } from "lucide-react"
import Markdown from "react-markdown"

interface HelpModalProps {
    /** The markdown content to display */
    content: string
    /** Callback when the modal should close */
    onClose: () => void
}

/**
 * Modal component displaying formatted help documentation.
 * Renders markdown content with proper styling.
 */
export function HelpModal({ content, onClose }: HelpModalProps) {
    // Handle escape key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            data-testid="help-modal-backdrop"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="help-modal-title"
                data-testid="help-modal-content"
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 max-w-2xl w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
                    <h2 id="help-modal-title" className="text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <HelpCircle size={20} /> Help Guide
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Markdown Content */}
                <div className="p-6 overflow-auto prose prose-slate dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
                    <Markdown
                        components={{
                            // Custom image component to ensure proper sizing
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            img: ({ node, ...props }) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    {...props}
                                    alt={props.alt || ""}
                                    className="max-w-full h-auto rounded-lg shadow-md my-4"
                                />
                            ),
                            // Custom code block styling
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            code: ({ node, className, children, ...props }) => {
                                const isInline = !className
                                return isInline ? (
                                    <code
                                        className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                ) : (
                                    <code
                                        className={`block bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-sm font-mono overflow-x-auto ${className || ""}`}
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                )
                            },
                            // Custom pre block to avoid double-padding
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            pre: ({ node, ...props }) => (
                                <pre className="bg-transparent p-0 m-0" {...props} />
                            )
                        }}
                    >
                        {content}
                    </Markdown>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex justify-end items-center rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors font-medium"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    )
}
