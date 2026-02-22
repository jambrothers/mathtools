"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ToolScaffold } from '@/components/tool-ui/tool-scaffold';
import { AreaModelToolbar } from './_components/area-model-toolbar';
import { AreaModelCanvas } from './_components/area-model-canvas';
import { useAreaModel } from './_hooks/use-area-model';
import { areaModelURLSerializer } from './_lib/url-state';
import { generateShareableURL, copyURLToClipboard } from '@/lib/url-state';
import { Toast } from '@/components/tool-ui/toast';
import { ExportModal } from '@/components/tool-ui/export-modal';
import { exportSVGElement } from '@/lib/export/canvas-export';
import helpContent from './HELP.md';

function AreaModelPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const svgRef = useRef<SVGSVGElement>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const {
        model,
        products,
        total,
        factorA,
        factorB,
        setFactorA,
        setFactorB,
        autoPartition,
        setAutoPartition,
        showFactorLabels,
        showPartialProducts,
        showTotal,
        showGridLines,
        showArray,
        toggleFactorLabels,
        togglePartialProducts,
        toggleTotal,
        toggleGridLines,
        toggleArray,
        revealedCells,
        revealCell,
        revealAll,
        hideAll,
        visualise,
        clear,
        incrementFactorA,
        decrementFactorA,
        incrementFactorB,
        decrementFactorB,
        isAlgebraic
    } = useAreaModel();

    // Sync URL state when state change
    const updateURL = useCallback(() => {
        const params = areaModelURLSerializer.serialize({
            factorA,
            factorB,
            autoPartition,
            showFactorLabels,
            showPartialProducts,
            showTotal,
            showGridLines,
            showArray,
            revealedCells
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [factorA, factorB, autoPartition, showFactorLabels, showPartialProducts, showTotal, showGridLines, showArray, revealedCells, router, pathname]);

    // Initial Load from URL
    useEffect(() => {
        const initialState = areaModelURLSerializer.deserialize(searchParams);
        if (initialState) {
            if (initialState.factorA) setFactorA(initialState.factorA);
            if (initialState.factorB) setFactorB(initialState.factorB);
            setAutoPartition(initialState.autoPartition);
        }
    }, [searchParams, setFactorA, setFactorB, setAutoPartition]);

    // Trigger initial visualise once factors are set from URL
    const initialVisualiseDone = useRef(false);
    useEffect(() => {
        if (!initialVisualiseDone.current && (factorA || factorB)) {
            visualise();
            initialVisualiseDone.current = true;
        }
    }, [factorA, factorB, visualise]);

    // Optionally update URL on important changes
    useEffect(() => {
        if (initialVisualiseDone.current) {
            updateURL();
        }
    }, [showFactorLabels, showPartialProducts, showTotal, showGridLines, showArray, revealedCells, updateURL]);

    const handleGenerateLink = () => {
        const url = generateShareableURL(areaModelURLSerializer, {
            factorA,
            factorB,
            autoPartition,
            showFactorLabels,
            showPartialProducts,
            showTotal,
            showGridLines,
            showArray,
            revealedCells
        });
        copyURLToClipboard(url).then(success => {
            if (success) {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        });
    };

    const handleExport = async (format: 'png' | 'svg') => {
        if (!svgRef.current) return;

        await exportSVGElement(svgRef.current, {
            format,
            filename: 'area-model',
            backgroundColor: 'transparent'
        });
        setIsExportModalOpen(false);
    };

    return (
        <ToolScaffold
            useInteractiveLayout={true}
            helpContent={helpContent}
            toolbarOverlay={
                <AreaModelToolbar
                    factorA={factorA}
                    factorB={factorB}
                    onFactorAChange={setFactorA}
                    onFactorBChange={setFactorB}
                    onIncrementA={incrementFactorA}
                    onDecrementA={decrementFactorA}
                    onIncrementB={incrementFactorB}
                    onDecrementB={decrementFactorB}
                    onVisualise={() => {
                        visualise();
                        updateURL();
                    }}
                    onClear={clear}
                    showFactorLabels={showFactorLabels}
                    showPartialProducts={showPartialProducts}
                    showTotal={showTotal}
                    showGridLines={showGridLines}
                    showArray={showArray}
                    onToggleFactorLabels={toggleFactorLabels}
                    onTogglePartialProducts={togglePartialProducts}
                    onToggleTotal={toggleTotal}
                    onToggleGridLines={toggleGridLines}
                    onToggleArray={toggleArray}
                    isAlgebraic={isAlgebraic}
                    onRevealAll={revealAll}
                    onHideAll={hideAll}
                    autoPartition={autoPartition}
                    onToggleAutoPartition={() => setAutoPartition(prev => !prev)}
                    onGenerateLink={handleGenerateLink}
                    onExport={() => setIsExportModalOpen(true)}
                />
            }
        >
            <AreaModelCanvas
                ref={svgRef}
                model={model}
                products={products}
                total={total}
                showFactorLabels={showFactorLabels}
                showPartialProducts={showPartialProducts}
                showTotal={showTotal}
                showGridLines={showGridLines}
                showArray={showArray}
                revealedCells={revealedCells}
                onCellClick={revealCell}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExport}
                title="Export Area Model"
            />

            <Toast
                message="Link copied to clipboard"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </ToolScaffold>
    );
}

export default function AreaModelPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AreaModelPageContent />
        </Suspense>
    );
}
