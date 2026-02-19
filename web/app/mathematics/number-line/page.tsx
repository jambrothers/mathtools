"use client"

import * as React from "react"
import { Suspense, useEffect, useState } from "react"
import { InteractiveToolLayout } from "@/components/tool-ui/interactive-tool-layout"
import { ResolutionGuard } from "@/components/tool-ui/resolution-guard"
import { SetPageTitle } from "@/components/set-page-title"
import { NumberLineSVG } from "./_components/number-line-svg"
import { NumberLineSidebar } from "./_components/number-line-sidebar"
import { useNumberLine } from "./_hooks/use-number-line"
import { useUrlState } from "@/lib/hooks/use-url-state"
import { numberLineSerializer } from "./_lib/url-state"
import { exportSVGElement } from "@/lib/export/canvas-export"
import { ExportModal } from "@/components/tool-ui/export-modal"

function NumberLineContent() {
    const {
        min,
        max,
        viewport,
        points,
        arcs,
        showLabels,
        hideValues,
        snapToTicks,
        interactionMode,
        pendingArcStart,
        setInteractionMode,
        setPendingArcStart,
        setRange,
        zoom,
        zoomIn,
        zoomOut,
        addPoint,
        removePoint,
        movePoint,
        togglePointHidden,
        revealAllPoints,
        hideAllPoints,
        handleLineClick,
        handlePointClick,
        addArc,
        removeArc,
        setShowLabels,
        setHideValues,
        setSnapToTicks,
        reset,
        initFromState
    } = useNumberLine();

    const [showNegativeRegion, setShowNegativeRegion] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    const { hasRestored, getShareableUrl, copyShareableUrl } = useUrlState(numberLineSerializer, {
        onRestore: (state) => {
            if (state) initFromState(state);
        }
    });

    // Update URL when state changes
    useEffect(() => {
        if (!hasRestored) return;

        const state = {
            min,
            max,
            points,
            arcs,
            showLabels,
            hideValues,
            snapToTicks,
            showNegativeRegion
        };
        const url = getShareableUrl(state);
        window.history.replaceState({}, '', url);
    }, [min, max, points, arcs, showLabels, hideValues, snapToTicks, showNegativeRegion, hasRestored, getShareableUrl]);

    const handleExport = async (format: 'png' | 'svg') => {
        const svg = document.querySelector('[data-testid="number-line-svg"]') as SVGSVGElement;
        if (!svg) return;
        await exportSVGElement(svg, {
            filename: 'number-line',
            format,
            backgroundColor: 'transparent'
        });
        setIsExportOpen(false);
    };

    return (
        <InteractiveToolLayout
            sidebar={
                <NumberLineSidebar
                    viewport={viewport}
                    points={points}
                    arcs={arcs}
                    showLabels={showLabels}
                    hideValues={hideValues}
                    showNegativeRegion={showNegativeRegion}
                    snapToTicks={snapToTicks}
                    onSetRange={setRange}
                    onZoomIn={zoomIn}
                    onZoomOut={zoomOut}
                    onAddPoint={addPoint}
                    onRemovePoint={removePoint}
                    onAddArc={addArc}
                    onRemoveArc={removeArc}
                    onToggleLabels={setShowLabels}
                    onToggleHide={setHideValues}
                    onToggleNegative={setShowNegativeRegion}
                    onToggleSnap={setSnapToTicks}
                    onTogglePointHidden={togglePointHidden}
                    onRevealAllPoints={revealAllPoints}
                    onHideAllPoints={hideAllPoints}
                    interactionMode={interactionMode}
                    pendingArcStart={pendingArcStart}
                    onSetInteractionMode={setInteractionMode}
                    onSetPendingArcStart={setPendingArcStart}
                    onReset={reset}
                    onCopyLink={() => copyShareableUrl({ min, max, points, arcs, showLabels, hideValues, snapToTicks, showNegativeRegion })}
                    onExport={() => setIsExportOpen(true)}
                />
            }
        >
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-7xl aspect-[5/2] bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <NumberLineSVG
                        viewport={viewport}
                        points={points}
                        arcs={arcs}
                        showLabels={showLabels}
                        hideValues={hideValues}
                        showNegativeRegion={showNegativeRegion}
                        interactionMode={interactionMode}
                        pendingArcStart={pendingArcStart}
                        onPointMove={movePoint}
                        onPointClick={handlePointClick}
                        onLineClick={handleLineClick}
                        onZoom={(focal, factor) => {
                            zoom(factor, focal);
                        }}
                    />
                </div>
            </div>

            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                onExport={handleExport}
                title="Export Number Line"
            />
        </InteractiveToolLayout>
    );
}

export default function NumberLinePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <ResolutionGuard>
                <SetPageTitle title="Number Line" />
                <NumberLineContent />
            </ResolutionGuard>
        </Suspense>
    );
}
