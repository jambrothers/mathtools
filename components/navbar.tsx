"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Moon, Sun, Menu, X, ChevronDown } from "lucide-react"
import { usePageTitle } from "./page-title-context"

/**
 * The main application navigation bar.
 * Handles navigation links, theme toggling, and mobile menu state.
 * Visibility is controlled via the PageTitleContext.
 */
export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [isToolsOpen, setIsToolsOpen] = React.useState(false)
    const pathname = usePathname()
    const { title, isNavbarVisible, toggleNavbar } = usePageTitle()

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/"
        return pathname.startsWith(path)
    }

    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <>
            {/* Collapse/Expand Toggle (Always Visible when collapsed, hidden when expanded unless hovering top?) 
                Actually, let's put it in the navbar when expanded, and a floating trigger when collapsed. 
            */}
            <button
                onClick={toggleNavbar}
                className={`fixed top-0 left-1/2 transform -translate-x-1/2 z-[60] p-1 bg-[var(--theme-card)] border border-t-0 border-[var(--theme-border)] rounded-b-lg shadow-md transition-transform duration-300 hover:text-[var(--theme-main)] text-[var(--theme-muted)] ${isNavbarVisible ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
                aria-label="Show Navbar"
                title="Show Navbar"
            >
                <ChevronDown size={20} />
            </button>

            <nav className={`fixed top-0 w-full z-50 border-b border-[var(--theme-border)] bg-[var(--theme-page)]/80 backdrop-blur-md transition-transform duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[81px] relative">
                        <div className="flex items-center flex-shrink-0 z-10 bg-[var(--theme-page)]/0">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="group-hover:opacity-90 transition-opacity">
                                    {mounted ? (
                                        <Image
                                            src={theme === "dark" ? "/assets/logo-dark.svg" : "/assets/logo.svg"}
                                            alt="MathTools Logo"
                                            width={40}
                                            height={40}
                                            className="w-10 h-10"
                                        />
                                    ) : (
                                        <div className="w-10 h-10" /> // Placeholder to prevent hydration mismatch
                                    )}
                                </div>
                                <span className="font-bold text-xl tracking-tight text-[var(--theme-main)]">
                                    MathTools
                                </span>
                            </Link>
                        </div>

                        {/* Centered Title */}
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            {title && (
                                <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 animate-in fade-in zoom-in duration-300 fill-mode-forwards" style={{ opacity: 1 }}>
                                    {title}
                                </h1>
                            )}
                        </div>

                        <div className="hidden md:flex ml-auto items-center space-x-8 z-10 bg-[var(--theme-page)]/0">
                            <Link
                                href="/"
                                className={`text-sm font-medium transition-colors ${isActive("/") ? "text-[var(--theme-main)]" : "text-[var(--theme-muted)] hover:text-[var(--theme-main)]"}`}
                            >
                                Home
                            </Link>

                            <Link
                                href="/about"
                                className={`text-sm font-medium transition-colors ${isActive("/about") ? "text-[var(--theme-main)]" : "text-[var(--theme-muted)] hover:text-[var(--theme-main)]"}`}
                            >
                                About
                            </Link>

                            {/* Tools Dropdown */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setIsToolsOpen(true)}
                                onMouseLeave={() => setIsToolsOpen(false)}
                            >
                                <Link
                                    href="/tools"
                                    className={`flex items-center gap-1 text-sm font-medium transition-colors py-2 ${isActive("/tools") ? "text-[var(--theme-main)]" : "text-[var(--theme-muted)] group-hover:text-[var(--theme-main)]"}`}
                                >
                                    Tools
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                                </Link>

                                <div
                                    className={`absolute right-0 top-full mt-0 w-48 rounded-xl bg-[var(--theme-card)] border border-[var(--theme-border)] shadow-lg py-1 transition-all duration-200 origin-top-right ${isToolsOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}
                                >
                                    <Link
                                        href="/tools#mathematics"
                                        className="block px-4 py-2 text-sm text-[var(--theme-muted)] hover:bg-[var(--theme-page)] hover:text-[var(--theme-main)]"
                                        onClick={() => setIsToolsOpen(false)}
                                    >
                                        Mathematics
                                    </Link>
                                    <Link
                                        href="/tools#computing"
                                        className="block px-4 py-2 text-sm text-[var(--theme-muted)] hover:bg-[var(--theme-page)] hover:text-[var(--theme-main)]"
                                        onClick={() => setIsToolsOpen(false)}
                                    >
                                        Computing
                                    </Link>
                                </div>
                            </div>


                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="p-2 rounded-full hover:bg-[var(--theme-card)] text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors"
                                    aria-label="Toggle theme"
                                >
                                    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                                </button>
                            )}

                            <div className="h-6 w-px bg-[var(--theme-border)] mx-2" />

                            <button
                                onClick={toggleNavbar}
                                className="p-2 rounded-full hover:bg-[var(--theme-card)] text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors"
                                aria-label="Hide Navbar"
                                title="Hide Navbar"
                            >
                                <ChevronDown size={20} className="rotate-180" />
                            </button>
                        </div>

                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-[var(--theme-muted)] hover:text-[var(--theme-main)] hover:bg-[var(--theme-card)] focus:outline-none"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden bg-[var(--theme-page)] border-b border-[var(--theme-border)]">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[var(--theme-muted)] hover:text-[var(--theme-main)] hover:bg-[var(--theme-card)]">
                                Home
                            </Link>
                            <Link href="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-[var(--theme-muted)] hover:text-[var(--theme-main)] hover:bg-[var(--theme-card)]">
                                About
                            </Link>
                            <div className="px-3 py-2 text-base font-medium">
                                <Link
                                    href="/tools"
                                    onClick={() => setIsOpen(false)}
                                    className={`block mb-1 ${isActive("/tools") ? "text-[var(--theme-main)]" : "text-[var(--theme-muted)] hover:text-[var(--theme-main)]"}`}
                                >
                                    Tools
                                </Link>
                                <Link href="/tools#mathematics" onClick={() => setIsOpen(false)} className="block pl-4 py-1 text-sm text-[var(--theme-muted)] hover:text-[var(--theme-main)] border-l border-[var(--theme-border)] ml-1">
                                    Mathematics
                                </Link>
                                <Link href="/tools#computing" onClick={() => setIsOpen(false)} className="block pl-4 py-1 text-sm text-[var(--theme-muted)] hover:text-[var(--theme-main)] border-l border-[var(--theme-border)] ml-1">
                                    Computing
                                </Link>
                            </div>

                            <div className="px-3 py-2">
                                {mounted && (
                                    <button
                                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                        className="flex items-center gap-2 text-[var(--theme-muted)] hover:text-[var(--theme-main)]"
                                    >
                                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                                        <span>Switch Theme</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}
