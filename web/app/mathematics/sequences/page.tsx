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
import { HelpModal } from '@/components/tool-ui/help-modal';
import { HelpButton } from '@/components/tool-ui/help-button';
import helpContent from './HELP.md';
import { ChevronDown, RotateCcw, Eye, EyeOff, Calculator, Type, Settings, Dices, Check, Plus } from "lucide-react";
import { cn } from '@/lib/utils';
import { SequenceType } from './_lib/sequences';

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
        showConfig,
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
        setShowConfig,
        toggleAllRevealed,
        addNextTerm,
        randomize,
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
            showCounters, showRule, showNthTerm, showConfig
        };
        await copyShareableUrl(state);
    }, [copyShareableUrl, sequenceType, a, d, r, d2, termCount, revealedCount, showCounters, showRule, showNthTerm, showConfig]);

    // Help Modal
    const [isHelpOpen, setIsHelpOpen] = React.useState(false);

    // Random dropdown state
    const [isRandomDropdownOpen, setIsRandomDropdownOpen] = React.useState(false);
    const [selectedRandomTypes, setSelectedRandomTypes] = React.useState<SequenceType[]>(['arithmetic', 'geometric', 'quadratic']);
    const randomBtnRef = React.useRef<HTMLDivElement>(null);

    // Config Positioning logic (for the floating panel)
    const configBtnRef = React.useRef<HTMLDivElement>(null);

    const toggleRandomType = (type: SequenceType) => {
        setSelectedRandomTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <SetPageTitle title="Sequences Tool" />

            <Toolbar className="sticky top-0">
                <ToolbarGroup>
                    {/* Config Toggle */}
                    <div ref={configBtnRef}>
                        <ToolbarButton
                            icon={<Settings size={18} />}
                            label="Config"
                            active={showConfig}
                            onClick={() => setShowConfig(!showConfig)}
                        />
                    </div>

                    <ToolbarSeparator />

                    {/* Random Dropdown */}
                    <div className="relative" ref={randomBtnRef}>
                        <ToolbarButton
                            icon={<Dices size={18} />}
                            rightIcon={<ChevronDown size={14} className="text-slate-400" />}
                            label="Random"
                            onClick={() => setIsRandomDropdownOpen(!isRandomDropdownOpen)}
                        />
                        {isRandomDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setIsRandomDropdownOpen(false)} />
                                <div className="absolute top-full left-0 mt-1 z-[101] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg min-w-[180px] p-2 flex flex-col gap-1">
                                    {SEQUENCE_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-md w-full text-left"
                                            onClick={() => toggleRandomType(type.id)}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 border rounded flex items-center justify-center transition-colors",
                                                selectedRandomTypes.includes(type.id)
                                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                                    : "border-slate-300 dark:border-slate-600"
                                            )}>
                                                {selectedRandomTypes.includes(type.id) && <Check size={12} />}
                                            </div>
                                            {type.label}
                                        </button>
                                    ))}
                                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                                    <button
                                        disabled={selectedRandomTypes.length === 0}
                                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => {
                                            randomize(selectedRandomTypes);
                                            setIsRandomDropdownOpen(false);
                                        }}
                                    >
                                        Generate
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </ToolbarGroup>

                <ToolbarGroup>
                    <ToolbarSeparator />
                    <ToolbarButton
                        icon={revealedCount === termCount && termCount > 0 ? <EyeOff size={18} /> : <Eye size={18} />}
                        label={revealedCount === termCount && termCount > 0 ? "Hide All" : "Show All"}
                        onClick={toggleAllRevealed}
                        disabled={termCount === 0}
                    />
                    <ToolbarButton
                        icon={<Plus size={18} />}
                        label="Next term"
                        onClick={addNextTerm}
                        variant="primary"
                        disabled={termCount >= 12}
                    />

                    <ToolbarSeparator />
                    <ToolbarButton
                        icon={<RotateCcw size={18} />}
                        label="Counters"
                        active={showCounters}
                        onClick={() => setShowCounters(!showCounters)}
                        disabled={termCount === 0}
                    />
                    <ToolbarButton
                        icon={<Type size={18} />}
                        label="Rule"
                        active={showRule}
                        onClick={() => setShowRule(!showRule)}
                        disabled={termCount === 0}
                    />
                    <ToolbarButton
                        icon={<Calculator size={18} />}
                        label="nᵗʰ Term"
                        active={showNthTerm}
                        onClick={() => setShowNthTerm(!showNthTerm)}
                        disabled={termCount === 0}
                    />

                    <ToolbarSeparator />
                    <CopyLinkButton onCopyLink={handleCopyLink} />
                </ToolbarGroup>
            </Toolbar>

            <Canvas className="flex-1 relative">
                {/* Floating Config Panel */}
                {showConfig && (
                    <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 min-w-[240px] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sequence Type</span>
                                <select
                                    value={sequenceType}
                                    onChange={(e) => setSequenceType(e.target.value as SequenceType)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {SEQUENCE_TYPES.map(t => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parameters</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-500 uppercase">First Term (a)</label>
                                        <input
                                            type="number"
                                            value={a}
                                            onChange={(e) => setA(Number(e.target.value))}
                                            className="w-full px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                        />
                                    </div>

                                    {sequenceType === 'arithmetic' && (
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-slate-500 uppercase">Difference (d)</label>
                                            <input
                                                type="number"
                                                value={d}
                                                onChange={(e) => setD(Number(e.target.value))}
                                                className="w-full px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                            />
                                        </div>
                                    )}

                                    {sequenceType === 'geometric' && (
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] text-slate-500 uppercase">Ratio (r)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={r}
                                                onChange={(e) => setR(Number(e.target.value))}
                                                className="w-full px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                            />
                                        </div>
                                    )}

                                    {sequenceType === 'quadratic' && (
                                        <>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-slate-500 uppercase">1st Diff (d)</label>
                                                <input
                                                    type="number"
                                                    value={d}
                                                    onChange={(e) => setD(Number(e.target.value))}
                                                    className="w-full px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-slate-500 uppercase">2nd Diff (d2)</label>
                                                <input
                                                    type="number"
                                                    value={d2}
                                                    onChange={(e) => setD2(Number(e.target.value))}
                                                    className="w-full px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-500 uppercase">Terms</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="12"
                                            value={termCount}
                                            onChange={(e) => setTermCount(Number(e.target.value))}
                                            className="w-full px-2 py-1 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConfig(false)}
                                className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter hover:underline text-center"
                            >
                                Close Panel
                            </button>
                        </div>
                    </div>
                )}

                {termCount === 0 ? (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-4">
                        <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <Plus size={48} className="opacity-20" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-medium">No sequence generated</h3>
                            <p className="text-sm">Click Random or open Config to create a sequence</p>
                        </div>
                    </div>
                ) : (
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
                )}

                <HelpButton onClick={() => setIsHelpOpen(true)} />
            </Canvas>

            {isHelpOpen && (
                <HelpModal
                    onClose={() => setIsHelpOpen(false)}
                    content={helpContent}
                />
            )}
        </div>
    );
}
