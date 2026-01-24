"use client"

/**
 * Bar Model Tool Page
 *
 * A mathematics tool for creating and manipulating bar models
 * to visualize relationships, with support for splitting bars
 * into halves and thirds.
 */

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SetPageTitle } from '@/components/set-page-title';

import { Canvas } from '@/components/tool-ui/canvas';
import { TrashZone } from '@/components/tool-ui/trash-zone';
import { HelpButton } from '@/components/tool-ui/help-button';
import { HelpModal } from '@/components/tool-ui/help-modal';

import { useBarModel } from './_hooks/use-bar-model';
import { Bar } from './_components/bar';
import { BarModelSidebar, BarDragData } from './_components/bar-model-sidebar';
import { BarModelToolbar } from './_components/bar-model-toolbar';

import { GRID_SIZE } from './constants';
import { barModelURLSerializer, BarModelURLState } from './_lib/url-state';
import { generateShareableURL, copyURLToClipboard } from '@/lib/url-state';
import helpContent from './HELP.md';

// =============================================================================
// Loading Fallback
// =============================================================================

function BarModelPageLoading() {
    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center">
            <div className="text-slate-500 dark:text-slate-400 text-lg">Loading Bar Model Tool...</div>
        </div>
    );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function BarModelPage() {
    return (
        <Suspense fallback={<BarModelPageLoading />}>
            <BarModelPageContent />
        </Suspense>
    );
}

// =============================================================================
// Page Content
// =============================================================================

