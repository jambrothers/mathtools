"use client"

import * as React from "react"

/**
 * Context type definition for managing page titles and navbar visibility.
 */
interface PageTitleContextType {
    /** The current page title to display in the navbar. */
    title: string | null
    /** Function to update the page title. */
    setTitle: (title: string | null) => void
    /** Whether the navbar is currently visible (expanded). */
    isNavbarVisible: boolean
    /** Function to toggle navbar visibility. */
    toggleNavbar: () => void
}

const PageTitleContext = React.createContext<PageTitleContextType | undefined>(undefined)

/**
 * Provider component that wraps the application to supply page title context.
 * Manages the state for the current page title and navbar visibility.
 * 
 * @param children - The child components that will have access to this context.
 */
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

/**
 * Hook to access and manipulate the page title and navbar visibility.
 * Must be used within a PageTitleProvider.
 * 
 * @returns The PageTitleContextType object.
 * @throws Error if used outside of a PageTitleProvider.
 */
export function usePageTitle() {
    const context = React.useContext(PageTitleContext)
    if (context === undefined) {
        throw new Error("usePageTitle must be used within a PageTitleProvider")
    }
    return context
}
