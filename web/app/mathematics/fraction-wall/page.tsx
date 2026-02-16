"use client"

import React, { Suspense, useEffect } from 'react';
import { InteractiveToolLayout } from '@/components/tool-ui/interactive-tool-layout';
import { ResolutionGuard } from '@/components/tool-ui/resolution-guard';
import { SetPageTitle } from '@/components/set-page-title';
import { useFractionWall } from './_hooks/use-fraction-wall';
import { fractionWallURLSerializer } from './_lib/url-state';
import { useUrlState } from '@/lib/hooks/use-url-state';
import { FractionWallSVG } from './_components/fraction-wall-svg';
import { FractionWallSidebar } from './_components/fraction-wall-sidebar';
import { exportSVGElement } from '@/lib/export/canvas-export';

function FractionWallContent() {
    const {
        visibleDenominators,
        shadedSegments,
        labelMode,
        showEquivalenceLines,
        comparisonPair,
        toggleDenominator,
        toggleSegment,
        clearShading,
        setLabelMode,
        setShowEquivalenceLines,
        initFromState
    } = useFractionWall();

    const { hasRestored, getShareableUrl, copyShareableUrl } = useUrlState(fractionWallURLSerializer, {
        onRestore: (state) => {
            if (state) initFromState(state);
        }
    });

    // Update URL when state changes
    useEffect(() => {
        if (!hasRestored) return;

        const state = {
            visibleDenominators,
            shadedSegments,
            labelMode,
            showEquivalenceLines,
            comparisonPair
        };
        const url = getShareableUrl(state);
        window.history.replaceState({}, '', url);
    }, [visibleDenominators, shadedSegments, labelMode, showEquivalenceLines, comparisonPair, hasRestored, getShareableUrl]);

    const handleExport = async () => {
        const svg = document.querySelector('[data-testid="fraction-wall-svg"]') as SVGSVGElement;
        if (!svg) return;
        await exportSVGElement(svg, {
            filename: 'fraction-wall',
            format: 'png',
            backgroundColor: 'transparent'
        });
    };

    return (
        <InteractiveToolLayout
            sidebar={
                <FractionWallSidebar
                    visibleDenominators={visibleDenominators}
                    onToggleDenominator={toggleDenominator}
                    labelMode={labelMode}
                    onLabelModeChange={setLabelMode}
                    showEquivalenceLines={showEquivalenceLines}
                    onToggleEquivalenceLines={setShowEquivalenceLines}
                    onClear={clearShading}
                    onCopyLink={() => copyShareableUrl({ visibleDenominators, shadedSegments, labelMode, showEquivalenceLines, comparisonPair })}
                    onExport={handleExport}
                />
            }
        >
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-8 overflow-auto flex items-center justify-center min-h-0">
                <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                    <FractionWallSVG
                        visibleDenominators={visibleDenominators}
                        shadedSegments={shadedSegments}
                        labelMode={labelMode}
                        showEquivalenceLines={showEquivalenceLines}
                        comparisonPair={comparisonPair}
                        onSegmentClick={toggleSegment}
                    />
                </div>
            </div>
        </InteractiveToolLayout>
    );
}

export default function FractionWallPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <ResolutionGuard>
                <SetPageTitle title="Fraction Wall" />
                <FractionWallContent />
            </ResolutionGuard>
        </Suspense>
    );
}
