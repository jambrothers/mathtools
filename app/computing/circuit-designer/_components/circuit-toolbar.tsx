"use client"

import * as React from "react"
import { Eraser, Table, Link } from "lucide-react"
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/tool-ui/toolbar"

interface CircuitToolbarProps {
    onClear: () => void
    onGenerateTruthTable: () => void
    onLoadDemo: (type: 'AND' | 'OR' | 'NOT' | 'XOR') => void
    onCopyLink: () => void
}

/**
 * Toolbar for the Circuit Designer.
 * Contains clear, truth table generation, and quick demo buttons.
 */
export function CircuitToolbar({
    onClear,
    onGenerateTruthTable,
    onLoadDemo,
    onCopyLink
}: CircuitToolbarProps) {
    const [linkCopied, setLinkCopied] = React.useState(false)

    const handleLinkClick = () => {
        onCopyLink();
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <Toolbar>
            {/* Quick Demo buttons on the left */}
            <ToolbarGroup>
                <span className="text-xs text-slate-500 dark:text-slate-400 mr-2 font-medium">Quick Demo:</span>
                <button
                    onClick={() => onLoadDemo('AND')}
                    className="px-3 py-1.5 text-xs font-bold rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors"
                >
                    AND
                </button>
                <button
                    onClick={() => onLoadDemo('OR')}
                    className="px-3 py-1.5 text-xs font-bold rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-colors"
                >
                    OR
                </button>
                <button
                    onClick={() => onLoadDemo('NOT')}
                    className="px-3 py-1.5 text-xs font-bold rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/60 transition-colors"
                >
                    NOT
                </button>
                <button
                    onClick={() => onLoadDemo('XOR')}
                    className="px-3 py-1.5 text-xs font-bold rounded-md bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800/60 transition-colors"
                >
                    XOR
                </button>
            </ToolbarGroup>

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

                <ToolbarSeparator />

                <ToolbarGroup>
                    <div className="relative">
                        <ToolbarButton
                            icon={<Link size={16} />}
                            label="Link"
                            onClick={handleLinkClick}
                            variant="default"
                        />
                        {linkCopied && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-xs text-green-600 dark:text-green-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-md border border-green-200 dark:border-green-800 z-50">
                                Link copied
                            </div>
                        )}
                    </div>
                </ToolbarGroup>
            </div>
        </Toolbar>
    )
}
