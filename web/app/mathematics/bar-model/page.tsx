"use client"

/**
 * Bar Model Tool Page
 *
 * A mathematics tool for creating and manipulating bar models
 * to visualize relationships, with support for splitting bars
 * into halves and thirds.
 */

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Trash2 } from 'lucide-react';

import { SetPageTitle } from '@/components/set-page-title';
import { HelpModal } from '@/components/tool-ui/help-modal';
import { HelpButton } from '@/components/tool-ui/help-button';
import { Canvas } from '@/components/tool-ui/canvas';
import { cn } from '@/lib/utils';
import { useUrlState } from '@/lib/hooks/use-url-state';
import { useCanvasDrop } from '@/lib/hooks/use-canvas-drop';

import { useBarModel } from './_hooks/use-bar-model';
import { Bar } from './_components/bar';
import { BarModelSidebar, BarDragData } from './_components/bar-model-sidebar';
import { BarModelToolbar } from './_components/bar-model-toolbar';
import { GRID_SIZE } from './constants';
import { barModelURLSerializer, BarModelURLState } from './_lib/url-state';
import helpContent from './HELP.md';
import { exportCanvasContent } from '@/lib/export/canvas-export';
import { ExportModal } from '@/components/tool-ui/export-modal';

// =============================================================================
// Loading Fallback
// =============================================================================

function BarModelPageLoading() {
    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden items-center justify-center">
            <div className="animate-pulse text-slate-400 dark:text-slate-500">Loading...</div>
        </div>
    );
}

// =============================================================================
// Main Page Component
// =============================================================================

// Imports
import { ResolutionGuard } from "@/components/tool-ui/resolution-guard";

export default function BarModelPage() {
    return (
        <Suspense fallback={<BarModelPageLoading />}>
            <ResolutionGuard>
                <BarModelPageContent />
            </ResolutionGuard>
        </Suspense>
    );
}

// =============================================================================
// Page Content
// =============================================================================

