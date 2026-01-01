"use client"

import { usePageTitle } from "@/components/page-title-context"
import { cn } from "@/lib/utils"

/**
 * A wrapper for the main content area that adjusts its top padding
 * based on the visibility of the Navbar.
 * 
 * @param children - The main content elements.
 */
export function MainContentWrapper({ children }: { children: React.ReactNode }) {
    const { isNavbarVisible } = usePageTitle()

    return (
        <main
            className={cn(
                "flex-grow transition-[padding] duration-300 ease-in-out",
                isNavbarVisible ? "pt-[81px]" : "pt-0"
            )}
        >
            {children}
        </main>
    )
}
