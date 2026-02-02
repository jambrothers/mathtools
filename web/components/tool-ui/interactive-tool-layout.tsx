"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface InteractiveToolLayoutProps {
    children: React.ReactNode
    sidebar?: React.ReactNode
    sidebarWidth?: number
    className?: string
    toolbarOverlay?: React.ReactNode
    footerOverlay?: React.ReactNode
}

export function InteractiveToolLayout({
    children,
    sidebar,
    sidebarWidth = 384, // w-96 = 24rem = 384px
    className,
    toolbarOverlay,
    footerOverlay
}: InteractiveToolLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

    React.useEffect(() => {
        const checkWidth = () => {
            const width = window.innerWidth
            const small = width < 1024 // lg breakpoint
            if (small) {
                setIsSidebarOpen(false)
            } else {
                setIsSidebarOpen(true)
            }
        }

        // Initial check
        checkWidth()

        window.addEventListener("resize", checkWidth)
        return () => window.removeEventListener("resize", checkWidth)
    }, [])

    return (
        <div className={cn("fixed inset-0 top-[81px] overflow-hidden flex bg-[var(--theme-page)] z-[40]", className)}>
            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 overflow-hidden h-full">
                {/* Canvas Area - No Scroll */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                    {children}

                    {/* Toolbar Overlay */}
                    {toolbarOverlay && (
                        <div className="absolute top-6 left-6 z-30 pointer-events-none">
                            <div className="pointer-events-auto">
                                {toolbarOverlay}
                            </div>
                        </div>
                    )}

                    {/* Footer Overlay */}
                    {footerOverlay && (
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                            <div className="pointer-events-auto">
                                {footerOverlay}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Sidebar Toggle Button - Fixed to viewport to ensure visibility */}
            {sidebar && (
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={cn(
                        "fixed top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md rounded-full p-2 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 ease-in-out",
                    )}
                    style={{
                        right: isSidebarOpen ? (sidebarWidth - 16) : 16, // -16 overlaps slightly, 16 is inset
                    }}
                    title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    <ChevronRight
                        className={cn(
                            "w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-300",
                            isSidebarOpen ? "" : "rotate-180"
                        )}
                    />
                </button>
            )}

            {/* Sidebar */}
            {sidebar && (
                <aside
                    className={cn(
                        "bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-[width,transform] duration-300 ease-in-out shrink-0 z-40 h-full",
                        isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:w-0"
                    )}
                    style={{
                        width: isSidebarOpen ? sidebarWidth : 0,
                    }}
                >
                    <div className="h-full w-full overflow-y-auto overflow-x-hidden custom-scrollbar relative">
                        {sidebar}
                    </div>
                </aside>
            )}
        </div>
    )
}
