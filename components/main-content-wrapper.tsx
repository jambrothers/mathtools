"use client"

import { usePageTitle } from "@/components/page-title-context"
import { cn } from "@/lib/utils"

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
