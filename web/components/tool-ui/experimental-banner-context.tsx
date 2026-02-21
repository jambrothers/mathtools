"use client"

import * as React from "react"

interface ExperimentalBannerContextType {
    /** The current height of the banner in pixels. */
    bannerHeight: number
    /** Updates the banner height. */
    setBannerHeight: (height: number) => void
}

const ExperimentalBannerContext = React.createContext<ExperimentalBannerContextType | undefined>(undefined)

/**
 * Provides context for the Experimental Banner, specifically tracking its dynamic height.
 * This allows child components (like `InteractiveToolLayout` or `SequencesPage`) to adjust their top margin/padding
 * so they don't get obscured by the fixed banner.
 */
export function ExperimentalBannerProvider({ children }: { children: React.ReactNode }) {
    const [bannerHeight, setBannerHeight] = React.useState(0)

    return (
        <ExperimentalBannerContext.Provider value={{ bannerHeight, setBannerHeight }}>
            {children}
        </ExperimentalBannerContext.Provider>
    )
}

/**
 * Hook to access the experimental banner's state.
 *
 * @returns An object containing `bannerHeight` (number) and `setBannerHeight` (function).
 * If used outside the provider, returns `bannerHeight: 0` (safe fallback).
 */
export function useExperimentalBanner() {
    const context = React.useContext(ExperimentalBannerContext)
    // Optional context - if not used, return 0 height
    if (!context) {
        return { bannerHeight: 0, setBannerHeight: () => { } }
    }
    return context
}
