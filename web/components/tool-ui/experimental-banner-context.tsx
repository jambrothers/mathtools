"use client"

import * as React from "react"

interface ExperimentalBannerContextType {
    bannerHeight: number
    setBannerHeight: (height: number) => void
}

const ExperimentalBannerContext = React.createContext<ExperimentalBannerContextType | undefined>(undefined)

export function ExperimentalBannerProvider({ children }: { children: React.ReactNode }) {
    const [bannerHeight, setBannerHeight] = React.useState(0)

    return (
        <ExperimentalBannerContext.Provider value={{ bannerHeight, setBannerHeight }}>
            {children}
        </ExperimentalBannerContext.Provider>
    )
}

export function useExperimentalBanner() {
    const context = React.useContext(ExperimentalBannerContext)
    // Optional context - if not used, return 0 height
    if (!context) {
        return { bannerHeight: 0, setBannerHeight: () => { } }
    }
    return context
}
