"use client"

import * as React from "react"
import { MousePointer2, PlusCircle, Trash2, CornerRightUp } from "lucide-react"
import { FloatingPanel } from "@/components/tool-ui/floating-panel"
import { ToolbarButton, ToolbarGroup } from "@/components/tool-ui/toolbar"
import { InteractionMode } from "../_hooks/use-number-line"
import { cn } from "@/lib/utils"

interface NumberLineToolbarProps {
    mode: InteractionMode
    setMode: (mode: InteractionMode) => void
    className?: string
}

export function NumberLineToolbar({ mode, setMode, className }: NumberLineToolbarProps) {
    return (
        <FloatingPanel className={cn(
            "bottom-8 left-1/2 -translate-x-1/2 px-2 py-1.5 flex items-center shadow-2xl bg-white/95 dark:bg-slate-900/95 border-slate-200/50 dark:border-slate-800/50",
            className
        )}>
            <ToolbarGroup className="gap-1">
                <ToolbarButton
                    icon={<MousePointer2 size={20} />}
                    label="Select"
                    active={mode === 'default'}
                    onClick={() => setMode('default')}
                    title="Select and move points (V)"
                    className="h-11 px-4 rounded-lg"
                />
                <ToolbarButton
                    icon={<PlusCircle size={20} />}
                    label="Add Point"
                    active={mode === 'add-point'}
                    onClick={() => setMode('add-point')}
                    title="Click line to add points (P)"
                    className="h-11 px-4 rounded-lg"
                />
                <ToolbarButton
                    icon={<Trash2 size={20} />}
                    label="Delete"
                    active={mode === 'delete-point'}
                    onClick={() => setMode('delete-point')}
                    title="Click point to delete (D)"
                    className="h-11 px-4 rounded-lg"
                />
                <ToolbarButton
                    icon={<CornerRightUp size={20} />}
                    label="Add Jump"
                    active={mode === 'add-arc'}
                    onClick={() => setMode('add-arc')}
                    title="Click two points to add jump (J)"
                    className="h-11 px-4 rounded-lg"
                />
            </ToolbarGroup>
        </FloatingPanel>
    )
}
