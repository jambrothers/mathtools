"use client"

import * as React from "react"
import {
    ControlSection,
    ControlToggle,
    ControlPresetButton
} from "@/components/tool-ui/control-panel"
import { Sidebar, SidebarButton } from "@/components/tool-ui/sidebar"
import { cn } from "@/lib/utils"
import { PointMarker, JumpArc } from "../_lib/url-state"
import { Viewport, formatJumpLabel } from "../_lib/number-line"
import {
    Plus,
    Minus,
    RotateCcw,
    Link,
    Download,
    Target,
    ArrowRightLeft,
    Trash2,
    Eye,
    EyeOff
} from "lucide-react"

interface NumberLineSidebarProps {
    viewport: Viewport;
    points: PointMarker[];
    arcs: JumpArc[];
    showLabels: boolean;
    hideValues: boolean;
    showNegativeRegion: boolean;
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
    onToggleNegative: (show: boolean) => void;
    onToggleSnap: (snap: boolean) => void;

    // Hidden state actions
    onTogglePointHidden: (id: string) => void;
    onRevealAllPoints: () => void;
    onHideAllPoints: () => void;

    interactionMode: 'default' | 'add-arc' | 'add-point' | 'delete-point';
    pendingArcStart: string | null;
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
    showNegativeRegion,
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
    onToggleNegative,
    onToggleSnap,
    onTogglePointHidden,
    onRevealAllPoints,
    onHideAllPoints,
    interactionMode,
    pendingArcStart,
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
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) onSetRange(val, viewport.max);
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-slate-500 block mb-1">Max</label>
                        <input
                            type="number"
                            value={viewport.max}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) onSetRange(viewport.min, val);
                            }}
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
                    <ControlPresetButton label="-5 to 5" onClick={() => onSetRange(-5, 5)} isActive={viewport.min === -5 && viewport.max === 5} />
                    <ControlPresetButton label="-10 to 10" onClick={() => onSetRange(-10, 10)} isActive={viewport.min === -10 && viewport.max === 10} />
                    <ControlPresetButton label="-20 to 20" onClick={() => onSetRange(-20, 20)} isActive={viewport.min === -20 && viewport.max === 20} />
                    <ControlPresetButton label="-100 to 100" onClick={() => onSetRange(-100, 100)} isActive={viewport.min === -100 && viewport.max === 100} />
                    <ControlPresetButton label="0 to 10" onClick={() => onSetRange(0, 10)} isActive={viewport.min === 0 && viewport.max === 10} />
                    <ControlPresetButton label="0 to 100" onClick={() => onSetRange(0, 100)} isActive={viewport.min === 0 && viewport.max === 100} />
                    <ControlPresetButton label="0 to 1" onClick={() => onSetRange(0, 1)} isActive={viewport.min === 0 && viewport.max === 1} />
                    <ControlPresetButton label="0 to 2" onClick={() => onSetRange(0, 2)} isActive={viewport.min === 0 && viewport.max === 2} />
                    <ControlPresetButton label="-1 to 1" onClick={() => onSetRange(-1, 1)} isActive={viewport.min === -1 && viewport.max === 1} />
                </div>
            </ControlSection>

            {/* Points management */}
            <ControlSection title="Points" defaultOpen={true} icon={<Plus className="w-4 h-4" />}>
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={onRevealAllPoints}
                        className="flex-1 py-1 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors"
                    >
                        Reveal All
                    </button>
                    <button
                        onClick={onHideAllPoints}
                        className="flex-1 py-1 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors"
                    >
                        Hide All
                    </button>
                </div>

                {interactionMode === 'add-point' && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-2 mb-4 rounded text-xs text-amber-800 dark:text-amber-200 animate-pulse">
                        Click on the number line to place points...
                    </div>
                )}

                {interactionMode === 'delete-point' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-2 mb-4 rounded text-xs text-red-800 dark:text-red-200">
                        Click on a point to delete it...
                    </div>
                )}

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
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onTogglePointHidden(p.id)}
                                    className={cn(
                                        "p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
                                        p.hidden ? "text-slate-400" : "text-indigo-600 dark:text-indigo-400"
                                    )}
                                    title={p.hidden ? "Reveal Point" : "Hide Value"}
                                >
                                    {p.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => onRemovePoint(p.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    title="Remove Point"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {points.length === 0 && <p className="text-xs text-slate-400 italic">No points added yet.</p>}
                </div>
            </ControlSection>

            {/* Arcs management */}
            <ControlSection title="Jump Arcs" defaultOpen={true} icon={<ArrowRightLeft className="w-4 h-4" />}>
                <div className="space-y-3 mb-4">
                    {interactionMode === 'add-arc' && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-2 rounded text-xs text-amber-800 dark:text-amber-200 animate-pulse">
                            {pendingArcStart
                                ? "Click second point to finish arc..."
                                : "Click first point to start arc..."
                            }
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white dark:bg-slate-900 text-slate-400">or manual add</span>
                        </div>
                    </div>

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
                        {(() => {
                            const fromP = points.find(p => p.id === arcFrom);
                            const toP = points.find(p => p.id === arcTo);
                            const placeholder = fromP && toP ? formatJumpLabel(fromP.value, toP.value) : "+/− jump label";
                            return (
                                <input
                                    type="text"
                                    placeholder={placeholder}
                                    value={arcLabel}
                                    onChange={(e) => setArcLabel(e.target.value)}
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                                />
                            );
                        })()}
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
                <ControlToggle label="Shade Negative Region" checked={showNegativeRegion} onChange={() => onToggleNegative(!showNegativeRegion)} />
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
