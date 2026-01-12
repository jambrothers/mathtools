"use client"

import * as React from "react"
import { Eye, EyeOff, Settings2, Magnet, Undo, Grid, Check, Eraser, Trash2 } from "lucide-react"
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator, ToolbarInput } from "@/components/tool-ui/toolbar"

interface AlgebraToolbarProps {
    showLabels: boolean
    setShowLabels: (v: boolean) => void
    showY: boolean
    setShowY: (v: boolean) => void
    snapToGrid: boolean
    setSnapToGrid: (v: boolean) => void
    onUndo: () => void
    canUndo: boolean
    onClear: () => void
    onGroup?: () => void
    onSimplify?: () => void
    onDeleteSelected?: () => void
    hasSelection: boolean
    onVisualize?: (eq: string) => void
}

/**
 * Toolbar specifically for the Algebra Tiles manipulative.
 * Includes controls for labels, Y variables, grid snapping, grouping, and visualization.
 */

export function AlgebraToolbar({
    showLabels, setShowLabels,
    showY, setShowY,
    snapToGrid, setSnapToGrid,
    onUndo, canUndo,
    onClear,
    onGroup,
    onSimplify,
    onDeleteSelected,
    hasSelection,
    onVisualize
}: AlgebraToolbarProps) {
    const [input, setInput] = React.useState("")

    return (
        <Toolbar className="gap-4">
            <div className="flex-1 flex gap-2 min-w-[300px] max-w-4xl">
                <ToolbarInput
                    className="flex-1"
                    value={input}
                    onChange={setInput}
                    onSubmit={onVisualize}
                    placeholder="e.g. 2x + 1 = 5"
                    buttonLabel="Visualize"
                    buttonIcon={<Check size={16} />}
                />
            </div>

            <div className="flex items-center gap-2">
                <ToolbarGroup>
                    <ToolbarButton
                        icon={showLabels ? <Eye size={16} /> : <EyeOff size={16} />}
                        label="Labels"
                        active={!showLabels}
                        onClick={() => setShowLabels(!showLabels)}
                    />
                    <ToolbarButton
                        icon={<Settings2 size={16} />}
                        label={showY ? "Hide Y" : "Show Y"}
                        active={showY}
                        onClick={() => setShowY(!showY)}
                    />
                    <ToolbarButton
                        icon={<Magnet size={16} />}
                        label="Snap"
                        active={snapToGrid}
                        onClick={() => setSnapToGrid(!snapToGrid)}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
                    <ToolbarButton
                        icon={<Undo size={16} />}
                        label="Undo"
                        disabled={!canUndo}
                        onClick={onUndo}
                    />
                    <ToolbarButton
                        icon={<Grid size={16} />}
                        label="Group"
                        variant="primary"
                        onClick={onGroup}
                    />
                    <ToolbarButton
                        icon={<Check size={16} />}
                        label="Simplify"
                        variant="success"
                        onClick={onSimplify}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
                    <ToolbarButton
                        icon={<Trash2 size={16} />}
                        label="Delete"
                        variant="danger"
                        disabled={!hasSelection}
                        onClick={onDeleteSelected}
                    />
                    <ToolbarButton
                        icon={<Eraser size={16} />}
                        label="Clear"
                        variant="danger"
                        onClick={onClear}
                    />
                </ToolbarGroup>
            </div>
        </Toolbar>
    )
}
