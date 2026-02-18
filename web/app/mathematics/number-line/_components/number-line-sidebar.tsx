"use client"

import * as React from "react"
import {
    ControlSection,
    ControlToggle,
    ControlPresetButton
} from "@/components/tool-ui/control-panel"
import { Sidebar, SidebarButton } from "@/components/tool-ui/sidebar"
import { PointMarker, JumpArc } from "../_lib/url-state"
import { Viewport } from "../_lib/number-line"
import {
    Plus,
    Minus,
    RotateCcw,
    Link,
    Download,
    Target,
    ArrowRightLeft,
    Trash2
} from "lucide-react"

interface NumberLineSidebarProps {
    viewport: Viewport;
    points: PointMarker[];
    arcs: JumpArc[];
    showLabels: boolean;
    hideValues: boolean;
    snapToTicks: boolean;
    onSetRange: (min: number, max: number) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onAddPoint: (value: number, label?: string) => void;
    onRemovePoint: (id: string) => void;
    onAddArc: (fromId: string, toId: string, label?: string) => void;
    onRemoveArc: (index: number) => void;
    onToggleLabels: (show: boolean) => void;
    onToggleHide: (hide: boolean) => void;
    onToggleSnap: (snap: boolean) => void;
    onReset: () => void;
    onCopyLink: () => void;
    onExport: () => void;
}

export function NumberLineSidebar({
    viewport,
    points,
    arcs,
    showLabels,
    hideValues,
    snapToTicks,
    onSetRange,
    onZoomIn,
    onZoomOut,
    onAddPoint,
    onRemovePoint,
    onAddArc,
    onRemoveArc,
    onToggleLabels,
    onToggleHide,
    onToggleSnap,
    onReset,
    onCopyLink,
    onExport
}: NumberLineSidebarProps) {
    const [newPointValue, setNewPointValue] = React.useState<number>(0);
    const [arcFrom, setArcFrom] = React.useState<string>("");
    const [arcTo, setArcTo] = React.useState<string>("");
    const [arcLabel, setArcLabel] = React.useState<string>("");

    // Set initial arc select values if points exist
    React.useEffect(() => {
        if (points.length >= 2 && (!arcFrom || !arcTo)) {
            setArcFrom(points[0].id);
            setArcTo(points[1].id);
        }
    }, [points, arcFrom, arcTo]);

    const handleAddArc = () => {
        if (!arcFrom || !arcTo) return;
        onAddArc(arcFrom, arcTo, arcLabel);
        setArcLabel("");
    };

    return (
        <Sidebar className="w-80">
            {/* Viewport controls */}
            <ControlSection title="Viewport Range" icon={<Target className="w-4 h-4" />}>
                <div className="flex gap-2 mb-4">
                    <div className="flex-1">
                        <label className="text-xs text-slate-500 block mb-1">Min</label>
                        <input
                            type="number"
                            value={viewport.min}
                            onChange={(e) => onSetRange(parseFloat(e.target.value), viewport.max)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-slate-500 block mb-1">Max</label>
                        <input
                            type="number"
                            value={viewport.max}
                            onChange={(e) => onSetRange(viewport.min, parseFloat(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <SidebarButton
                        icon={<Plus className="w-4 h-4" />}
                        label="Zoom In"
                        onClick={onZoomIn}
                        className="flex-1"
                    />
                    <SidebarButton
                        icon={<Minus className="w-4 h-4" />}
                        label="Zoom Out"
                        onClick={onZoomOut}
                        className="flex-1"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <ControlPresetButton label="-10 to 10" onClick={() => onSetRange(-10, 10)} isActive={viewport.min === -10 && viewport.max === 10} />
                    <ControlPresetButton label="0 to 100" onClick={() => onSetRange(0, 100)} isActive={viewport.min === 0 && viewport.max === 100} />
                    <ControlPresetButton label="0 to 1" onClick={() => onSetRange(0, 1)} isActive={viewport.min === 0 && viewport.max === 1} />
                    <ControlPresetButton label="-1 to 1" onClick={() => onSetRange(-1, 1)} isActive={viewport.min === -1 && viewport.max === 1} />
                </div>
            </ControlSection>

            {/* Points management */}
            <ControlSection title="Points" defaultOpen={true} icon={<Plus className="w-4 h-4" />}>
                <div className="flex gap-2 mb-4">
                    <input
                        type="number"
                        value={newPointValue}
                        onChange={(e) => setNewPointValue(parseFloat(e.target.value))}
                        data-testid="add-point-input"
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                        onClick={() => onAddPoint(newPointValue)}
                        data-testid="add-point-button"
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                    >
                        Add
                    </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {points.map(p => (
                        <div key={p.id} className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-sm flex-1 truncate">{p.label ? `${p.label} (${p.value})` : p.value}</span>
                            <button onClick={() => onRemovePoint(p.id)} className="p-1 text-slate-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {points.length === 0 && <p className="text-xs text-slate-400 italic">No points added yet.</p>}
                </div>
            </ControlSection>

            {/* Arcs management */}
            <ControlSection title="Jump Arcs" defaultOpen={false} icon={<ArrowRightLeft className="w-4 h-4" />}>
                <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                        <select
                            value={arcFrom}
                            onChange={(e) => setArcFrom(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-1 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                        >
                            <option value="">From...</option>
                            {points.map(p => <option key={p.id} value={p.id}>{p.label || p.value}</option>)}
                        </select>
                        <select
                            value={arcTo}
                            onChange={(e) => setArcTo(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-1 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                        >
                            <option value="">To...</option>
                            {points.map(p => <option key={p.id} value={p.id}>{p.label || p.value}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="+/- jump label"
                            value={arcLabel}
                            onChange={(e) => setArcLabel(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <button
                            onClick={handleAddArc}
                            disabled={!arcFrom || !arcTo}
                            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    {arcs.map((arc, i) => (
                        <div key={i} className="flex items-center gap-2 p-1 text-xs text-slate-600 dark:text-slate-400">
                            <span className="flex-1 truncate">Arc {i + 1}: {arc.label || 'unlabelled'}</span>
                            <button onClick={() => onRemoveArc(i)} className="p-1 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    ))}
                </div>
            </ControlSection>

            {/* Settings */}
            <ControlSection title="Display Settings">
                <ControlToggle label="Show Tick Labels" checked={showLabels} onChange={() => onToggleLabels(!showLabels)} />
                <ControlToggle label="Hide Point Values" checked={hideValues} onChange={() => onToggleHide(!hideValues)} />
                <ControlToggle label="Snap to Ticks" checked={snapToTicks} onChange={() => onToggleSnap(!snapToTicks)} />
            </ControlSection>

            {/* Actions */}
            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <SidebarButton icon={<RotateCcw className="w-4 h-4" />} label="Reset Tool" onClick={onReset} />
                <SidebarButton icon={<Link className="w-4 h-4" />} label="Copy Share Link" onClick={onCopyLink} />
                <SidebarButton icon={<Download className="w-4 h-4" />} label="Export PNG/SVG" onClick={onExport} />
            </div>
        </Sidebar>
    );
}
