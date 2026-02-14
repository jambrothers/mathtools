"use client"

import * as React from "react"
import { Tablet } from "lucide-react"

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
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Tablet size={32} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Designed for Larger Screens
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                This tool is optimized for tablets, PCs, and interactive whiteboards.
                                Please use a larger device for the best experience.
                            </p>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleDismiss}
                                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Continue Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className={isSmallScreen && !isDismissed ? "hidden" : "contents"}>
                {children}
            </div>
        </>
    )
}
