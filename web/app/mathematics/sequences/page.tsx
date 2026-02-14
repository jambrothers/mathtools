'use client';

import * as React from 'react';
import { SetPageTitle } from '@/components/set-page-title';
import { Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator } from '@/components/tool-ui/toolbar';
import { CopyLinkButton } from '@/components/tool-ui/copy-link-button';
import { Canvas } from '@/components/tool-ui/canvas';
import { ResolutionGuard } from '@/components/tool-ui/resolution-guard';
import { useUrlState } from '@/lib/hooks/use-url-state';
import { useSequences } from './_hooks/use-sequences';
import { SequenceDisplay } from './_components/sequence-display';
import { sequencesURLSerializer, SequencesURLState } from './_lib/url-state';
import { SEQUENCE_TYPES } from './constants';
import { createPortal } from "react-dom";
import { ChevronDown, Play, RotateCcw, Eye, EyeOff, Hash, Calculator, Type } from "lucide-react";
import { cn } from '@/lib/utils';

function SequencesPageLoading() {
    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden items-center justify-center">
            <div className="animate-pulse text-slate-400 dark:text-slate-500">Loading...</div>
        </div>
    );
}

export default function SequencesPage() {
    return (
        <React.Suspense fallback={<SequencesPageLoading />}>
            <ResolutionGuard>
                <SequencesPageContent />
            </ResolutionGuard>
        </React.Suspense>
    );
}

function SequencesPageContent() {
    const {
        sequenceType,
        a,
        d,
        r,
        d2,
        termCount,
        revealedCount,
        showCounters,
        showRule,
        showNthTerm,
        terms,
        wordedRule,
        nthTermFormula,
        setSequenceType,
        setA,
        setD,
        setR,
        setD2,
        setTermCount,
        setRevealedCount,
        setShowCounters,
        setShowRule,
        setShowNthTerm,
        revealAll,
        hideAll,
        revealNext,
        setFromState
    } = useSequences();

    // URL State management
    const { copyShareableUrl } = useUrlState(sequencesURLSerializer, {
        onRestore: (state) => {
            setFromState(state);
        }
    });

    const handleCopyLink = React.useCallback(async () => {
        const state: SequencesURLState = {
            sequenceType, a, d, r, d2, termCount, revealedCount,
            showCounters, showRule, showNthTerm
        };
        await copyShareableUrl(state);
    }, [copyShareableUrl, sequenceType, a, d, r, d2, termCount, revealedCount, showCounters, showRule, showNthTerm]);

    // Dropdown state
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = React.useState(false);
    const typeBtnRef = React.useRef<HTMLDivElement>(null);
    const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number } | null>(null);

    React.useEffect(() => {
        if (isTypeDropdownOpen && typeBtnRef.current) {
            const rect = typeBtnRef.current.getBoundingClientRect();
            setDropdownPos({ top: rect.bottom + 4, left: rect.left });
        }
    }, [isTypeDropdownOpen]);

    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <SetPageTitle title="Sequences Tool" />

            <Toolbar className="sticky top-0">
                <ToolbarGroup>
                    {/* Sequence Type Dropdown */}
                    <div className="relative" ref={typeBtnRef}>
                        <ToolbarButton
                            icon={<Hash size={18} />}
                            rightIcon={<ChevronDown size={14} className="text-slate-400" />}
                            label={SEQUENCE_TYPES.find(t => t.id === sequenceType)?.label ?? 'Type'}
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                        />
                    </div>
                    {isTypeDropdownOpen && dropdownPos && typeof document !== 'undefined' && createPortal(
                        <>
                            <div className="fixed inset-0 z-[100]" onClick={() => setIsTypeDropdownOpen(false)} />
                            <div
                                className="fixed z-[101] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg min-w-[150px] overflow-hidden"
                                style={{ top: dropdownPos.top, left: dropdownPos.left }}
                            >
                                {SEQUENCE_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        className={cn(
                                            "w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors",
                                            sequenceType === type.id ? "font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-700/50" : ""
                                        )}
                                        onClick={() => {
                                            setSequenceType(type.id);
                                            setIsTypeDropdownOpen(false);
                                        }}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </>,
                        document.body
                    )}

                    <ToolbarSeparator />

                    {/* Parameter Inputs */}
                    <div className="flex items-center gap-4 ml-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">a:</span>
                            <input
                                type="number"
                                value={a}
                                onChange={(e) => setA(Number(e.target.value))}
                                className="w-12 px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                            />
                        </div>

                        {sequenceType === 'arithmetic' && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">d:</span>
                                <input
                                    type="number"
                                    value={d}
                                    onChange={(e) => setD(Number(e.target.value))}
                                    className="w-12 px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                />
                            </div>
                        )}

                        {sequenceType === 'geometric' && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">r:</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={r}
                                    onChange={(e) => setR(Number(e.target.value))}
                                    className="w-16 px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                />
                            </div>
                        )}

                        {sequenceType === 'quadratic' && (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-500 text-xs">1st diff:</span>
                                    <input
                                        type="number"
                                        value={d}
                                        onChange={(e) => setD(Number(e.target.value))}
                                        className="w-12 px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-500 text-xs">2nd diff:</span>
                                    <input
                                        type="number"
                                        value={d2}
                                        onChange={(e) => setD2(Number(e.target.value))}
                                        className="w-12 px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">Terms:</span>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={termCount}
                                onChange={(e) => setTermCount(Number(e.target.value))}
                                className="w-12 px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                            />
                        </div>
                    </div>
                </ToolbarGroup>

                <ToolbarGroup>
                    <ToolbarSeparator />
                    <ToolbarButton icon={<Eye size={18} />} label="Show All" onClick={revealAll} />
                    <ToolbarButton icon={<EyeOff size={18} />} label="Hide All" onClick={hideAll} />
                    <ToolbarButton icon={<Play size={18} />} label="Next term" onClick={revealNext} variant="primary" />

                    <ToolbarSeparator />
                    <ToolbarButton
                        icon={<RotateCcw size={18} />}
                        label="Counters"
                        active={showCounters}
                        onClick={() => setShowCounters(!showCounters)}
                    />
                    <ToolbarButton
                        icon={<Type size={18} />}
                        label="Rule"
                        active={showRule}
                        onClick={() => setShowRule(!showRule)}
                    />
                    <ToolbarButton
                        icon={<Calculator size={18} />}
                        label="nᵗʰ Term"
                        active={showNthTerm}
                        onClick={() => setShowNthTerm(!showNthTerm)}
                    />

                    <ToolbarSeparator />
                    <CopyLinkButton onCopyLink={handleCopyLink} />
                </ToolbarGroup>
            </Toolbar>

            <Canvas className="flex-1">
                <SequenceDisplay
                    terms={terms}
                    revealedCount={revealedCount}
                    showCounters={showCounters}
                    showRule={showRule}
                    showNthTerm={showNthTerm}
                    wordedRule={wordedRule}
                    nthTermFormula={nthTermFormula}
                    onRevealTerm={(index) => setRevealedCount(index + 1)}
                />
            </Canvas>
        </div>
    );
}
