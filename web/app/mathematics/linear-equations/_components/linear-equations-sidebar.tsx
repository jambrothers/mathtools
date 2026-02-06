"use client"

import * as React from "react"
import {
    ControlSection, ControlSlider, ControlToggle, ControlPresetButton
} from "@/components/tool-ui/control-panel"
import { LineConfig, MAX_LINES, M_MIN, M_MAX, C_MIN, C_MAX } from "../constants"
import { Sliders, Eye, BookMarked, Plus, Trash2, AlignJustify, Scaling } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinearEquationsSidebarProps {
    lines: LineConfig[]
    activeLineId: string
    onLineSelect: (id: string) => void
    onAddLine: () => void
    onRemoveLine: (id: string) => void
    onUpdateLine: (id: string, updates: Partial<LineConfig>) => void
    showEquation: boolean
    setShowEquation: (v: boolean) => void
    showIntercepts: boolean
    setShowIntercepts: (v: boolean) => void
    showSlopeTriangle: boolean
    setShowSlopeTriangle: (v: boolean) => void
    slopeTriangleSize: number
    setSlopeTriangleSize: (v: number) => void
    showGradientCalculation: boolean
    setShowGradientCalculation: (v: boolean) => void
    showGrid: boolean
    setShowGrid: (v: boolean) => void
    onApplyPreset: (type: 'parallel' | 'perpendicular' | 'proportional') => void
    onReset: () => void
    onExport: () => void
    onCopyLink: () => void
}

export function LinearEquationsSidebar({
    lines,
    activeLineId,
    onLineSelect,
    onAddLine,
    onRemoveLine,
    onUpdateLine,
    showEquation,
    setShowEquation,
    showIntercepts,
    setShowIntercepts,
    showSlopeTriangle,
    setShowSlopeTriangle,
    slopeTriangleSize,
    setSlopeTriangleSize,
    showGradientCalculation,
    setShowGradientCalculation,
    showGrid,
    setShowGrid,
    onApplyPreset,
    onReset,
    onExport,
    onCopyLink
}: LinearEquationsSidebarProps) {
    const activeLine = lines.find(l => l.id === activeLineId) || lines[0]

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header / Line Selector */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Configuration</h2>
                        <p className="text-xs text-slate-500 mt-1">y = mx + c parameters</p>
                    </div>
                </div>

                {/* Line Tabs */}
                <div className="flex flex-wrap gap-2">
                    {lines.map((line, index) => (
                        <button
                            key={line.id}
                            onClick={() => onLineSelect(line.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                                activeLineId === line.id
                                    ? "bg-white dark:bg-slate-800 shadow-sm border-slate-300 dark:border-slate-600 ring-1 ring-slate-200 dark:ring-slate-700"
                                    : "bg-slate-100 dark:bg-slate-800/50 text-slate-500 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
                            )}
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: line.color }}
                            />
                            Line {index + 1}
                        </button>
                    ))}
                    {lines.length < MAX_LINES && (
                        <button
                            onClick={onAddLine}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Add Line"
                        >
                            <Plus size={12} />
                            Add
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Properties Section */}
                <ControlSection title="Properties" icon={<Sliders />} defaultOpen={true}>
                    <div className="space-y-8 p-1">
                        {/* Line Specific Controls */}
                        <ControlSlider
                            label="Gradient (m)"
                            value={activeLine.m}
                            min={M_MIN}
                            max={M_MAX}
                            step={0.1}
                            onChange={(e) => onUpdateLine(activeLine.id, { m: parseFloat(e.target.value) })}
                            onValueChange={(val) => onUpdateLine(activeLine.id, { m: val })}
                        />
                        <ControlSlider
                            label="Y-Intercept (c)"
                            value={activeLine.c}
                            min={C_MIN}
                            max={C_MAX}
                            step={0.5}
                            onChange={(e) => onUpdateLine(activeLine.id, { c: parseFloat(e.target.value) })}
                            onValueChange={(val) => onUpdateLine(activeLine.id, { c: val })}
                        />

                        {/* Delete Line Button */}
                        {lines.length > 1 && (
                            <button
                                onClick={() => onRemoveLine(activeLine.id)}
                                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                            >
                                <Trash2 size={16} />
                                Remove this line
                            </button>
                        )}
                    </div>
                </ControlSection>

                {/* Display Section */}
                <ControlSection title="Display" icon={<Eye />}>
                    <div className="space-y-5 p-1">
                        <ControlToggle
                            label="Show Equation"
                            checked={showEquation}
                            onChange={(e) => setShowEquation(e.target.checked)}
                        />
                        <ControlToggle
                            label="Show Intercepts"
                            checked={showIntercepts}
                            onChange={(e) => setShowIntercepts(e.target.checked)}
                        />
                        <ControlToggle
                            label="Show Slope Triangle"
                            checked={showSlopeTriangle}
                            onChange={(e) => setShowSlopeTriangle(e.target.checked)}
                        />
                        {showSlopeTriangle && (
                            <div className="pl-4 space-y-3 pb-2">
                                <ControlSlider
                                    label="Triangle Size"
                                    value={slopeTriangleSize}
                                    min={0.5}
                                    max={4}
                                    step={0.5}
                                    onChange={(e) => setSlopeTriangleSize(parseFloat(e.target.value))}
                                    onValueChange={setSlopeTriangleSize}
                                />
                                <ControlToggle
                                    label="Show Calculation"
                                    checked={showGradientCalculation}
                                    onChange={(e) => setShowGradientCalculation(e.target.checked)}
                                />
                            </div>
                        )}
                        <ControlToggle
                            label="Show Grid"
                            checked={showGrid}
                            onChange={(e) => setShowGrid(e.target.checked)}
                        />
                    </div>
                </ControlSection>

                {/* Presets Section */}
                <ControlSection title="Presets" icon={<BookMarked />}>
                    <div className="space-y-3">
                        <ControlPresetButton
                            label="Parallel Line"
                            description="Add line with same gradient"
                            icon={<AlignJustify size={20} />}
                            onClick={() => onApplyPreset('parallel')}
                            disabled={lines.length >= MAX_LINES}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <ControlPresetButton
                            label="Perpendicular Line"
                            description="Add line with m × m' = -1"
                            icon={<Plus size={20} className="rotate-45" />} // Approximate perpendicular icon
                            onClick={() => onApplyPreset('perpendicular')}
                            disabled={lines.length >= MAX_LINES}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <ControlPresetButton
                            label="Proportional"
                            description="Set c = 0 (passes through origin)"
                            icon={<Scaling size={20} />}
                            onClick={() => onApplyPreset('proportional')}
                        />
                    </div>
                </ControlSection>
            </div>

            {/* Footer */}
            <div className="p-6 mt-auto bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onReset}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Reset Tool
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onCopyLink}
                            className="flex-1 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
                            title="Copy Link to Clipboard"
                        >
                            Copy Link
                        </button>
                        <button
                            onClick={onExport}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
