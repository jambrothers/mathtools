'use client';

import * as React from 'react';
import { SetPageTitle } from '@/components/set-page-title';
import { Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator } from '@/components/tool-ui/toolbar';
import { CopyLinkButton } from '@/components/tool-ui/copy-link-button';
import { Canvas } from '@/components/tool-ui/canvas';
import { ResolutionGuard } from '@/components/tool-ui/resolution-guard';
import { usePercentageGrid } from './_hooks/use-percentage-grid';
import { PercentageGrid } from './_components/percentage-grid';
import { FdpPanel } from './_components/fdp-panel';
import { useUrlState } from '@/lib/hooks/use-url-state';
import { percentageGridURLSerializer, PercentageGridURLState } from './_lib/url-state';

function PercentageGridPageLoading() {
    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden items-center justify-center">
            <div className="animate-pulse text-slate-400 dark:text-slate-500">Loading...</div>
        </div>
    );
}

export default function PercentageGridPage() {
    return (
        <React.Suspense fallback={<PercentageGridPageLoading />}>
            <ResolutionGuard>
                <PercentageGridPageContent />
            </ResolutionGuard>
        </React.Suspense>
    );
}

function PercentageGridPageContent() {
    const {
        selectedIndices,
        dragPreviewBounds,
        isDragging,
        toggleSquare,
        startDrag,
        dragEnter,
        endDrag,
        fillPercent,
        clear,
        setFromIndices,
        setDisplayOptions,
        percentageDisplay,
        decimalDisplay,
        fractionDisplay,
        showPanel,
        showPercentage,
        showDecimal,
        showFraction,
        simplifyFraction,
        togglePanel,
        toggleShowPercentage,
        toggleShowDecimal,
        toggleShowFraction,
        toggleSimplifyFraction,
    } = usePercentageGrid();

    const { copyShareableUrl } = useUrlState(percentageGridURLSerializer, {
        onRestore: (state) => {
            setFromIndices(state.selectedIndices);
            setDisplayOptions({
                showPanel: state.showPanel,
                showPercentage: state.showPercentage,
                showDecimal: state.showDecimal,
                showFraction: state.showFraction,
                simplifyFraction: state.simplifyFraction,
            });
        }
    });

    const handleCopyLink = React.useCallback(async () => {
        const state: PercentageGridURLState = {
            selectedIndices: Array.from(selectedIndices).sort((a, b) => a - b),
            showPanel,
            showPercentage,
            showDecimal,
            showFraction,
            simplifyFraction,
        };
        await copyShareableUrl(state);
    }, [copyShareableUrl, selectedIndices, showPanel, showPercentage, showDecimal, showFraction, simplifyFraction]);

    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <SetPageTitle title="Percentage Grid" />

            <Toolbar className="sticky top-0">
                <ToolbarGroup>
                    <ToolbarButton label="Fill 10%" onClick={() => fillPercent(10)} />
                    <ToolbarButton label="Fill 25%" onClick={() => fillPercent(25)} />
                    <ToolbarButton label="Fill 50%" onClick={() => fillPercent(50)} />
                    <ToolbarButton label="Clear" onClick={clear} variant="danger" />
                </ToolbarGroup>
                <ToolbarGroup>
                    <ToolbarSeparator />
                    <ToolbarButton
                        label={showPanel ? "Panel" : "Panel"}
                        onClick={togglePanel}
                        active={showPanel}
                        aria-pressed={showPanel}
                    />
                    <ToolbarButton
                        label="Percentage"
                        onClick={toggleShowPercentage}
                        active={showPercentage}
                        aria-pressed={showPercentage}
                    />
                    <ToolbarButton
                        label="Decimal"
                        onClick={toggleShowDecimal}
                        active={showDecimal}
                        aria-pressed={showDecimal}
                    />
                    <ToolbarButton
                        label="Fraction"
                        onClick={toggleShowFraction}
                        active={showFraction}
                        aria-pressed={showFraction}
                    />
                    <ToolbarButton
                        label="Simplify"
                        onClick={toggleSimplifyFraction}
                        active={simplifyFraction}
                        aria-pressed={simplifyFraction}
                    />
                    <CopyLinkButton onCopyLink={handleCopyLink} />
                </ToolbarGroup>
            </Toolbar>

            <Canvas className="flex-1">
                <div className="relative flex h-full w-full items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4 sm:p-6">
                        <PercentageGrid
                            selectedIndices={selectedIndices}
                            dragPreviewBounds={dragPreviewBounds}
                            isDragging={isDragging}
                            onToggle={toggleSquare}
                            onDragStart={startDrag}
                            onDragEnter={dragEnter}
                            onDragEnd={endDrag}
                        />
                    </div>
                    {showPanel && (
                        <FdpPanel
                            percentage={percentageDisplay}
                            decimal={decimalDisplay}
                            fraction={fractionDisplay}
                            showPercentage={showPercentage}
                            showDecimal={showDecimal}
                            showFraction={showFraction}
                        />
                    )}
                </div>
            </Canvas>
        </div>
    );
}