function BarModelPageContent() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const trashRef = useRef<HTMLDivElement>(null);

    // Bar model state
    const {
        bars,
        selectedIds,
        addBar,
        deleteSelected,
        updateBarLabel,
        resizeBar,
        selectBar,
        selectInRect,
        clearSelection,
        cloneSelectedRight,
        cloneSelectedLeft,
        cloneSelectedDown,
        cloneSelectedUp,
        joinSelected,
        splitSelected,
        applyQuickLabel,
        toggleTotal,
        toggleRelativeLabel,
        setDisplayFormat,
        setColorIndex,
        undo,
        canUndo,
        clearAll,
        initFromState,
        dragStart,
        dragMove,
        dragEnd,
    } = useBarModel();

    // Derived state
    const totalBar = bars.find(b => b.isTotal);

    // Validation Logic
    const selectedBars = bars.filter(b => selectedIds.has(b.id));
    const hasTotalSelected = selectedBars.some(b => b.isTotal);
    const selectedCount = selectedIds.size;

    const canSplit = {
        half: selectedCount > 0 && !hasTotalSelected && selectedBars.every(b => (b.width / GRID_SIZE) % 2 === 0),
        third: selectedCount > 0 && !hasTotalSelected && selectedBars.every(b => (b.width / GRID_SIZE) % 3 === 0),
        fifth: selectedCount > 0 && !hasTotalSelected && selectedBars.every(b => (b.width / GRID_SIZE) % 5 === 0),
    };

    const canToggleRelative = selectedCount > 0;

    // Check if any selected bar has relative label enabled
    const hasRelativeSelected = selectedBars.some(b => b.showRelativeLabel);

    const commonDisplayFormat = selectedBars.length > 0 && selectedBars.every(b => b.displayFormat === selectedBars[0].displayFormat)
        ? selectedBars[0].displayFormat
        : undefined;

    const commonColorIndex = selectedBars.length > 0 && selectedBars.every(b => b.colorIndex === selectedBars[0].colorIndex)
        ? selectedBars[0].colorIndex
        : undefined;

    // Local UI State
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [isOverTrash, setIsOverTrash] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Drag tracking (mutable ref for performance)
    // For multi-select drag, we track the initial positions and the start click position
    const dragRef = useRef<{
        startX: number;
        startY: number;
        lastX: number;
        lastY: number;
        hasStarted: boolean;
    } | null>(null);

    const { hasRestored, getShareableUrl, copyShareableUrl } = useUrlState(barModelURLSerializer, {
        onRestore: (state) => {
            if (state && state.bars.length > 0) {
                initFromState(state.bars);
            }
        }
    });

    // Update URL when state changes
    useEffect(() => {
        if (!hasRestored) return;

        if (bars.length === 0) {
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, '', url.toString());
        } else {
            const state: BarModelURLState = { bars };
            const url = getShareableUrl(state);
            window.history.replaceState({}, '', url);
        }
    }, [bars, hasRestored, getShareableUrl]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
                e.preventDefault();
                deleteSelected();
            }

            if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                undo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, deleteSelected, undo]);

    // =========================================================================
    // Bar Dragging - handled at document level for smooth dragging
    // =========================================================================

    // Handle bar drag start (called from Bar component)
    const handleBarDragStart = useCallback((id: string, e: React.PointerEvent) => {
        // Capture pointer on the target element
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setDraggingId(id);

        // For delta-based movement tracking
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            lastX: e.clientX,
            lastY: e.clientY,
            hasStarted: false,
        };
    }, []);

    // Document-level pointer move handler for bar dragging
    useEffect(() => {
        if (!draggingId) return;

        const handlePointerMove = (e: PointerEvent) => {
            if (!dragRef.current) return;

            // Update simple lastX/Y for tracking delta
            const deltaX = e.clientX - dragRef.current.lastX;
            const deltaY = e.clientY - dragRef.current.lastY;
            dragRef.current.lastX = e.clientX;
            dragRef.current.lastY = e.clientY;

            // Move all selected bars together
            if (draggingId) {
                // If we haven't started a history/drag op yet, check threshold
                if (!dragRef.current.hasStarted) {
                    const dist = Math.hypot(
                        e.clientX - dragRef.current.startX,
                        e.clientY - dragRef.current.startY
                    );

                    if (dist > 3) {
                        // Threshold crossed - start drag
                        dragStart(); // Checkpoint history
                        dragRef.current.hasStarted = true;

                        // Apply the initial movement (from start to now)
                        // This prevents "jump" where we lose the first 3px
                        const totalDx = e.clientX - dragRef.current.startX;
                        const totalDy = e.clientY - dragRef.current.startY;
                        dragMove(totalDx, totalDy);
                    }
                } else {
                    // Already inside a drag op, just apply incremental delta
                    dragMove(deltaX, deltaY);
                }
            }

            // Check trash hover
            if (trashRef.current) {
                const tr = trashRef.current.getBoundingClientRect();
                const isOver = e.clientX >= tr.left && e.clientX <= tr.right &&
                    e.clientY >= tr.top && e.clientY <= tr.bottom;
                setIsOverTrash(isOver);
            }
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (dragRef.current) {
                // If we started a drag op, finish it (snap)
                if (dragRef.current.hasStarted) {
                    dragEnd();
                }
                // If NOT started (moved < 3px), treat as click
                else if (draggingId && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                    selectBar(draggingId, false);
                }

                if (isOverTrash && draggingId) {
                    // Delete all selected bars when dropped on trash
                    deleteSelected();
                }
                setDraggingId(null);
                setIsOverTrash(false);
                dragRef.current = null;
            }
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointercancel', handlePointerUp);

        return () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
            document.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [draggingId, isOverTrash, deleteSelected, selectBar, dragStart, dragMove, dragEnd]);

    // =========================================================================
    // Drop Handlers
    // =========================================================================

    // Handle drop from sidebar (HTML5 drag and drop)
    const { handleDrop, handleDragOver } = useCanvasDrop<BarDragData>({
        canvasRef,
        onDropData: (data, position) => {
            if (data.type !== 'bar') return;
            addBar(position.x, position.y, data.colorIndex, data.label);
        }
    });

    // =========================================================================
    // Selection Handlers
    // =========================================================================

    // Handle marquee selection end from Canvas component
    const handleSelectionEnd = useCallback((rect: DOMRect) => {
        selectInRect(rect);
    }, [selectInRect]);

    // Clear selection when clicking canvas background (not on a bar)
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        // Only clear if clicking directly on canvas, not on children
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.testid === 'bar-model-canvas') {
            clearSelection();
        }
    }, [clearSelection]);

    // Copy link to clipboard
    const handleCopyLink = useCallback(() => {
        const state: BarModelURLState = { bars };
        copyShareableUrl(state);
    }, [bars, copyShareableUrl]);

    // Clear all
    const handleClear = useCallback(() => {
        clearAll();
    }, [clearAll]);

    // Handle Export
    const handleExport = useCallback(async (format: 'png' | 'svg') => {
        if (!canvasRef.current) return;

        const barElements = Array.from(
            canvasRef.current.querySelectorAll('[data-testid^="bar-"]')
        ) as HTMLElement[];

        // If no bars, fallback to exporting the whole canvas (which will show "Drag bars here" text)
        // or just return. Let's return for now as "content only" implies content.
        if (barElements.length === 0) return;

        await exportCanvasContent({
            elements: barElements,
            format,
            filename: 'bar-model',
            backgroundColor: 'transparent',
            padding: 20
        });
        setIsExportOpen(false);
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <SetPageTitle title="Bar Model Tool" />

            {/* Toolbar - inline, matching counters page pattern */}
            <BarModelToolbar
                selectedCount={selectedIds.size}
                canUndo={canUndo}
                onJoin={joinSelected}
                onSplitHalf={() => splitSelected(2)}
                onSplitThird={() => splitSelected(3)}
                onSplitFifth={() => splitSelected(5)}
                onCloneRight={cloneSelectedRight}
                onCloneLeft={cloneSelectedLeft}
                onCloneDown={cloneSelectedDown}
                onCloneUp={cloneSelectedUp}
                onQuickLabel={applyQuickLabel}
                onToggleTotal={toggleTotal}
                onToggleRelative={toggleRelativeLabel}
                canToggleRelative={canToggleRelative}
                displayFormat={commonDisplayFormat}
                onSetDisplayFormat={setDisplayFormat}
                currentColorIndex={commonColorIndex}
                onSetColorIndex={setColorIndex}
                canSetDisplayFormat={hasRelativeSelected}
                canSplit={canSplit}
                onClear={handleClear}
                onUndo={undo}
                onCopyLink={handleCopyLink}
                onExport={() => setIsExportOpen(true)}
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <BarModelSidebar />

                {/* Main Canvas - let Canvas handle marquee selection internally */}
                <Canvas
                    ref={canvasRef}
                    gridSize={GRID_SIZE}
                    data-testid="bar-model-canvas"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onSelectionEnd={handleSelectionEnd}
                    onClick={handleCanvasClick}
                >
                    {/* Bars */}
                    {bars.map((bar) => (
                        <Bar
                            key={bar.id}
                            bar={bar}
                            totalBar={totalBar}
                            isSelected={selectedIds.has(bar.id)}
                            isDragging={draggingId === bar.id}
                            onSelect={selectBar}
                            onDragStart={handleBarDragStart}
                            onResize={resizeBar}
                            onLabelChange={updateBarLabel}
                        />
                    ))}

                    {/* Trash Drop Zone */}
                    <div
                        ref={trashRef}
                        className={cn(
                            "absolute bottom-6 right-6 p-4 rounded-full transition-all duration-200 z-40",
                            "flex items-center justify-center",
                            isOverTrash
                                ? "bg-red-100 text-red-600 scale-110 border-2 border-red-500 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-white text-slate-400 border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700"
                        )}
                    >
                        <Trash2 size={24} />
                    </div>

                    {/* Empty State */}
                    {bars.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                            <div className="text-center">
                                <p className="text-xl font-medium text-slate-400 dark:text-slate-600">
                                    Drag bars here to start
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Help Button */}
                    <HelpButton onClick={() => setIsHelpOpen(true)} />
                </Canvas>
            </div>

            {/* Help Modal */}
            {isHelpOpen && (
                <HelpModal
                    onClose={() => setIsHelpOpen(false)}
                    content={helpContent}
                />
            )}

            {/* Export Modal */}
            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                onExport={handleExport}
                title="Export Bar Model"
            />
        </div>
    );
}
