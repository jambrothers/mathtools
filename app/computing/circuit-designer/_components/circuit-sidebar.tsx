"use client"

import * as React from "react"
import { Sidebar, SidebarSection, SidebarButton } from "@/components/tool-ui/sidebar"
import { COMPONENT_TYPES, ComponentTypeName } from "../constants"

interface CircuitSidebarProps {
    onAddNode: (type: ComponentTypeName) => void
}

/**
 * Sidebar component for selecting and adding circuit components.
 * Provides input/output devices and logic gates.
 */
export function CircuitSidebar({ onAddNode }: CircuitSidebarProps) {
    const renderButton = (type: ComponentTypeName) => {
        const def = COMPONENT_TYPES[type];

        return (
            <SidebarButton
                key={type}
                onClick={() => onAddNode(type)}
                label={def.label}
                icon={
                    <div className={`w-8 h-8 rounded-lg ${def.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                        {def.label.substring(0, 3)}
                    </div>
                }
            />
        );
    };

    return (
        <Sidebar className="w-56">
            <SidebarSection title="Input / Output">
                {renderButton('INPUT')}
                {renderButton('OUTPUT')}
            </SidebarSection>

            <SidebarSection title="Logic Gates">
                {renderButton('AND')}
                {renderButton('OR')}
                {renderButton('NOT')}
                {renderButton('XOR')}
            </SidebarSection>

            <div className="mt-auto pt-6 text-slate-500 dark:text-slate-400 text-sm">
                <h3 className="font-semibold mb-2 text-slate-600 dark:text-slate-300">How to Use:</h3>
                <ul className="space-y-1 list-disc pl-4 text-xs">
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Click</span> switches to toggle.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Drag</span> from green port to connect.</li>
                    <li><span className="font-bold text-slate-700 dark:text-slate-200">Hover</span> node to delete.</li>
                </ul>
            </div>
        </Sidebar>
    )
}
