"use client"

import { useState, useCallback } from "react"
import { useHistory } from "@/lib/hooks/use-history"
import { Position } from "@/types/manipulatives"
import { TILE_TYPES } from "../constants"
import { groupTilesLogic, simplifyTilesLogic, parseExpression, getRotatedType } from "./algebra-logic"
import { createId } from "@/lib/id"
import { selectIdsByRect } from "@/lib/selection"

export interface TileData {
    id: string
    type: string
    value: number
    x: number
    y: number
}

export function useAlgebraTiles() {
    // History manages the tiles array
    const {
        state: tiles,
        pushState: setTiles,
        updateState: updateTilesCurrent,
        undo,
        redo,
        canUndo,
        canRedo,
        beginTransaction,
        commitTransaction,
        cancelTransaction
    } = useHistory<TileData[]>([])

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const handleDragStart = useCallback(() => {
        beginTransaction();
    }, [beginTransaction]);

    const addTile = useCallback((type: string, value: number, x: number = 100, y: number = 100) => {
        // Add slight random offset so they don't stack perfectly
        const offset = Math.random() * 20;
        const newTile: TileData = {
            id: createId('tile'),
            type,
            value,
            x: x + offset,
            y: y + offset
        };
        setTiles([...tiles, newTile]);
    }, [tiles, setTiles]);

    const removeTiles = useCallback((ids: string[]) => {
        const idSet = new Set(ids);
        setTiles(tiles.filter(t => !idSet.has(t.id)));
        setSelectedIds(prev => {
            const next = new Set(prev);
            ids.forEach(id => next.delete(id));
            return next;
        });
    }, [tiles, setTiles]);

    const updateTilePosition = useCallback((id: string, newPos: Position) => {
        // Update without history, then commit the drag transaction
        updateTilesCurrent(prev => prev.map(t => t.id === id ? { ...t, ...newPos } : t));
        commitTransaction();
    }, [updateTilesCurrent, commitTransaction]);

    const handleDragMove = useCallback((id: string, delta: Position) => {
        // If draggable is selected, move ALL selected tiles.
        // If not selected, move just it.
        const isSelected = selectedIds.has(id);
        const idsToMove = isSelected ? selectedIds : new Set([id]);

        const newTiles = tiles.map(t => {
            if (idsToMove.has(t.id)) {
                return { ...t, x: t.x + delta.x, y: t.y + delta.y };
            }
            return t;
        });

        // Use updateState to avoid polluting history with every pixel move
        updateTilesCurrent(newTiles);
    }, [tiles, selectedIds, updateTilesCurrent]);

    const handleSelect = useCallback((id: string, multi: boolean) => {
        if (multi) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
        } else {
            if (!selectedIds.has(id)) {
                setSelectedIds(new Set([id]));
            }
        }
    }, [selectedIds]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const clearAll = useCallback(() => {
        setTiles([]);
        setSelectedIds(new Set());
    }, [setTiles]);

    const groupTiles = useCallback(() => {
        setTiles(groupTilesLogic(tiles));
    }, [tiles, setTiles]);

    const simplifyTiles = useCallback(() => {
        setTiles(simplifyTilesLogic(tiles));
    }, [tiles, setTiles]);

    const visualizeEquation = useCallback((equationInput: string) => {
        if (!equationInput.trim()) return;

        const parts = equationInput.split('=');
        const isEq = parts.length > 1;

        // Use generic workspace parsing
        const leftTerms = parseExpression(parts[0]);
        const rightTerms = isEq ? parseExpression(parts[1]) : { x2: [], y2: [], xy: [], x: [], y: [], 1: [] };

        const newTiles: TileData[] = [];

        // Find maxY of current tiles to stack below existing tiles
        const maxY = tiles.length > 0 ? Math.max(...tiles.map(t => t.y + (TILE_TYPES[t.type]?.height || 50))) : 0;
        const startY = tiles.length > 0 ? maxY + 20 : 60;

        // Helper to generate tiles for a side
        const generateForSide = (terms: Record<string, number[]>, side: 'left' | 'right', baseX: number) => {
            let currentY = startY;
            let currentX = baseX;
            const spacing = 10;
            const maxRowWidth = 300;

            ['x2', 'y2', 'xy', 'x', 'y', '1'].forEach(type => {
                const values = terms[type];
                if (!values || values.length === 0) return;
                const def = TILE_TYPES[type];

                values.forEach((val: number, i: number) => {
                    newTiles.push({
                        // Append timestamp or random to ensure unique ID 
                        id: createId(`tile-${side}-${type}-${i}`),
                        type,
                        value: val,
                        x: currentX,
                        y: currentY
                    });

                    currentX += def.width + spacing;
                    if (currentX > baseX + maxRowWidth) {
                        currentX = baseX;
                        currentY += def.height + spacing;
                    }
                });

                if (currentX !== baseX) {
                    currentX = baseX;
                    currentY += def.height + spacing;
                }
            });
        };

        generateForSide(leftTerms, 'left', 50);
        if (isEq) generateForSide(rightTerms, 'right', 500);

        setTiles([...tiles, ...newTiles]);
        setSelectedIds(new Set());
    }, [tiles, setTiles]);

    const handleMarqueeSelect = useCallback((rect: DOMRect) => {
        const selection = selectIdsByRect(
            tiles,
            rect,
            (tile) => {
                const def = TILE_TYPES[tile.type] || TILE_TYPES['1'];
                return {
                    left: tile.x,
                    top: tile.y,
                    right: tile.x + def.width,
                    bottom: tile.y + def.height
                };
            },
            (tile) => tile.id
        );
        setSelectedIds(new Set(selection as Set<string>));
    }, [tiles]);

    const rotateTiles = useCallback((ids: string[]) => {
        const idSet = new Set(ids);
        setTiles((currentTiles) => currentTiles.map(t => {
            if (idSet.has(t.id)) {
                return { ...t, type: getRotatedType(t.type) };
            }
            return t;
        }));
    }, [setTiles]);

    const flipTiles = useCallback((ids: string[]) => {
        const idSet = new Set(ids);
        setTiles((currentTiles) => currentTiles.map(t => {
            if (idSet.has(t.id)) {
                return { ...t, value: t.value * -1 };
            }
            return t;
        }));
    }, [setTiles]);

    const safeUndo = useCallback(() => {
        if (canUndo) {
            undo();
            setSelectedIds(new Set());
            cancelTransaction();
        }
    }, [canUndo, undo, cancelTransaction]);

    /**
     * Set tiles directly from external state (e.g., URL restoration).
     * Clears any existing history.
     */
    const setTilesFromState = useCallback((newTiles: TileData[]) => {
        setTiles(newTiles);
        setSelectedIds(new Set());
    }, [setTiles]);

    return {
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
        rotateTile: (id: string) => rotateTiles([id]), // Backward compat for single click
        flipTile: (id: string) => flipTiles([id]),     // Backward compat
        rotateTiles,
        flipTiles,
        undo: safeUndo,
        redo,
        canUndo,
        canRedo,
        setTilesFromState
    };
}
