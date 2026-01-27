"use client"

import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAlgebraTiles } from "./_hooks/use-algebra-tiles"
import { AlgebraTile } from "./_components/algebra-tile"
import { AlgebraToolbar } from "./_components/algebra-toolbar"
import { TileSidebar } from "./_components/sidebar"
import { Canvas } from '@/components/tool-ui/canvas';
import { TrashZone } from '@/components/tool-ui/trash-zone';
import { HelpButton } from '@/components/tool-ui/help-button';
import { HelpModal } from '@/components/tool-ui/help-modal';
import { SetPageTitle } from "@/components/set-page-title"
import { Position } from "@/types/manipulatives"
import { algebraTilesURLSerializer, AlgebraTilesURLState } from "./_lib/url-state"
import { generateShareableURL, copyURLToClipboard } from "@/lib/url-state"
import helpContent from './HELP.md';

/**
 * Loading fallback component for the algebra tiles page.
 */
function AlgebraTilesPageLoading() {
    return (
        <div className="flex flex-col flex-1 min-h-0 w-full bg-slate-50 dark:bg-slate-950 items-center justify-center">
            <div className="animate-pulse text-slate-400 dark:text-slate-500">Loading...</div>
        </div>
    );
}

import { ResolutionGuard } from "@/components/tool-ui/resolution-guard";

/**
 * Main page component wrapped in Suspense for useSearchParams compatibility.
 */
export default function AlgebraTilesPage() {
    return (
        <Suspense fallback={<AlgebraTilesPageLoading />}>
            <ResolutionGuard>
                <AlgebraTilesPageContent />
            </ResolutionGuard>
        </Suspense>
    );
}

/**
 * Inner content component that uses useSearchParams.
 */
