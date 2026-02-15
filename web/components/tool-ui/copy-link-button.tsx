"use client"

import * as React from "react"
import { Link, Check } from "lucide-react"
import { ToolbarButton } from "./toolbar"
import { cn } from "@/lib/utils"
import { Toast } from "./toast"

interface CopyLinkButtonProps {
    onCopyLink: () => void | Promise<void>
    variant?: 'default' | 'danger' | 'primary' | 'success'
    className?: string
    /** Custom label for the button (default: "Link") */
    label?: string
}

export function CopyLinkButton({ onCopyLink, variant = 'default', className, label = "Link" }: CopyLinkButtonProps) {
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
        <>
            <ToolbarButton
                icon={linkCopied ? <Check size={16} /> : <Link size={16} />}
                label={linkCopied ? "Copied!" : label}
                onClick={handleLinkClick}
                variant={linkCopied ? 'success' : variant}
                aria-label={linkCopied ? "Link copied" : "Copy shareable link"}
                title="Copy shareable link"
                className={cn(
                    className,
                    linkCopied && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800"
                )}
            />
            <Toast
                message="Link copied to clipboard"
                isVisible={linkCopied}
                variant="success"
            />
        </>
    )
}
