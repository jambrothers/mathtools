"use client"

import { useState, useRef, useEffect } from "react"
import { useAlgebraTiles } from "./_hooks/use-algebra-tiles"
import { AlgebraTile } from "./_components/algebra-tile"
import { AlgebraToolbar } from "./_components/algebra-toolbar"
import { TileSidebar } from "./_components/sidebar"
import { Canvas } from '@/components/tool-ui/canvas';
import { TrashZone } from '@/components/tool-ui/trash-zone';
import { SetPageTitle } from "@/components/set-page-title"
import { Position } from "@/types/manipulatives"

export default function AlgebraTilesPage() {
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
        canUndo
    } = useAlgebraTiles()

    const [showLabels, setShowLabels] = useState(true)
    const [showY, setShowY] = useState(false)
    const [snapToGrid, setSnapToGrid] = useState(false)
    const [isTrashHovered, setIsTrashHovered] = useState(false)

    const trashRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLDivElement>(null)

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

    const handleDragEnd = (id: string, pos: Position) => {
        // Check trash collision
        if (trashRef.current) {
            const trashRect = trashRef.current.getBoundingClientRect()
            // We use global mouse coordinates usually, but position is relative to parent (canvas)
            // Ideally useDraggable would give us the mouse event or global coordinates. 
            // BUT useDraggable updates 'position' state which is relative. 
            // Collision detection here is tricky without the event.
            // Let's assume we can get clientX/Y from somewhere or check bounds relative to canvas if Trash is in canvas.

            // Actually, let's fix this properly. 
            // The Tile is absolutely positioned in the Canvas. 
            // The Trash is absolutely positioned in the Canvas (bottom right).
            // We can check intersection of the Tile Rect and Trash Rect.

            // Simple approach: Check if tile position is near bottom right?
            // Better: Get the DOM element of the tile? No, ref is hard with list.

            // Alternative: useDraggable could return the LAST MOUSE EVENT.
            // Or we check standard "drop over" logic.
        }

        // For now, let's implement basic "if y is large and x is large" loose check or relying on a layout assumption
        // Since Trash is absolute bottom right.
        if (canvasRef.current && trashRef.current) {
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const trashRect = trashRef.current.getBoundingClientRect();

            // Convert trash rect to canvas coordinates
            const trashL = trashRect.left - canvasRect.left;
            const trashT = trashRect.top - canvasRect.top;

            // Tile position (top-left)
            // We should probably check if the *mouse* was over the trash, but we only have tile position here.
            // Let's check if the tile center is inside the trash zone.
            const tileCenterX = pos.x + 25; // approx
            const tileCenterY = pos.y + 25;

            if (tileCenterX > trashL && tileCenterY > trashT) {
                const idsToDelete = selectedIds.has(id) ? Array.from(selectedIds) : [id];
                removeTiles(idsToDelete);
                return;
                // Don't update position if deleted
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
                hasSelection={selectedIds.size > 0}
                onDeleteSelected={() => removeTiles(Array.from(selectedIds))}
            />

            <div className="flex flex-1 overflow-hidden relative">
                <TileSidebar onAddTile={addTile} showY={showY} />

                <Canvas
                    ref={canvasRef}
                    gridSize={snapToGrid ? 50 : undefined}
                    className="relative"
                    onClick={clearSelection}
                    onSelectionEnd={handleMarqueeSelect}
                >
                    {tiles.map(tile => (
                        <AlgebraTile
                            key={tile.id}
                            {...tile}
                            isSelected={selectedIds.has(tile.id)}
                            showLabels={showLabels}
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
            </div>
        </div>
    )
}
