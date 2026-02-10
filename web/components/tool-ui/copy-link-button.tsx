"use client"

import * as React from "react"
import { Link, Check } from "lucide-react"
import { ToolbarButton } from "./toolbar"

interface CopyLinkButtonProps {
    onCopyLink: () => void | Promise<void>
    variant?: 'default' | 'danger' | 'primary' | 'success'
}

export function CopyLinkButton({ onCopyLink, variant = 'default' }: CopyLinkButtonProps) {
    const [linkCopied, setLinkCopied] = React.useState(false)

    React.useEffect(() => {
        if (linkCopied) {
            const timer = setTimeout(() => setLinkCopied(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [linkCopied])

    const handleLinkClick = async () => {
        await onCopyLink();
        setLinkCopied(true);
    };

    return (
        <div className="relative">
            <ToolbarButton
                icon={linkCopied ? <Check size={16} /> : <Link size={16} />}
                label={linkCopied ? "Copied!" : "Link"}
                onClick={handleLinkClick}
                variant={linkCopied ? 'success' : variant}
                aria-label={linkCopied ? "Link copied" : "Copy shareable link"}
                title="Copy shareable link"
            />
            {linkCopied && (
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs text-green-600 dark:text-green-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-md border border-green-200 dark:border-green-800 z-50"
                    role="status"
                    aria-live="polite"
                >
                    Link copied
                </div>
            )}
        </div>
    )
}
