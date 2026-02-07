"use client"

import * as React from "react"
import { InteractiveToolLayout } from "@/components/tool-ui/interactive-tool-layout"
import { ResolutionGuard } from "@/components/tool-ui/resolution-guard"
import { SetPageTitle } from "@/components/set-page-title"
import { GraphSVG } from "./_components/graph-svg"
import { LinearEquationsSidebar } from "./_components/linear-equations-sidebar"
import { useLinearEquations } from "./_hooks/use-linear-equations"
import { copyURLToClipboard } from "@/lib/url-state"
import { Pointer, MoveVertical, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { exportSVGElement } from "@/lib/export/canvas-export"
import { ExportModal } from "@/components/tool-ui/export-modal"

function LinearEquationsContent() {
    const {
        lines,
        activeLineId,
        setActiveLineId,
        showEquation,
        setShowEquation,
        showIntercepts,
        setShowIntercepts,
        showSlopeTriangle,
        setShowSlopeTriangle,

        slopeTriangleSize,
        setSlopeTriangleSize,
        showGradientCalculation,
        setShowGradientCalculation,
        showGrid,
        setShowGrid,
        addLine,
        removeLine,
        updateLine,
        applyPreset,
        reset,
        getShareableURL,
        isInitialized,
        interactionMode,
        setInteractionMode
    } = useLinearEquations()

    // Export Modal State
    const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false)

    // Handle Export
    const handleExport = async (format: 'png' | 'svg') => {
        const svgElement = document.querySelector('[data-testid="graph-svg"]') as SVGSVGElement
        if (!svgElement) return

        await exportSVGElement(svgElement, {
            format,
            filename: 'linear-graph',
            backgroundColor: 'transparent', // Fixed: transparent background instead of white
        })
        setIsExportMenuOpen(false)
    }

    const handleCopyLink = () => {
        copyURLToClipboard(getShareableURL())
    }

    if (!isInitialized) return null // Or loading spinner

    return (
        <ResolutionGuard>
            <SetPageTitle title="Linear Equations" />

            <InteractiveToolLayout
                dataTestId="linear-equations-page"
                sidebarWidth={400}
                sidebar={
                    <LinearEquationsSidebar
                        lines={lines}
                        activeLineId={activeLineId}
                        onLineSelect={setActiveLineId}
                        onAddLine={addLine}
                        onRemoveLine={removeLine}
                        onUpdateLine={updateLine}
                        showEquation={showEquation}
                        setShowEquation={setShowEquation}
                        showIntercepts={showIntercepts}
                        setShowIntercepts={setShowIntercepts}
                        showSlopeTriangle={showSlopeTriangle}
                        setShowSlopeTriangle={setShowSlopeTriangle}

                        slopeTriangleSize={slopeTriangleSize}
                        setSlopeTriangleSize={setSlopeTriangleSize}
                        showGradientCalculation={showGradientCalculation}
                        setShowGradientCalculation={setShowGradientCalculation}
                        showGrid={showGrid}
                        setShowGrid={setShowGrid}
                        onApplyPreset={applyPreset}
                        onReset={reset}
                        onExport={() => setIsExportMenuOpen(true)}
                        onCopyLink={handleCopyLink}
                    />
                }
                toolbarOverlay={
                    <div className="flex bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 p-1 gap-1">
                        <button
                            onClick={() => setInteractionMode('none')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2",
                                interactionMode === 'none'
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200"
                                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
                            )}
                        >
                            <Pointer size={14} />
                            Select
                        </button>
                        <button
                            onClick={() => setInteractionMode('move')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2",
                                interactionMode === 'move'
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200"
                                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
                            )}
                            title="Drag line to change Y-intercept"
                        >
                            <MoveVertical size={14} />
                            Move (c)
                        </button>
                        <button
                            onClick={() => setInteractionMode('rotate')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2",
                                interactionMode === 'rotate'
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200"
                                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
                            )}
                            title="Drag line to change Gradient"
                        >
                            <RotateCw size={14} />
                            Rotate (m)
                        </button>
                    </div>
                }
            >
                {/* Main Graph Area */}
                <div className="w-full h-full flex bg-white dark:bg-slate-950 relative overflow-hidden">
                    <div className="flex-1 relative overflow-hidden">
                        <GraphSVG
                            lines={lines}
                            showEquation={showEquation}
                            showIntercepts={showIntercepts}

                            showSlopeTriangle={showSlopeTriangle}
                            slopeTriangleSize={slopeTriangleSize}
                            showGradientCalculation={showGradientCalculation}
                            showGrid={showGrid}

                            activeLineId={activeLineId}
                            onLineSelect={setActiveLineId}
                            interactionMode={interactionMode}
                            onParameterChange={updateLine}
                        />
                    </div>

                    {/* Export Modal */}
                    <ExportModal
                        isOpen={isExportMenuOpen}
                        onClose={() => setIsExportMenuOpen(false)}
                        onExport={handleExport}
                        title="Export Graph"
                    />
                </div>
            </InteractiveToolLayout>
        </ResolutionGuard>
    )
}

export default function LinearEquationsPage() {
    return (
        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <LinearEquationsContent />
        </React.Suspense>
    )
}
