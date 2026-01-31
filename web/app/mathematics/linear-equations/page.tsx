"use client"

import * as React from "react"
import { InteractiveToolLayout } from "@/components/tool-ui/interactive-tool-layout"
import { ResolutionGuard } from "@/components/tool-ui/resolution-guard"
import { SetPageTitle } from "@/components/set-page-title"
import { GraphSVG } from "./_components/graph-svg"
import { LinearEquationsSidebar } from "./_components/linear-equations-sidebar"
import { useLinearEquations } from "./_hooks/use-linear-equations"
import { copyURLToClipboard } from "@/lib/url-state"
import { Link2, Image as ImageIcon, FileCode } from "lucide-react"

export default function LinearEquationsPage() {
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
        showGrid,
        setShowGrid,
        addLine,
        removeLine,
        updateLine,
        applyPreset,
        reset,
        getShareableURL,
        isInitialized
    } = useLinearEquations()

    // Export Modal State
    const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false)

    // Handle Export
    const handleExport = (format: 'png' | 'svg') => {
        const svgElement = document.querySelector('svg')
        if (!svgElement) return

        if (format === 'svg') {
            const svgData = new XMLSerializer().serializeToString(svgElement)
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `linear-graph-${Date.now()}.svg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else if (format === 'png') {
            const svgData = new XMLSerializer().serializeToString(svgElement)
            const img = new Image()
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
            const url = URL.createObjectURL(svgBlob)

            img.onload = () => {
                const canvas = document.createElement('canvas')
                // Use generic dimensions or actual
                canvas.width = 600 * 2 // @2x for retina quality
                canvas.height = 400 * 2
                const ctx = canvas.getContext('2d')
                if (!ctx) return

                // Fill white background (transparent by default)
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                const pngUrl = canvas.toDataURL('image/png')
                const link = document.createElement('a')
                link.href = pngUrl
                link.download = `linear-graph-${Date.now()}.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            }
            img.src = url
        }
        setIsExportMenuOpen(false)
    }

    const handleCopyLink = () => {
        copyURLToClipboard(getShareableURL())
        // Show toast? relying on button feedback normally but here we have a floating action?
        // Let's add simple feedback if possible, or just copy.
    }

    if (!isInitialized) return null // Or loading spinner

    return (
        <ResolutionGuard>
            <SetPageTitle title="Linear Equations" />

            <InteractiveToolLayout
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
                        showGrid={showGrid}
                        setShowGrid={setShowGrid}
                        onApplyPreset={applyPreset}
                        onReset={reset}
                        onExport={() => setIsExportMenuOpen(true)}
                    />
                }
                toolbarOverlay={
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleCopyLink}
                            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Copy Link"
                        >
                            <Link2 size={20} />
                        </button>
                    </div>
                }
            >
                {/* Main Graph Area */}
                <div className="w-full h-full flex items-center justify-center p-4 md:p-8 bg-slate-50 dark:bg-slate-950 relative">
                    <div className="w-full max-w-4xl aspect-[3/2] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                        <GraphSVG
                            lines={lines}
                            showEquation={showEquation}
                            showIntercepts={showIntercepts}
                            showSlopeTriangle={showSlopeTriangle}
                            showGrid={showGrid}
                            activeLineId={activeLineId}
                            onLineClick={setActiveLineId}
                        />
                    </div>

                    {/* Export Menu Modal/Popover */}
                    {isExportMenuOpen && (
                        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsExportMenuOpen(false)}>
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Export Graph</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleExport('png')}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-slate-600 dark:text-slate-300"
                                    >
                                        <ImageIcon size={32} />
                                        <span className="font-medium">PNG Image</span>
                                    </button>
                                    <button
                                        onClick={() => handleExport('svg')}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-slate-600 dark:text-slate-300"
                                    >
                                        <FileCode size={32} />
                                        <span className="font-medium">SVG Vector</span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsExportMenuOpen(false)}
                                    className="w-full py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </InteractiveToolLayout>
        </ResolutionGuard>
    )
}
