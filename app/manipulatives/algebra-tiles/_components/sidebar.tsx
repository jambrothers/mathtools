"use client"

import * as React from "react"
import { TILE_TYPES } from "../constants"
import { cn } from "@/lib/utils"

interface TileSidebarProps {
    onAddTile: (type: string, value: number) => void
    showY: boolean
}

export function TileSidebar({ onAddTile, showY }: TileSidebarProps) {
    const renderButton = (type: string, value: number, label: string) => {
        const def = TILE_TYPES[type];
        if (!def) return null;

        // Scale down for preview
        const scale = 0.2;
        const w = def.width * scale;
        const h = def.height * scale;

        return (
            <button
                onClick={() => onAddTile(type, value)}
                className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md w-full transition-colors group text-left"
            >
                <div
                    className={cn(
                        value > 0 ? def.colorPos : def.colorNeg,
                        "border-2",
                        value > 0 ? def.borderColor : def.borderColorNeg,
                        "rounded-sm shadow-sm shrink-0"
                    )}
                    style={{ width: w, height: h }}
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {value > 0 ? "+" : ""}{label}
                </span>
            </button>
        )
    };

    return (
        <div className="w-48 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-6 shadow-sm overflow-y-auto z-10 shrink-0 h-full">
            <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Positive</h3>
                <div className="flex flex-col gap-2">
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
                </div>
            </div>

            <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Negative</h3>
                <div className="flex flex-col gap-2">
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
                </div>
            </div>

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
        </div>
    )
}
