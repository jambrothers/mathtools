'use client';

import * as React from 'react';
import { SetPageTitle } from '@/components/set-page-title';
import { Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator } from '@/components/tool-ui/toolbar';
import { CopyLinkButton } from '@/components/tool-ui/copy-link-button';
import { Canvas } from '@/components/tool-ui/canvas';
import { ResolutionGuard } from '@/components/tool-ui/resolution-guard';
import { usePercentageGrid } from './_hooks/use-percentage-grid';
import { useGridLayout } from './_hooks/use-grid-layout';
import { PercentageGrid } from './_components/percentage-grid';
import { FdpPanel } from './_components/fdp-panel';
import { useUrlState } from '@/lib/hooks/use-url-state';
import { percentageGridURLSerializer, PercentageGridURLState } from './_lib/url-state';

import { createPortal } from "react-dom";
import { ChevronDown, Grid3X3 } from "lucide-react";
import { GRID_MODES } from './constants';

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
        gridMode,
        setGridMode,
        cols,
        rows,
        totalCells,
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

    // Layout Logic (Responsive Sizing)
    const containerRef = React.useRef<HTMLDivElement>(null);
    const gridDimensions = useGridLayout({
        containerRef,
        rows,
        cols
    });

    const [activeDropdown, setActiveDropdown] = React.useState<'gridMode' | null>(null);
    const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number } | null>(null);
    const gridModeRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (activeDropdown === 'gridMode' && gridModeRef.current) {
            const rect = gridModeRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4,
                left: rect.left,
            });
        }
    }, [activeDropdown]);

    const { copyShareableUrl } = useUrlState(percentageGridURLSerializer, {
        onRestore: (state) => {
            setGridMode(state.gridMode);
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
            gridMode,
            selectedIndices: Array.from(selectedIndices).sort((a, b) => a - b),
            showPanel,
            showPercentage,
            showDecimal,
            showFraction,
            simplifyFraction,
        };
        await copyShareableUrl(state);
    }, [copyShareableUrl, gridMode, selectedIndices, showPanel, showPercentage, showDecimal, showFraction, simplifyFraction]);

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

                    {/* Grid Mode Dropdown */}
                    <div className="relative" ref={gridModeRef}>
                        <ToolbarButton
                            icon={<Grid3X3 size={18} />}
                            rightIcon={<ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" />}
                            label={GRID_MODES.find(m => m.id === gridMode)?.label.split(' (')[0] ?? 'Grid'}
                            onClick={() => setActiveDropdown(activeDropdown === 'gridMode' ? null : 'gridMode')}
                            title="Change grid configuration"
                        />
                    </div>
                    {activeDropdown === 'gridMode' && dropdownPos && typeof document !== 'undefined' && createPortal(
                        <>
                            <div
                                className="fixed inset-0 z-[100]"
                                onClick={() => setActiveDropdown(null)}
                            />
                            <div
                                className="fixed z-[101] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg min-w-[180px]"
                                style={{
                                    top: dropdownPos.top,
                                    left: dropdownPos.left,
                                }}
                            >
                                {GRID_MODES.map((mode, index) => (
                                    <button
                                        key={mode.id}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between
                                            ${index === 0 ? 'rounded-t-lg' : ''}
                                            ${index === GRID_MODES.length - 1 ? 'rounded-b-lg' : ''}
                                            ${gridMode === mode.id ? 'font-semibold text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-700/50' : ''}
                                        `}
                                        onClick={() => {
                                            setGridMode(mode.id);
                                            setActiveDropdown(null);
                                        }}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </>,
                        document.body
                    )}

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
                <div ref={containerRef} className="relative flex h-full w-full items-center justify-center p-6 py-12 overflow-hidden">
                    {gridDimensions && (
                        <div
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center"
                            style={{
                                width: gridDimensions.width,
                                height: gridDimensions.height,
                            }}
                        >
                            <PercentageGrid
                                selectedIndices={selectedIndices}
                                dragPreviewBounds={dragPreviewBounds}
                                isDragging={isDragging}
                                rows={rows}
                                cols={cols}
                                totalCells={totalCells}
                                onToggle={toggleSquare}
                                onDragStart={startDrag}
                                onDragEnter={dragEnter}
                                onDragEnd={endDrag}
                            />
                        </div>
                    )}
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
