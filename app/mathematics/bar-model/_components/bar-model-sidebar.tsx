"use client"

/**
 * Sidebar for the bar model tool.
 *
 * Displays draggable bar blocks that can be dropped onto the canvas.
 * Uses the shared DraggableSidebarItem component with dragData.
 */

import { Sidebar, SidebarSection } from "@/components/tool-ui/sidebar"
import { DraggableSidebarItem } from "@/components/tool-ui/draggable-sidebar-item"
import { SIDEBAR_ITEMS, BAR_COLORS } from "../constants"

/**
 * Extended drag data for bar model items.
 * Extends SidebarDragData with bar-specific properties.
 */
export interface BarDragData {
    type: 'bar';
    colorIndex: number;
    label: string;
    value: number; // Required by SidebarDragData interface
    [key: string]: unknown; // Index signature for SidebarDragData compatibility
}

export function BarModelSidebar() {
    return (
        <Sidebar>
            <SidebarSection title="Bar Blocks">
                {SIDEBAR_ITEMS.map((item) => {
                    const color = BAR_COLORS[item.colorIndex];
                    const dragData: BarDragData = {
                        type: 'bar',
                        colorIndex: item.colorIndex,
                        label: item.defaultLabel,
                        value: item.colorIndex, // Use colorIndex as value
                    };

                    return (
                        <DraggableSidebarItem
                            key={item.id}
                            dragData={dragData}
                            label={item.sidebarLabel}
                            icon={
                                <div
                                    className={`w-12 h-6 rounded border-2 ${color.bg} ${color.border} ${color.bgDark} ${color.borderDark} flex items-center justify-center`}
                                >
                                    <span className={`text-xs font-bold ${color.text} ${color.textDark}`}>
                                        {item.defaultLabel || '—'}
                                    </span>
                                </div>
                            }
                        />
                    );
                })}
            </SidebarSection>
        </Sidebar>
    );
}
