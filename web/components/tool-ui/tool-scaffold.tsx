"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { InteractiveToolLayout } from "./interactive-tool-layout"
import { ResolutionGuard } from "./resolution-guard"
import { HelpButton } from "./help-button"
import { HelpModal } from "./help-modal"

interface ToolScaffoldProps {
    children: React.ReactNode
    sidebar?: React.ReactNode
    toolbarOverlay?: React.ReactNode
    footerOverlay?: React.ReactNode
    helpContent?: string
    dataTestId?: string
    className?: string
    useInteractiveLayout?: boolean
}

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
