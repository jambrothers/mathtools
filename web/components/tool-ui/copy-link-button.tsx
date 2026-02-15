"use client"

import * as React from "react"
import { Link, Check } from "lucide-react"
import { ToolbarButton } from "./toolbar"
import { Toast } from "./toast"

interface CopyLinkButtonProps {
    onCopyLink: () => void | Promise<void>
    variant?: 'default' | 'danger' | 'primary' | 'success'
}

export function CopyLinkButton({ onCopyLink, variant = 'default' }: CopyLinkButtonProps) {
    const [linkCopied, setLinkCopied] = React.useState(false)
    const [showToast, setShowToast] = React.useState(false)

    React.useEffect(() => {
        if (linkCopied) {
            const timer = setTimeout(() => setLinkCopied(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [linkCopied])

    const handleLinkClick = async () => {
        try {
            await onCopyLink();
            setLinkCopied(true);
            setShowToast(true);
        } catch (error) {
            console.error("Failed to copy link:", error);
        }
    };

    const handleToastClose = React.useCallback(() => {
        setShowToast(false);
    }, []);

    return (
        <>
            <div className="relative">
                <ToolbarButton
                    icon={linkCopied ? <Check size={16} /> : <Link size={16} />}
                    label={linkCopied ? "Copied!" : "Link"}
                    onClick={handleLinkClick}
                    variant={linkCopied ? 'success' : variant}
                    aria-label={linkCopied ? "Link copied" : "Copy shareable link"}
                    title="Copy shareable link"
                />
            </div>

            <Toast
                message="Link copied"
                isVisible={showToast}
                onClose={handleToastClose}
            />
        </>
    )
}
