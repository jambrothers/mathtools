"use client"

import * as React from "react"
import { TILE_TYPES } from "../constants"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarSection } from "@/components/tool-ui/sidebar"

interface TileSidebarProps {
    onAddTile: (type: string, value: number, x?: number, y?: number) => void
    showY: boolean
}

/**
 * Data transferred during drag operations
 */
interface TileDragData {
    type: string
    value: number
}

/**
 * A draggable tile preview that can be dragged from the sidebar to the canvas.
 */
function DraggableTileButton({
    type,
    value,
    label,
    onAddTile
}: {
    type: string
    value: number
    label: string
    onAddTile: (type: string, value: number, x?: number, y?: number) => void
}) {
    const def = TILE_TYPES[type];
    if (!def) return null;

    // Scale down for preview
    const scale = 0.2;
    const w = def.width * scale;
    const h = def.height * scale;

    const handleDragStart = (e: React.DragEvent) => {
        const data: TileDragData = { type, value };
        e.dataTransfer.setData('application/json', JSON.stringify(data));
        e.dataTransfer.effectAllowed = 'copy';
    };

    // Fallback: clicking also adds the tile (for accessibility)
    const handleClick = () => {
        onAddTile(type, value);
    };

    return (
        <button
            draggable
            onDragStart={handleDragStart}
            onClick={handleClick}
            className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md w-full transition-colors group text-left cursor-grab active:cursor-grabbing"
        >
            <div className="shrink-0 flex items-center justify-center">
                <div
                    className={cn(
                        value > 0 ? def.colorPos : def.colorNeg,
                        "border-2",
                        value > 0 ? def.borderColor : def.borderColorNeg,
                        "rounded-sm shadow-sm shrink-0"
                    )}
                    style={{ width: w, height: h }}
                />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {value > 0 ? "+" : ""}{label}
            </span>
        </button>
    );
}

/**
 * A row showing vertical and horizontal tile variants side by side.
 */
function TileRow({
    verticalType,
    horizontalType,
    value,
    label,
    onAddTile
}: {
    verticalType: string
    horizontalType?: string
    value: number
    label: string
    onAddTile: (type: string, value: number, x?: number, y?: number) => void
}) {
    const vDef = TILE_TYPES[verticalType];
    const hDef = horizontalType ? TILE_TYPES[horizontalType] : null;

    if (!vDef) return null;

    const scale = 0.2;

    const handleDragStart = (e: React.DragEvent, type: string) => {
        const data: TileDragData = { type, value };
        e.dataTransfer.setData('application/json', JSON.stringify(data));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md transition-colors group">
            {/* Vertical tile */}
            <button
                draggable
                onDragStart={(e) => handleDragStart(e, verticalType)}
                onClick={() => onAddTile(verticalType, value)}
                className="shrink-0 cursor-grab active:cursor-grabbing"
                title={`Drag ${value > 0 ? '+' : ''}${label} (vertical)`}
            >
                <div
                    className={cn(
                        value > 0 ? vDef.colorPos : vDef.colorNeg,
                        "border-2",
                        value > 0 ? vDef.borderColor : vDef.borderColorNeg,
                        "rounded-sm shadow-sm"
                    )}
                    style={{ width: vDef.width * scale, height: vDef.height * scale }}
                />
            </button>

            {/* Horizontal tile (if available) */}
            {hDef && (
                <button
                    draggable
                    onDragStart={(e) => handleDragStart(e, horizontalType!)}
                    onClick={() => onAddTile(horizontalType!, value)}
                    className="shrink-0 cursor-grab active:cursor-grabbing"
                    title={`Drag ${value > 0 ? '+' : ''}${label} (horizontal)`}
                >
                    <div
                        className={cn(
                            value > 0 ? hDef.colorPos : hDef.colorNeg,
                            "border-2",
                            value > 0 ? hDef.borderColor : hDef.borderColorNeg,
                            "rounded-sm shadow-sm"
                        )}
                        style={{ width: hDef.width * scale, height: hDef.height * scale }}
                    />
                </button>
            )}

            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {value > 0 ? "+" : ""}{label}
            </span>
        </div>
    );
}

/**
 * Sidebar component for selecting and adding new Algebra Tiles to the canvas.
 * Tiles can be dragged from the sidebar to the canvas. Clicking also adds tiles.
 * Also provides a legend/shortcut guide.
 */
export function TileSidebar({ onAddTile, showY }: TileSidebarProps) {
    return (
        <Sidebar className="w-64">
            <SidebarSection title="Add Positive">
                {/* x² - square, no horizontal variant */}
                <DraggableTileButton type="x2" value={1} label="x²" onAddTile={onAddTile} />
                {/* x - with horizontal variant */}
                <TileRow verticalType="x" horizontalType="x_h" value={1} label="x" onAddTile={onAddTile} />
                {/* 1 - unit, no horizontal variant (square) */}
                <DraggableTileButton type="1" value={1} label="1" onAddTile={onAddTile} />
                {showY && (
                    <>
                        {/* y² - square, no horizontal variant */}
                        <DraggableTileButton type="y2" value={1} label="y²" onAddTile={onAddTile} />
                        {/* y - with horizontal variant */}
                        <TileRow verticalType="y" horizontalType="y_h" value={1} label="y" onAddTile={onAddTile} />
                        {/* xy - with horizontal variant */}
                        <TileRow verticalType="xy" horizontalType="xy_h" value={1} label="xy" onAddTile={onAddTile} />
                    </>
                )}
            </SidebarSection>

            <SidebarSection title="Add Negative">
                <DraggableTileButton type="x2" value={-1} label="x²" onAddTile={onAddTile} />
                <TileRow verticalType="x" horizontalType="x_h" value={-1} label="x" onAddTile={onAddTile} />
                <DraggableTileButton type="1" value={-1} label="1" onAddTile={onAddTile} />
                {showY && (
                    <>
                        <DraggableTileButton type="y2" value={-1} label="y²" onAddTile={onAddTile} />
                        <TileRow verticalType="y" horizontalType="y_h" value={-1} label="y" onAddTile={onAddTile} />
                        <TileRow verticalType="xy" horizontalType="xy_h" value={-1} label="xy" onAddTile={onAddTile} />
                    </>
                )}
            </SidebarSection>

            <div className="mt-auto pt-6 text-slate-500 dark:text-slate-400 text-sm">
                <h3 className="font-semibold mb-2 text-slate-600 dark:text-slate-300">Shortcuts:</h3>
                <ul className="space-y-1 list-disc pl-4 text-xs">
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Drag</span> tile from sidebar to add.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Drag</span> background to select multiple.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Delete/Bksp</span> removes selection.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">R</span> rotates selection.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">F</span> flips sign of selection.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Ctrl+Z</span> undo.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Double Click</span> to flip tile sign.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Triple Click</span> to rotate tile.</li>
                </ul>
            </div>
        </Sidebar>
    )
}
