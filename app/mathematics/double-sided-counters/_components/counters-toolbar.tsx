"use client"

import * as React from "react"
import { Eye, EyeOff, Trash2, RefreshCw, GitMerge, ArrowRightLeft, Timer, Grid } from "lucide-react"
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator, ToolbarInput } from "@/components/tool-ui/toolbar"
import { CopyLinkButton } from "@/components/tool-ui/copy-link-button"

interface CountersToolbarProps {
    showNumberLine: boolean
    setShowNumberLine: (v: boolean) => void
    showStats: boolean
    setShowStats: (v: boolean) => void
    sortState: 'none' | 'grouped' | 'paired'
    onOrganize: () => void
    onFlipAll: () => void
    onCancel: () => void
    isAnimating: boolean
    onClear: () => void
    onAddExpression: (expr: string) => void
    onGenerateLink: () => void

    // Animation Controls
    isSequentialMode: boolean
    setIsSequentialMode: (v: boolean) => void

    // Ordered mode
    isOrdered: boolean
    onSnapToOrder: () => void
}

export function CountersToolbar({
    showNumberLine, setShowNumberLine,
    showStats, setShowStats,
    sortState, onOrganize,
    onFlipAll,
    onCancel,
    isAnimating,
    onClear,
    onAddExpression,
    onGenerateLink,
    isSequentialMode, setIsSequentialMode,
    isOrdered, onSnapToOrder
}: CountersToolbarProps) {
    const [input, setInput] = React.useState("")

    return (
        <Toolbar className="gap-4">
            {/* Search / Input */}
            <div className="flex-1 flex gap-2 min-w-[200px] max-w-xl">
                <ToolbarInput
                    className="flex-1"
                    value={input}
                    onChange={setInput}
                    onSubmit={(val) => {
                        onAddExpression(val);
                        setInput("");
                    }}
                    placeholder="e.g. 5 + -3"
                    buttonLabel="Add"
                    disabled={isAnimating}
                />
            </div>

            <div className="flex items-center gap-2 ml-auto">
                <ToolbarGroup>
                    <ToolbarButton
                        icon={<Grid size={16} />}
                        label="Ordered"
                        active={isOrdered}
                        onClick={onSnapToOrder}
                        disabled={isAnimating}
                    />
                    <ToolbarButton
                        icon={showNumberLine ? <Eye size={16} /> : <EyeOff size={16} />}
                        label="Number Line"
                        active={showNumberLine}
                        onClick={() => setShowNumberLine(!showNumberLine)}
                    />
                    <ToolbarButton
                        icon={showStats ? <Eye size={16} /> : <EyeOff size={16} />}
                        label="Stats"
                        active={showStats}
                        onClick={() => setShowStats(!showStats)}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
                    <ToolbarButton
                        icon={sortState === 'grouped' ? <GitMerge size={16} /> : <ArrowRightLeft size={16} />}
                        label={sortState === 'grouped' ? "Pair" : "Sort"}
                        onClick={onOrganize}
                        disabled={isAnimating}
                    />
                    <ToolbarButton
                        icon={<RefreshCw size={16} />}
                        label="Flip All"
                        onClick={onFlipAll}
                        disabled={isAnimating}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
                    {/* Cancel Zero Pairs */}
                    <div className="relative group">
                        <ToolbarButton
                            icon={<RefreshCw size={16} className={isAnimating ? "animate-spin" : ""} />}
                            label="Cancel Pairs"
                            variant="primary"
                            onClick={onCancel}
                            disabled={isAnimating}
                        />
                    </div>

                    {/* Slow Mode Toggle (Sequential) */}
                    <ToolbarButton
                        icon={<Timer size={16} />}
                        label="Slow"
                        active={isSequentialMode}
                        onClick={() => setIsSequentialMode(!isSequentialMode)}
                        disabled={isAnimating}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
                    <ToolbarButton
                        icon={<Trash2 size={16} />}
                        label="Clear"
                        variant="danger"
                        onClick={onClear}
                    />
                </ToolbarGroup>

                <ToolbarSeparator />

                <ToolbarGroup>
                    <CopyLinkButton onCopyLink={onGenerateLink} />
                </ToolbarGroup>
            </div>
        </Toolbar>
    )
}

