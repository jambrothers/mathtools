"use client"

import * as React from "react"
import { FlaskConical } from "lucide-react"
import { Banner } from "./banner"
import { ExperimentalBannerProvider, useExperimentalBanner } from "./experimental-banner-context"

interface ExperimentalBannerProps {
    /**
     * Unique identifier for the page.
     * Used to store the dismissal state in sessionStorage (e.g., `mathtools-experimental-dismissed-[pageId]`).
     */
    pageId: string
    /** The content to be rendered below the banner. */
    children: React.ReactNode
}

/**
 * A wrapper component that displays a dismissible "Experimental Feature" banner at the top of the page.
 *
 * Features:
 * - **Context Provider**: Wraps children in `ExperimentalBannerProvider` to expose `bannerHeight`.
 * - **Persistence**: Remembers dismissal state via sessionStorage using `pageId`.
 * - **Layout Adjustment**: Automatically pushes content down based on banner height.
 *
 * @example
 * ```tsx
 * <ExperimentalBanner pageId="my-new-tool">
 *   <MyToolContent />
 * </ExperimentalBanner>
 * ```
 */
export function ExperimentalBanner({ pageId, children }: ExperimentalBannerProps) {
    return (
        <ExperimentalBannerProvider>
            <ExperimentalBannerInner pageId={pageId}>
                {children}
            </ExperimentalBannerInner>
        </ExperimentalBannerProvider>
    )
}

function ExperimentalBannerInner({ pageId, children }: ExperimentalBannerProps) {
    const [isDismissed, setIsDismissed] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const { setBannerHeight } = useExperimentalBanner()
    const bannerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (bannerRef.current && !isDismissed) {
            setBannerHeight(bannerRef.current.offsetHeight)
        } else {
            setBannerHeight(0)
        }
    }, [isDismissed, mounted, setBannerHeight])

    React.useEffect(() => {
        const handleResize = () => {
            if (bannerRef.current && !isDismissed) {
                setBannerHeight(bannerRef.current.offsetHeight)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isDismissed, setBannerHeight])

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
        setBannerHeight(0)
    }

    // Don't render banner on server/hydration to avoid mismatch
    // But always render children

    return (
        <>
            {mounted && !isDismissed && (
                <div
                    ref={bannerRef}
                    className="fixed top-[81px] left-0 right-0 z-40"
                >
                    <Banner
                        title="Experimental Feature"
                        description="This page is experimental and features could change at any time."
                        icon={<FlaskConical size={20} />}
                        layout="row"
                        onDismiss={handleDismiss}
                    />
                </div>
            )}
            {children}
        </>
    )
}
