"use client"

import * as React from "react"
import { TILE_TYPES } from "../constants"
import { cn } from "@/lib/utils"
import { ManipulativeSidebar, SidebarButton, SidebarSection } from "@/components/manipulatives/sidebar"

interface TileSidebarProps {
    onAddTile: (type: string, value: number) => void
    showY: boolean
}

/**
 * Sidebar component for selecting and adding new Algebra Tiles to the canvas.
 * Also provides a legend/shortcut guide.
 */
export function TileSidebar({ onAddTile, showY }: TileSidebarProps) {
    const renderButton = (type: string, value: number, label: string) => {
        const def = TILE_TYPES[type];
        if (!def) return null;

        // Scale down for preview
        const scale = 0.2;
        const w = def.width * scale;
        const h = def.height * scale;

        return (
            <SidebarButton
                key={`${type}-${value}`}
                onClick={() => onAddTile(type, value)}
                label={
                    <span>{value > 0 ? "+" : ""}{label}</span>
                }
                icon={
                    <div
                        className={cn(
                            value > 0 ? def.colorPos : def.colorNeg,
                            "border-2",
                            value > 0 ? def.borderColor : def.borderColorNeg,
                            "rounded-sm shadow-sm shrink-0"
                        )}
                        style={{ width: w, height: h }}
                    />
                }
            />
        )
    };

    return (
        <ManipulativeSidebar>
            <SidebarSection title="Add Positive">
                {renderButton('x2', 1, 'x²')}
                {renderButton('x', 1, 'x')}
                {renderButton('1', 1, '1')}
                {showY && (
                    <>
                        {renderButton('y2', 1, 'y²')}
                        {renderButton('y', 1, 'y')}
                        {renderButton('xy', 1, 'xy')}
                    </>
                )}
            </SidebarSection>

            <SidebarSection title="Add Negative">
                {renderButton('x2', -1, '-x²')}
                {renderButton('x', -1, '-x')}
                {renderButton('1', -1, '-1')}
                {showY && (
                    <>
                        {renderButton('y2', -1, '-y²')}
                        {renderButton('y', -1, '-y')}
                        {renderButton('xy', -1, '-xy')}
                    </>
                )}
            </SidebarSection>

            <div className="mt-auto pt-6 text-slate-500 dark:text-slate-400 text-sm">
                <h3 className="font-semibold mb-2 text-slate-600 dark:text-slate-300">Shortcuts:</h3>
                <ul className="space-y-1 list-disc pl-4 text-xs">
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Drag</span> background to select multiple.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Delete/Bksp</span> removes selection.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">R</span> rotates selection.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">F</span> flips sign of selection.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Ctrl+Z</span> undo.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Double Click</span> to flip tile sign.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Triple Click</span> to rotate tile.</li>
                </ul>
            </div>
        </ManipulativeSidebar>
    )
}
