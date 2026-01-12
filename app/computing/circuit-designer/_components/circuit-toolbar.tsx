"use client"

import * as React from "react"
import { Eraser, Table } from "lucide-react"
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/tool-ui/toolbar"

interface CircuitToolbarProps {
    onClear: () => void
    onGenerateTruthTable: () => void
}

/**
 * Toolbar for the Circuit Designer.
 * Contains clear and truth table generation buttons.
 */
export function CircuitToolbar({
    onClear,
    onGenerateTruthTable
}: CircuitToolbarProps) {
    return (
        <Toolbar>
            <div className="flex-1" />

            <div className="flex items-center gap-2">
                <ToolbarGroup>
                    <ToolbarButton
                        icon={<Table size={16} />}
                        label="Generate Truth Table"
                        variant="success"
                        onClick={onGenerateTruthTable}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
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