function AlgebraTilesPageContent() {
    const {
        tiles,
        selectedIds,
        addTile,
        removeTiles,
        updateTilePosition,
        handleDragMove,
        handleDragStart,
        handleSelect,
        clearSelection,
        clearAll,
        groupTiles,
        simplifyTiles,
        visualizeEquation,
        handleMarqueeSelect,
        rotateTile,
        flipTile,
        rotateTiles,
        flipTiles,
        undo,
        canUndo,
        setTilesFromState
    } = useAlgebraTiles()

    const searchParams = useSearchParams()
    const [showLabels, setShowLabels] = useState(true)
    const [showY, setShowY] = useState(false)
    const [snapToGrid, setSnapToGrid] = useState(false)
    const [isTrashHovered] = useState(false)
    const [hasInitialized, setHasInitialized] = useState(false)
    const [showHelp, setShowHelp] = useState(false)

    const trashRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLDivElement>(null)

    // Initialize from URL on mount
    useEffect(() => {
        if (hasInitialized) return;

        const state = algebraTilesURLSerializer.deserialize(searchParams);
        if (state) {
            setTilesFromState(state.tiles);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowLabels(state.showLabels);
            setShowY(state.showY);
            setSnapToGrid(state.snapToGrid);
        }
        setHasInitialized(true);
    }, [searchParams, hasInitialized, setTilesFromState]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedIds.size > 0) {
                    removeTiles(Array.from(selectedIds));
                }
            } else if (e.key.toLowerCase() === 'r') {
                if (selectedIds.size > 0) rotateTiles(Array.from(selectedIds));
            } else if (e.key.toLowerCase() === 'f') {
                if (selectedIds.size > 0) flipTiles(Array.from(selectedIds));
            } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault(); // Prevent browser undo
                if (e.shiftKey) {
                    // Optional: Redo if exposed by hook
                } else {
                    if (canUndo) undo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, removeTiles, rotateTiles, flipTiles, undo, canUndo]);

    /**
     * Generate a shareable URL with the current state and copy to clipboard.
     */
    const handleGenerateLink = useCallback(async () => {
        const state: AlgebraTilesURLState = {
            tiles,
            showLabels,
            showY,
            snapToGrid
        };
        const url = generateShareableURL(algebraTilesURLSerializer, state);
        await copyURLToClipboard(url);
        // TODO: Could add a toast notification here to confirm copy
    }, [tiles, showLabels, showY, snapToGrid]);

    /**
     * Handle tiles dropped from the sidebar onto the canvas.
     */
    const handleDropOnCanvas = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const { type, value } = JSON.parse(data);
            if (!canvasRef.current) return;

            const canvasRect = canvasRef.current.getBoundingClientRect();
            let x = e.clientX - canvasRect.left;
            let y = e.clientY - canvasRect.top;

            // Snap to grid if enabled
            if (snapToGrid) {
                x = Math.round(x / 50) * 50;
                y = Math.round(y / 50) * 50;
            }

            addTile(type, value, x, y);
        } catch {
            // Invalid JSON, ignore
        }
    }, [addTile, snapToGrid]);

    /**
     * Handle touch-drop from sidebar (custom event for touch/pen devices).
     */
    const handleTouchDrop = useCallback((e: Event) => {
        const customEvent = e as CustomEvent<{ dragData: { type: string; value: number }; clientX: number; clientY: number }>;
        const { dragData, clientX, clientY } = customEvent.detail;

        if (!canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        let x = clientX - canvasRect.left;
        let y = clientY - canvasRect.top;

        if (snapToGrid) {
            x = Math.round(x / 50) * 50;
            y = Math.round(y / 50) * 50;
        }

        addTile(dragData.type, dragData.value, x, y);
    }, [addTile, snapToGrid]);

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

    const handleDragEnd = (id: string, pos: Position) => {
        // Check trash collision
        if (canvasRef.current && trashRef.current) {
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const trashRect = trashRef.current.getBoundingClientRect();

            // Convert trash rect to canvas coordinates
            const trashL = trashRect.left - canvasRect.left;
            const trashT = trashRect.top - canvasRect.top;

            // Tile position (top-left)
            // Check if the tile center is inside the trash zone.
            const tileCenterX = pos.x + 25; // approx
            const tileCenterY = pos.y + 25;

            if (tileCenterX > trashL && tileCenterY > trashT) {
                const idsToDelete = (selectedIds.has(id) ? Array.from(selectedIds) : [id]) as string[];
                removeTiles(idsToDelete);
                return;
            }
        }

        updateTilePosition(id, pos);
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full">
            <SetPageTitle title="Algebra Tiles" />

            <AlgebraToolbar
                showLabels={showLabels} setShowLabels={setShowLabels}
                showY={showY} setShowY={setShowY}
                snapToGrid={snapToGrid} setSnapToGrid={setSnapToGrid}
                onUndo={undo} canUndo={canUndo}
                onClear={clearAll}
                onGroup={groupTiles}
                onSimplify={simplifyTiles}
                onVisualize={visualizeEquation}
                onGenerateLink={handleGenerateLink}
            />

            <div className="flex flex-1 overflow-hidden relative">
                <TileSidebar onAddTile={addTile} showY={showY} />

                <Canvas
                    ref={canvasRef}
                    gridSize={snapToGrid ? 50 : undefined}
                    className="relative"
                    onClick={clearSelection}
                    onSelectionEnd={handleMarqueeSelect}
                    onDrop={handleDropOnCanvas}
                    onDragOver={handleDragOver}
                >
                    {tiles.map(tile => (
                        <AlgebraTile
                            key={tile.id}
                            {...tile}
                            isSelected={selectedIds.has(tile.id)}
                            showLabels={showLabels}
                            snapGridSize={snapToGrid ? 50 : undefined}
                            onDragStart={handleDragStart}
                            onDragMove={(id, pos, delta) => handleDragMove(id, delta)}
                            onDragEnd={handleDragEnd}
                            onSelect={handleSelect}
                            onFlip={flipTile}
                            onRotate={rotateTile}
                        />
                    ))}

                    <TrashZone ref={trashRef} isHovered={isTrashHovered} />
                    <HelpButton onClick={() => setShowHelp(true)} />
                </Canvas>
            </div>

            {/* Help Modal */}
            {showHelp && (
                <HelpModal content={helpContent} onClose={() => setShowHelp(false)} />
            )}
        </div>
    )
}