function BarModelPageContent() {
    const searchParams = useSearchParams();
    const canvasRef = useRef<HTMLDivElement>(null);
    const trashRef = useRef<HTMLDivElement>(null);

    // Bar model state
    const {
        bars,
        selectedIds,
        addBar,
        deleteBar,
        deleteSelected,
        updateBarLabel,
        moveBar,
        resizeBar,
        selectBar,
        clearSelection,
        selectInRect,
        cloneSelected,
        joinSelected,
        splitSelected,
        undo,
        canUndo,
        clearAll,
        initFromState,
    } = useBarModel();

    // Drag state
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [isOverTrash, setIsOverTrash] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Drag tracking
    const dragRef = useRef<{
        id: string;
        startX: number;
        startY: number;
        initialX: number;
        initialY: number;
    } | null>(null);

    // Initialize from URL on mount
    useEffect(() => {
        if (hasInitialized) return;

        const state = barModelURLSerializer.deserialize(searchParams);
        if (state && state.bars.length > 0) {
            initFromState(state.bars);
        }
        setHasInitialized(true);
    }, [searchParams, hasInitialized, initFromState]);

    // Update URL when state changes
    useEffect(() => {
        if (!hasInitialized) return;

        if (bars.length === 0) {
            // Clear URL params if no bars
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, '', url.toString());
        } else {
            const state: BarModelURLState = { bars };
            const url = generateShareableURL(barModelURLSerializer, state);
            window.history.replaceState({}, '', url);
        }
    }, [bars, hasInitialized]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            // Delete selected
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
                e.preventDefault();
                deleteSelected();
            }

            // Undo
            if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                undo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, deleteSelected, undo]);

    // Handle drop from sidebar (HTML5 drag and drop)
    const handleDropOnCanvas = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const dragData = JSON.parse(data) as BarDragData;
            if (dragData.type !== 'bar') return;
            if (!canvasRef.current) return;

            const canvasRect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - canvasRect.left;
            const y = e.clientY - canvasRect.top;

            addBar(x, y, dragData.colorIndex, dragData.label);
        } catch {
            // Invalid JSON, ignore
        }
    }, [addBar]);

    // Handle touch-drop from sidebar (custom event for touch/pen devices)
    const handleTouchDrop = useCallback((e: Event) => {
        const customEvent = e as CustomEvent<{ dragData: BarDragData; clientX: number; clientY: number }>;
        const { dragData, clientX, clientY } = customEvent.detail;

        if (dragData.type !== 'bar') return;
        if (!canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = clientX - canvasRect.left;
        const y = clientY - canvasRect.top;

        addBar(x, y, dragData.colorIndex, dragData.label);
    }, [addBar]);

    // Register touchdrop listener on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('touchdrop', handleTouchDrop);
        return () => canvas.removeEventListener('touchdrop', handleTouchDrop);
    }, [handleTouchDrop]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    // Handle bar drag start
    const handleBarDragStart = useCallback((id: string, e: React.PointerEvent) => {
        const bar = bars.find(b => b.id === id);
        if (!bar) return;

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setDraggingId(id);

        dragRef.current = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: bar.x,
            initialY: bar.y,
        };
    }, [bars]);

    // Canvas pointer move for dragging
    const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragRef.current) return;

        const delta = {
            x: e.clientX - dragRef.current.startX,
            y: e.clientY - dragRef.current.startY,
        };

        const newX = dragRef.current.initialX + delta.x;
        const newY = dragRef.current.initialY + delta.y;

        moveBar(dragRef.current.id, newX, newY);

        // Check if over trash
        if (trashRef.current) {
            const rect = trashRef.current.getBoundingClientRect();
            const isOver = e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom;
            setIsOverTrash(isOver);
        }
    }, [moveBar]);

    // Canvas pointer up for drag end
    const handleCanvasPointerUp = useCallback(() => {
        if (dragRef.current && isOverTrash) {
            deleteBar(dragRef.current.id);
        }

        dragRef.current = null;
        setDraggingId(null);
        setIsOverTrash(false);
    }, [deleteBar, isOverTrash]);

    // Canvas click to clear selection
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (e.target === canvasRef.current) {
            clearSelection();
        }
    }, [clearSelection]);

    // Marquee selection
    const handleSelectionEnd = useCallback((rect: DOMRect) => {
        selectInRect(rect);
    }, [selectInRect]);

    // Copy link to clipboard
    const handleCopyLink = useCallback(() => {
        const state: BarModelURLState = { bars };
        const url = generateShareableURL(barModelURLSerializer, state);
        copyURLToClipboard(url);
    }, [bars]);

    // Clear all with confirmation
    const handleClearAll = useCallback(() => {
        if (bars.length === 0 || window.confirm('Clear all bars?')) {
            clearAll();
        }
    }, [bars.length, clearAll]);

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 select-none overflow-hidden">
            <SetPageTitle title="Bar Model Tool" />

            {/* Toolbar */}
            <BarModelToolbar
                selectedCount={selectedIds.size}
                canUndo={canUndo}
                onJoin={joinSelected}
                onSplitHalf={() => splitSelected(2)}
                onSplitThird={() => splitSelected(3)}
                onClone={cloneSelected}
                onDeleteSelected={deleteSelected}
                onClearAll={handleClearAll}
                onUndo={undo}
                onCopyLink={handleCopyLink}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <BarModelSidebar />

                {/* Canvas */}
                <Canvas
                    ref={canvasRef}
                    data-testid="bar-model-canvas"
                    gridSize={GRID_SIZE}
                    onSelectionEnd={handleSelectionEnd}
                    onClick={handleCanvasClick}
                    onDrop={handleDropOnCanvas}
                    onDragOver={handleDragOver}
                    onPointerMove={handleCanvasPointerMove}
                    onPointerUp={handleCanvasPointerUp}
                    onPointerLeave={handleCanvasPointerUp}
                >
                    {/* Bars */}
                    {bars.map((bar) => (
                        <Bar
                            key={bar.id}
                            bar={bar}
                            isSelected={selectedIds.has(bar.id)}
                            isDragging={draggingId === bar.id}
                            onSelect={selectBar}
                            onDragStart={handleBarDragStart}
                            onResize={resizeBar}
                            onLabelChange={updateBarLabel}
                        />
                    ))}

                    {/* Empty state */}
                    {bars.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📊</div>
                                <h3 className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                                    Drag bars here to start
                                </h3>
                            </div>
                        </div>
                    )}

                    {/* Floating buttons - bottom right */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-3 z-40">
                        <HelpButton onClick={() => setIsHelpOpen(true)} className="static" />
                        <TrashZone
                            ref={trashRef}
                            className="static"
                            isHovered={isOverTrash}
                        />
                    </div>
                </Canvas>
            </div>

            {/* Help Modal */}
            {isHelpOpen && (
                <HelpModal
                    onClose={() => setIsHelpOpen(false)}
                    content={helpContent}
                />
            )}
        </div>
    );
}
