"use client"

import { cn } from "@/lib/utils"

/**
 * A wrapper for the main content area that adjusts its top padding
 * to account for the fixed Navbar.
 * 
 * @param children - The main content elements.
 */
export function MainContentWrapper({ children }: { children: React.ReactNode }) {
    return (
        <main
            className={cn(
                "flex-grow flex flex-col min-h-0 pt-[81px]"
            )}
        >
            {children}
        </main>
    )
}
