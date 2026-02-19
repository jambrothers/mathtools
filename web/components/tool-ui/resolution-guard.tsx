"use client"

import * as React from "react"
import { Tablet } from "lucide-react"
import { Banner } from "./banner"

/**
 * A responsive guard that displays a warning on small screens (< 768px).
 *
 * It checks the viewport width and shows a modal suggesting the user to use a larger device
 * (tablet/desktop) for the best experience.
 *
 * Features:
 * - **Dismissible**: Users can click "Continue Anyway".
 * - **Session Persistence**: Once dismissed, the preference is saved in `sessionStorage`
 *   to avoid pestering the user during the same session.
 * - **Hydration Safe**: Ensures the check only runs on the client.
 */
export function ResolutionGuard({ children }: { children: React.ReactNode }) {
    const [isSmallScreen, setIsSmallScreen] = React.useState(false)
    const [isDismissed, setIsDismissed] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        // Check session storage on mount
        const dismissed = sessionStorage.getItem("mathtools-resolution-guard-dismissed")
        if (dismissed === "true") {
            setIsDismissed(true)
        }

        const checkWidth = () => {
            const width = window.innerWidth
            setIsSmallScreen(width < 768)
        }

        // Initial check
        checkWidth()

        window.addEventListener("resize", checkWidth)
        return () => window.removeEventListener("resize", checkWidth)
    }, [])

    const handleDismiss = () => {
        setIsDismissed(true)
        sessionStorage.setItem("mathtools-resolution-guard-dismissed", "true")
    }

    // Don't render anything until mounted to prevent hydration mismatch
    // (though for a specialized guard like this, simpler might be ok, but let's be safe)
    if (!mounted) return null

    return (
        <>
            {isSmallScreen && !isDismissed && (
                <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <Banner
                        title="Designed for Larger Screens"
                        description="This tool is optimized for tablets, PCs, and interactive whiteboards. Please use a larger device for the best experience."
                        icon={<Tablet size={32} />}
                        onDismiss={handleDismiss}
                    />
                </div>
            )}
            <div className={isSmallScreen && !isDismissed ? "hidden" : "contents"}>
                {children}
            </div>
        </>
    )
}
