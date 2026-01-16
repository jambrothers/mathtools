"use client"

import * as React from "react"
import { Link } from "lucide-react"
import { ToolbarButton } from "./toolbar"

interface CopyLinkButtonProps {
    onCopyLink: () => void | Promise<void>
    variant?: 'default' | 'danger' | 'primary' | 'success'
}

export function CopyLinkButton({ onCopyLink, variant = 'default' }: CopyLinkButtonProps) {
    const [linkCopied, setLinkCopied] = React.useState(false)

    const handleLinkClick = async () => {
        await onCopyLink();
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
    };

    return (
        <div className="relative">
            <ToolbarButton
                icon={<Link size={16} />}
                label="Link"
                onClick={handleLinkClick}
                variant={variant}
            />
            {linkCopied && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs text-green-600 dark:text-green-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-md border border-green-200 dark:border-green-800 z-50">
                    Link copied
                </div>
            )}
        </div>
    )
}
