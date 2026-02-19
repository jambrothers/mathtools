"use client"

import * as React from "react"
import { FlaskConical } from "lucide-react"
import { Banner } from "./banner"

interface ExperimentalBannerProps {
    pageId: string
    children: React.ReactNode
}

export function ExperimentalBanner({ pageId, children }: ExperimentalBannerProps) {
    const [isDismissed, setIsDismissed] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        const key = `mathtools-experimental-dismissed-${pageId}`
        if (sessionStorage.getItem(key) === "true") {
            setIsDismissed(true)
        }
    }, [pageId])

    const handleDismiss = () => {
        setIsDismissed(true)
        sessionStorage.setItem(`mathtools-experimental-dismissed-${pageId}`, "true")
    }

    // Don't render banner on server/hydration to avoid mismatch
    // But always render children

    return (
        <div className="flex flex-col w-full h-full">
            {mounted && !isDismissed && (
                <Banner
                    title="Experimental Feature"
                    description="This page is experimental and features could change at any time."
                    icon={<FlaskConical size={20} />}
                    layout="row"
                    onDismiss={handleDismiss}
                    className="shrink-0 relative z-40"
                />
            )}
            <div className="flex-1 min-h-0 relative">
                {children}
            </div>
        </div>
    )
}
