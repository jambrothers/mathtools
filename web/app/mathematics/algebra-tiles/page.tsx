"use client"

import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { useAlgebraTiles } from "./_hooks/use-algebra-tiles"
import { AlgebraTile } from "./_components/algebra-tile"
import { AlgebraToolbar } from "./_components/algebra-toolbar"
import { TileSidebar } from "./_components/sidebar"
import { Canvas } from '@/components/tool-ui/canvas';
import { TrashZone } from '@/components/tool-ui/trash-zone';
import { SetPageTitle } from "@/components/set-page-title"
import { Position } from "@/types/manipulatives"
import { algebraTilesURLSerializer, AlgebraTilesURLState } from "./_lib/url-state"
import helpContent from './HELP.md';
import { ToolScaffold } from "@/components/tool-ui/tool-scaffold";
import { useUrlState } from "@/lib/hooks/use-url-state";
import { useCanvasDrop } from "@/lib/hooks/use-canvas-drop";

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

/**
 * Main page component wrapped in Suspense for useSearchParams compatibility.
 */
export default function AlgebraTilesPage() {
    return (
        <Suspense fallback={<AlgebraTilesPageLoading />}>
            <AlgebraTilesPageContent />
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

    const [showLabels, setShowLabels] = useState(true)
    const [showY, setShowY] = useState(false)
    const [snapToGrid, setSnapToGrid] = useState(false)
    const [isTrashHovered] = useState(false)

    const trashRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLDivElement>(null)
    const selectedIdsRef = useRef(selectedIds);

    useEffect(() => {
        selectedIdsRef.current = selectedIds;
    }, [selectedIds]);

    const { copyShareableUrl } = useUrlState(algebraTilesURLSerializer, {
        onRestore: (state) => {
            setTilesFromState(state.tiles);
            setShowLabels(state.showLabels);
            setShowY(state.showY);
            setSnapToGrid(state.snapToGrid);
        }
    });

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
        await copyShareableUrl(state);
    }, [tiles, showLabels, showY, snapToGrid, copyShareableUrl]);

    const { handleDrop, handleDragOver } = useCanvasDrop<{ type: string; value: number }>({
        canvasRef,
        gridSize: snapToGrid ? 50 : undefined,
        onDropData: (data, position) => {
            addTile(data.type, data.value, position.x, position.y);
        }
    });

    const handleDragEnd = useCallback((id: string, pos: Position) => {
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
                const currentSelectedIds = selectedIdsRef.current;
                const idsToDelete = (currentSelectedIds.has(id) ? Array.from(currentSelectedIds) : [id]) as string[];
                removeTiles(idsToDelete);
                return;
            }
        }

        updateTilePosition(id, pos);
    }, [removeTiles, updateTilePosition]);

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

                <ToolScaffold helpContent={helpContent} className="flex-1 overflow-hidden">
                    <Canvas
                        ref={canvasRef}
                        data-testid="canvas"
                        gridSize={snapToGrid ? 50 : undefined}
                        className="relative"
                        onClick={clearSelection}
                        onSelectionEnd={handleMarqueeSelect}
                        onDrop={handleDrop}
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
                    </Canvas>
                </ToolScaffold>
            </div>
        </div>
    )
}
