"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { InteractiveToolLayout } from "./interactive-tool-layout"
import { ResolutionGuard } from "./resolution-guard"
import { HelpButton } from "./help-button"
import { HelpModal } from "./help-modal"

/**
 * Props for the ToolScaffold component.
 */
interface ToolScaffoldProps {
    /** The main content of the tool (typically the canvas or workspace). */
    children: React.ReactNode
    /** Optional sidebar content (e.g., tool palette). */
    sidebar?: React.ReactNode
    /** Optional toolbar content to overlay on top of the workspace. */
    toolbarOverlay?: React.ReactNode
    /** Optional footer content (e.g., status bar) to overlay at the bottom. */
    footerOverlay?: React.ReactNode
    /** Markdown string for the built-in help modal. */
    helpContent?: string
    /** Test ID for testing. */
    dataTestId?: string
    /** Additional CSS classes. */
    className?: string
    /**
     * Whether to use the advanced InteractiveToolLayout (responsive sidebar, fixed positioning).
     * Set to `true` for complex tools with sidebars and canvases.
     * Defaults to `false` (standard flow layout).
     */
    useInteractiveLayout?: boolean
}

/**
 * The primary layout wrapper for all interactive tools.
 *
 * It provides:
 * 1. A consistent structure (Sidebar, Toolbar, Footer).
 * 2. Built-in Help Modal support via `helpContent`.
 * 3. Mobile resolution warnings via `ResolutionGuard`.
 * 4. Flexible layout modes:
 *    - Standard (default): Simple flex column, good for basic tools.
 *    - Interactive (`useInteractiveLayout=true`): specific layout with collapsible sidebar
 *      and absolute positioning for canvas-heavy tools.
 *
 * @example
 * ```tsx
 * <ToolScaffold
 *   helpContent={helpMarkdown}
 *   sidebar={<MySidebar />}
 *   useInteractiveLayout={true}
 * >
 *   <MyCanvas />
 * </ToolScaffold>
 * ```
 */
export function ToolScaffold({
    children,
    sidebar,
    toolbarOverlay,
    footerOverlay,
    helpContent,
    dataTestId,
    className,
    useInteractiveLayout = false
}: ToolScaffoldProps) {
    const [showHelp, setShowHelp] = React.useState(false)

    const content = (
        <div className={cn("relative w-full min-h-0 flex flex-col", className)}>
            {children}
            {helpContent && (
                <HelpButton onClick={() => setShowHelp(true)} />
            )}
            {helpContent && showHelp && (
                <HelpModal content={helpContent} onClose={() => setShowHelp(false)} />
            )}
        </div>
    )

    return (
        <ResolutionGuard>
            {useInteractiveLayout ? (
                <InteractiveToolLayout
                    sidebar={sidebar}
                    toolbarOverlay={toolbarOverlay}
                    footerOverlay={footerOverlay}
                    dataTestId={dataTestId}
                    className={className}
                >
                    {content}
                </InteractiveToolLayout>
            ) : (
                content
            )}
        </ResolutionGuard>
    )
}
