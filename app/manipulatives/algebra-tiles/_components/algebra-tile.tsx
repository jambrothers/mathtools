"use client"

import * as React from "react"
import { useDraggable } from "@/lib/hooks/use-draggable"
import { useClickStack } from "@/lib/hooks/use-click-stack"
import { TileBase } from "@/components/manipulatives/tile-base"
import { TILE_TYPES } from "../constants"
import { cn } from "@/lib/utils"
import { Position } from "@/types/manipulatives"

interface AlgebraTileProps {
    id: string
    type: string
    value: number
    x: number
    y: number
    isSelected?: boolean
    showLabels?: boolean
    onDragStart?: (id: string, initialPos: Position) => void
    onDragMove?: (id: string, newPos: Position, delta: Position) => void
    onDragEnd?: (id: string, finalPos: Position) => void
    onSelect?: (id: string, multi: boolean) => void
    onFlip?: (id: string) => void
    onRotate?: (id: string) => void
}

export const AlgebraTile = React.memo(function AlgebraTile({
    id,
    type,
    value,
    x,
    y,
    isSelected,
    showLabels,
    onDragStart,
    onDragMove,
    onDragEnd,
    onSelect,
    onFlip,
    onRotate
}: AlgebraTileProps) {
    const { position, isDragging, handleMouseDown: handleDragStart } = useDraggable(id, { x, y }, {
        onDragStart,
        onDragMove,
        onDragEnd
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

    const handleMouseDown = (e: React.MouseEvent) => {
        // Stop bubbling so canvas doesn't clear selection
        e.stopPropagation();
        onSelect?.(id, e.shiftKey || e.metaKey);
        handleDragStart(e);
    };

    // Event Priority Stack
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
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
            className={cn(
                bgClasses,
                "border-2",
                borderClasses,
                "flex items-center justify-center font-bold text-white shadow-sm"
            )}
            style={{
                width: def.width,
                height: def.height
            }}
        >
            {showLabels && (
                <span className="pointer-events-none select-none drop-shadow-md">
                    {isNegative && "-"}{def.label}
                </span>
            )}
        </TileBase>
    )
}, (prev, next) => {
    // Custom comparison for performance optimization
    return (
        prev.id === next.id &&
        prev.type === next.type &&
        prev.value === next.value &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.isSelected === next.isSelected &&
        prev.showLabels === next.showLabels
    );
});
