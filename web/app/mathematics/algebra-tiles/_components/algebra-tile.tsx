"use client"

import * as React from "react"
import { useDraggable } from "@/lib/hooks/use-draggable"
import { useClickStack } from "@/lib/hooks/use-click-stack"
import { TileBase } from "@/components/tool-ui/tile-base"
import { TILE_TYPES } from "../constants"
import { cn } from "@/lib/utils"
import { Position } from "@/types/manipulatives"

/**
 * Props for the AlgebraTile component.
 */
interface AlgebraTileProps {
    id: string
    /** The type of tile (e.g., '1', 'x', 'x2', 'y', etc.) */
    type: string
    /** The numerical value of the tile (e.g., 1, -1). Negative values have different colors. */
    value: number
    /** X position on the canvas. */
    x: number
    /** Y position on the canvas. */
    y: number
    isSelected?: boolean
    /** Whether to show text labels on the tile. */
    showLabels?: boolean
    /** Optional grid size for snap-to-grid behavior during dragging. */
    snapGridSize?: number
    // Drag handlers
    onDragStart?: (id: string, initialPos: Position) => void
    onDragMove?: (id: string, newPos: Position, delta: Position) => void
    onDragEnd?: (id: string, finalPos: Position) => void
    // Interaction handlers
    onSelect?: (id: string, multi: boolean) => void
    onFlip?: (id: string) => void
    onRotate?: (id: string) => void
}

/**
 * A specific implementation of a tile for Algebra Tiles.
 * Handles drag interactions, multi-click events (flip/rotate), and responsive styling.
 */

export const AlgebraTile = React.memo(function AlgebraTile({
    id,
    type,
    value,
    x,
    y,
    isSelected,
    showLabels,
    snapGridSize,
    onDragStart,
    onDragMove,
    onDragEnd,
    onSelect,
    onFlip,
    onRotate
}: AlgebraTileProps) {
    const { position, isDragging, handlePointerDown: handleDragStart } = useDraggable(id, { x, y }, {
        onDragStart,
        onDragMove,
        onDragEnd,
        gridSize: snapGridSize
    });

    const def = TILE_TYPES[type] || TILE_TYPES['1'];
    const isNegative = value < 0;

    // Determine visuals
    const bgColor = isNegative ? def.colorNeg : def.colorPos;
    const borderColor = isNegative ? def.borderColorNeg : def.borderColor;

    // Ensure background color applies in dark mode too by explicitly setting it for dark
    // This overrides TileBase's default dark:bg-slate-800
    // We assume the constant classes result in a utility like "bg-blue-500"
    const bgClasses = `${bgColor} dark:${bgColor}`;
    const borderClasses = `${borderColor} dark:${borderColor}`;

    // Optimization: Memoize tile-specific classes to prevent re-computation/merge on drag
    const tileClassName = React.useMemo(() => cn(
        bgClasses,
        "border-2",
        borderClasses,
        "flex items-center justify-center font-bold text-white shadow-sm"
    ), [bgClasses, borderClasses]);

    // Optimization: Memoize style object to prevent new object creation on drag
    const tileStyle = React.useMemo(() => ({
        width: def.width,
        height: def.height
    }), [def.width, def.height]);

    const handlePointerDown = (e: React.PointerEvent) => {
        // Stop bubbling so canvas doesn't clear selection when clicking a tile
        e.stopPropagation();
        onSelect?.(id, e.shiftKey || e.metaKey);
        handleDragStart(e);
    };

    // Event Priority Stack: Handles distinguishing between double and triple clicks.
    // Double click -> Flip
    // Triple click -> Rotate
    const { pushEvent } = useClickStack(
        { 'DOUBLE': 1, 'TRIPLE': 2 },
        {
            'DOUBLE': () => onFlip?.(id),
            'TRIPLE': () => onRotate?.(id)
        },
        { delay: 200 } // Window to catch triple click after double click
    );

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        pushEvent('DOUBLE');
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.detail === 3) {
            pushEvent('TRIPLE');
        }
    };

    return (
        <TileBase
            position={position}
            isDragging={isDragging}
            isSelected={isSelected}
            onPointerDown={handlePointerDown}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
            className={tileClassName}
            style={tileStyle}
            data-testid="tile"
            data-tile-type={type}
            data-tile-value={value}
        >
            {showLabels && (
                <span className="pointer-events-none select-none drop-shadow-md">
                    {isNegative && "-"}{def.label}
                </span>
            )}
        </TileBase>
    )
}, (prev, next) => {
    // Custom comparison for performance optimization.
    // Only re-render if props that affect visual state or position change.
    return (
        prev.id === next.id &&
        prev.type === next.type &&
        prev.value === next.value &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.isSelected === next.isSelected &&
        prev.showLabels === next.showLabels &&
        prev.snapGridSize === next.snapGridSize
    );
});
