'use client';

import * as React from 'react';
import { SetPageTitle } from '@/components/set-page-title';
import { Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator } from '@/components/tool-ui/toolbar';
import { CopyLinkButton } from '@/components/tool-ui/copy-link-button';
import { Canvas } from '@/components/tool-ui/canvas';
import { ResolutionGuard } from '@/components/tool-ui/resolution-guard';
import { usePercentageGrid } from './_hooks/use-percentage-grid';
import { PercentageGrid } from './_components/percentage-grid';
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
        isDragging,
        toggleSquare,
        startDrag,
        dragEnter,
        endDrag,
        fillPercent,
        clear,
        setFromIndices,
    } = usePercentageGrid();

    const { copyShareableUrl } = useUrlState(percentageGridURLSerializer, {
        onRestore: (state) => {
            setFromIndices(state.selectedIndices);
        }
    });

    const handleCopyLink = React.useCallback(async () => {
        const state: PercentageGridURLState = {
            selectedIndices: Array.from(selectedIndices).sort((a, b) => a - b),
        };
        await copyShareableUrl(state);
    }, [copyShareableUrl, selectedIndices]);

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
                    <CopyLinkButton onCopyLink={handleCopyLink} />
                </ToolbarGroup>
            </Toolbar>

            <Canvas className="flex-1" gridSize={40}>
                <div className="flex h-full w-full items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4 sm:p-6">
                        <PercentageGrid
                            selectedIndices={selectedIndices}
                            isDragging={isDragging}
                            onToggle={toggleSquare}
                            onDragStart={startDrag}
                            onDragEnter={dragEnter}
                            onDragEnd={endDrag}
                        />
                    </div>
                </div>
            </Canvas>
        </div>
    );
}
