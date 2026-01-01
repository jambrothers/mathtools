"use client"

import * as React from "react"

interface PageTitleContextType {
    title: string | null
    setTitle: (title: string | null) => void
    isNavbarVisible: boolean
    toggleNavbar: () => void
}

const PageTitleContext = React.createContext<PageTitleContextType | undefined>(undefined)

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
    const [title, setTitle] = React.useState<string | null>(null)
    const [isNavbarVisible, setIsNavbarVisible] = React.useState(true)

    const toggleNavbar = React.useCallback(() => {
        setIsNavbarVisible(prev => !prev)
    }, [])

    return (
        <PageTitleContext.Provider value={{ title, setTitle, isNavbarVisible, toggleNavbar }}>
            {children}
        </PageTitleContext.Provider>
    )
}

export function usePageTitle() {
    const context = React.useContext(PageTitleContext)
    if (context === undefined) {
        throw new Error("usePageTitle must be used within a PageTitleProvider")
    }
    return context
}
