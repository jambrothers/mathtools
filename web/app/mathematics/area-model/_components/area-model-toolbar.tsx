"use client";

import {
    Type,
    Calculator,
    EyeOff,
    Grid2x2,
    Hash,
    Table,
    Share2,
    Download,
    ChevronUp,
    ChevronDown,
    Trash2,
    Play
} from "lucide-react";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator, ToolbarInput } from "@/components/tool-ui/toolbar";

interface FactorInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    onIncrement: () => void;
    onDecrement: () => void;
    id: string;
}

function FactorInput({ label, value, onChange, onIncrement, onDecrement, id }: FactorInputProps) {
    return (
        <div className="flex flex-col gap-1 items-center">
            <div className="flex items-center gap-1">
                <ToolbarButton
                    onClick={onDecrement}
                    data-testid={`decrement-${id}`}
                    title={`Decrease ${label}`}
                    icon={<ChevronDown className="h-4 w-4" />}
                    className="h-10 w-10 p-0 justify-center shrink-0"
                />
                <ToolbarInput
                    value={value}
                    onChange={onChange}
                    placeholder={label}
                    className="w-24 text-center font-mono"
                    aria-label={label}
                />
                <ToolbarButton
                    onClick={onIncrement}
                    data-testid={`increment-${id}`}
                    title={`Increase ${label}`}
                    icon={<ChevronUp className="h-4 w-4" />}
                    className="h-10 w-10 p-0 justify-center shrink-0"
                />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter text-center">
                {label}
            </span>
        </div>
    );
}

interface AreaModelToolbarProps {
    factorA: string;
    factorB: string;
    onFactorAChange: (v: string) => void;
    onFactorBChange: (v: string) => void;
    onIncrementA: () => void;
    onDecrementA: () => void;
    onIncrementB: () => void;
    onDecrementB: () => void;
    onVisualise: () => void;
    onClear: () => void;

    // Visibility toggles
    showFactorLabels: boolean;
    showPartialProducts: boolean;
    showTotal: boolean;
    showGridLines: boolean;
    showArray: boolean;
    onToggleFactorLabels: () => void;
    onTogglePartialProducts: () => void;
    onToggleTotal: () => void;
    onToggleGridLines: () => void;
    onToggleArray: () => void;
    isAlgebraic: boolean;

    // Reveal
    onRevealAll: () => void;
    onHideAll: () => void;

    // Auto-partition
    autoPartition: boolean;
    onToggleAutoPartition: () => void;

    // Sharing & export
    onGenerateLink: () => void;
    onExport: () => void;
}

export function AreaModelToolbar({
    factorA,
    factorB,
    onFactorAChange,
    onFactorBChange,
    onIncrementA,
    onDecrementA,
    onIncrementB,
    onDecrementB,
    onVisualise,
    onClear,
    showFactorLabels,
    showPartialProducts,
    showTotal,
    showGridLines,
    showArray,
    onToggleFactorLabels,
    onTogglePartialProducts,
    onToggleTotal,
    onToggleGridLines,
    onToggleArray,
    isAlgebraic,
    onRevealAll,
    onHideAll,
    autoPartition,
    onToggleAutoPartition,
    onGenerateLink,
    onExport
}: AreaModelToolbarProps) {
    return (
        <Toolbar>
            <ToolbarGroup>
                <FactorInput
                    id="a"
                    label="Factor A"
                    value={factorA}
                    onChange={onFactorAChange}
                    onIncrement={onIncrementA}
                    onDecrement={onDecrementA}
                />
                <div className="flex items-center mt-[-16px] text-slate-400 font-bold px-1">×</div>
                <FactorInput
                    id="b"
                    label="Factor B"
                    value={factorB}
                    onChange={onFactorBChange}
                    onIncrement={onIncrementB}
                    onDecrement={onDecrementB}
                />
                <ToolbarButton
                    icon={<Play className="h-4 w-4" />}
                    onClick={onVisualise}
                    variant="primary"
                    className="ml-2"
                    label="Visualise"
                />
                <ToolbarButton
                    icon={<Trash2 className="h-4 w-4 text-rose-500" />}
                    onClick={onClear}
                    title="Clear everything"
                    aria-label="Clear everything"
                />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <ToolbarButton
                    icon={showFactorLabels ? <Type className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    onClick={onToggleFactorLabels}
                    active={showFactorLabels}
                    title="Toggle Labels"
                    aria-label="Toggle Labels"
                />
                <ToolbarButton
                    icon={showPartialProducts ? <Calculator className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    onClick={onTogglePartialProducts}
                    active={showPartialProducts}
                    title="Toggle Partial Products"
                    aria-label="Toggle Partial Products"
                />
                <ToolbarButton
                    icon={showTotal ? <Table className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    onClick={onToggleTotal}
                    active={showTotal}
                    title="Toggle Total"
                    aria-label="Toggle Total"
                />
                <ToolbarButton
                    icon={<Grid2x2 className="h-4 w-4" />}
                    onClick={onToggleGridLines}
                    active={showGridLines}
                    title="Toggle Partition Lines"
                    aria-label="Toggle Partition Lines"
                />
                <ToolbarButton
                    icon={<Hash className="h-4 w-4" />}
                    onClick={onToggleArray}
                    active={showArray}
                    disabled={isAlgebraic}
                    title="Toggle Discrete Array"
                    aria-label="Toggle Discrete Array"
                />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <ToolbarButton
                    onClick={onRevealAll}
                    label="Reveal All"
                    className="text-xs font-semibold px-2"
                />
                <ToolbarButton
                    onClick={onHideAll}
                    label="Hide All"
                    className="text-xs font-semibold px-2"
                />
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup>
                <ToolbarButton
                    onClick={onToggleAutoPartition}
                    active={autoPartition}
                    className="text-xs font-semibold px-3"
                    label="Auto-Partition"
                />
            </ToolbarGroup>

            <div className="flex-1" />

            <ToolbarGroup>
                <ToolbarButton
                    icon={<Share2 className="h-4 w-4" />}
                    onClick={onGenerateLink}
                    title="Share Link"
                />
                <ToolbarButton
                    icon={<Download className="h-4 w-4" />}
                    onClick={onExport}
                    title="Export Image"
                />
            </ToolbarGroup>
        </Toolbar>
    );
}
