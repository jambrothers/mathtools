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
    const [isSmallScreen, setIsSmallScreen] = React.useState(false)

    React.useEffect(() => {
        const checkWidth = () => {
            const width = window.innerWidth
            const small = width < 1024 // lg breakpoint
            setIsSmallScreen(small)
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
        <div className={cn("flex flex-1 overflow-hidden relative h-[calc(100vh-81px)]", className)}>
            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900">
                {/* Canvas Area */}
                <div className="flex-1 relative overflow-hidden">
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

                {/* Sidebar Toggle Button (floating on edge of sidebar) */}
                {sidebar && (
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={cn(
                            "absolute top-1/2 z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-full p-1.5 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 transform -translate-y-1/2",
                            isSidebarOpen
                                ? "right-[calc(384px-16px)]" // Positioned on the edge of the open sidebar
                                : "right-0 translate-x-1/2"  // Positioned on the edge of the screen
                        )}
                        style={{
                            right: isSidebarOpen ? `${sidebarWidth - 16}px` : undefined,
                            transition: 'right 0.3s ease-in-out'
                        }}
                        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        <ChevronRight
                            className={cn(
                                "w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-300",
                                isSidebarOpen ? "" : "rotate-180"
                            )}
                        />
                    </button>
                )}
            </main>

            {/* Sidebar */}
            {sidebar && (
                <aside
                    className={cn(
                        "bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col transition-[width,transform] duration-300 ease-in-out overflow-hidden shrink-0 z-20",
                        isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:w-0",
                        // Mobile behavior: slide over content? Or push? 
                        // Existing design implies push/resize for desktop.
                        // Let's stick to standard flow behavior for simplicity first.
                    )}
                    style={{
                        width: isSidebarOpen ? sidebarWidth : 0,
                        // On small screens, we might want it to be absolute/overlay, but for now let's follow the standard
                    }}
                >
                    <div className="h-full overflow-y-auto w-full custom-scrollbar">
                        {sidebar}
                    </div>
                </aside>
            )}
        </div>
    )
}
