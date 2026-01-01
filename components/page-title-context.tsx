"use client"

import * as React from "react"

interface PageTitleContextType {
    title: string | null
    setTitle: (title: string | null) => void
}

const PageTitleContext = React.createContext<PageTitleContextType | undefined>(undefined)

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
    const [title, setTitle] = React.useState<string | null>(null)

    return (
        <PageTitleContext.Provider value={{ title, setTitle }}>
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
