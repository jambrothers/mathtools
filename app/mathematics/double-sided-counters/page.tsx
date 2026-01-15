'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SetPageTitle } from '@/components/set-page-title';
import { useCounters } from './_hooks/use-counters';
import { CountersToolbar } from './_components/counters-toolbar';
import { SummaryStats } from './_components/summary-stats';
import { NumberLine } from './_components/number-line';
import { DraggableCounter } from './_components/draggable-counter';
import { Sidebar, SidebarSection, SidebarButton } from "@/components/tool-ui/sidebar";
import { SpeedControl } from '@/components/tool-ui/speed-control';
import { Canvas } from '@/components/tool-ui/canvas';
import { counterURLSerializer, CounterURLState } from './_lib/url-state';
import { generateShareableURL, copyURLToClipboard } from '@/lib/url-state';

export default function CountersPage() {
    const {
        counters,
        sortState,
        isAnimating,
        highlightedPair,
        isSequentialMode,
        setIsSequentialMode,
        isOrdered,
        addCounter,
        addZeroPair,
        flipCounter,
        removeCounter,
        updateCounterPosition,
        snapToOrder,
        flipAll,
        organize,
        cancelZeroPairs,
        clearBoard,
        animSpeed,
        setAnimSpeed,
        setCountersFromState
    } = useCounters();

    const searchParams = useSearchParams();
    const [showNumberLine, setShowNumberLine] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Initialize from URL on mount
    useEffect(() => {
        if (hasInitialized) return;

        const state = counterURLSerializer.deserialize(searchParams);
        if (state) {
            setCountersFromState(
                state.counters,
                state.sortState,
                state.isOrdered,
                state.isSequentialMode,
                state.animSpeed
            );
            setShowNumberLine(state.showNumberLine);
            setShowStats(state.showStats);
        }
        setHasInitialized(true);
    }, [searchParams, hasInitialized, setCountersFromState]);

    // Derived stats
    const positiveCount = counters.filter(c => c.value > 0).length;
    const negativeCount = counters.filter(c => c.value < 0).length;
    const totalSum = positiveCount - negativeCount;

    const handleExpressionAdd = (expr: string) => {
        if (!expr) return;

        // Basic parser for "5 + -3" etc.
        let clean = expr.replace(/[\s,]/g, '');
        clean = clean.replace(/([+-]{2,})/g, (match) => {
            const negatives = (match.match(/-/g) || []).length;
            return negatives % 2 === 1 ? '-' : '+';
        });

        const matches = clean.match(/[+-]?\d+/g);
        if (matches) {
            matches.forEach(term => {
                const val = parseInt(term, 10);
                if (!isNaN(val)) {
                    if (val > 0) addCounter(1, val, showNumberLine);
                    if (val < 0) addCounter(-1, Math.abs(val), showNumberLine);
                }
            });
        }
    };

    /**
     * Generate a shareable URL with the current state and copy to clipboard.
     */
    const handleGenerateLink = useCallback(async () => {
        const state: CounterURLState = {
            counters,
            sortState,
            isOrdered,
            isSequentialMode,
            animSpeed,
            showNumberLine,
            showStats
        };
        const url = generateShareableURL(counterURLSerializer, state);
        await copyURLToClipboard(url);
        // TODO: Could add a toast notification here to confirm copy
    }, [counters, sortState, isOrdered, isSequentialMode, animSpeed, showNumberLine, showStats]);

    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <SetPageTitle title="Double Sided Counters" />

            {/* Toolbar */}
            <CountersToolbar
                showNumberLine={showNumberLine}
                setShowNumberLine={setShowNumberLine}
                showStats={showStats}
                setShowStats={setShowStats}
                sortState={sortState}
                onOrganize={organize}
                onFlipAll={flipAll}
                onCancel={cancelZeroPairs}
                isAnimating={isAnimating}
                onClear={clearBoard}
                onAddExpression={handleExpressionAdd}
                isSequentialMode={isSequentialMode}
                setIsSequentialMode={setIsSequentialMode}
                isOrdered={isOrdered}
                onSnapToOrder={snapToOrder}
                onGenerateLink={handleGenerateLink}
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <Sidebar>
                    <SidebarSection title="Add Positive">
                        <SidebarButton
                            icon={<div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm" />}
                            label="Add +1"
                            onClick={() => addCounter(1, 1, showNumberLine)}
                            disabled={isAnimating}
                        />
                    </SidebarSection>

                    <SidebarSection title="Add Negative">
                        <SidebarButton
                            icon={<div className="w-4 h-4 rounded-full bg-red-500 border border-red-700 shadow-sm" />}
                            label="Add -1"
                            onClick={() => addCounter(-1, 1, showNumberLine)}
                            disabled={isAnimating}
                        />
                    </SidebarSection>

                    <div className="mt-8">
                        <SidebarSection title="Combinations">
                            <SidebarButton
                                icon={
                                    <div className="flex -space-x-1">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600 z-10" />
                                        <div className="w-3 h-3 rounded-full bg-red-500 border border-red-700" />
                                    </div>
                                }
                                label="Zero Pair"
                                onClick={() => addZeroPair(showNumberLine)}
                                disabled={isAnimating}
                            />
                        </SidebarSection>
                    </div>

                    <div className="mt-auto pt-6 text-slate-500 dark:text-slate-400 text-sm">
                        <h3 className="font-semibold mb-2 text-slate-600 dark:text-slate-300">Shortcuts:</h3>
                        <ul className="space-y-1 list-disc pl-4 text-xs">
                            <li><span className="font-bold text-slate-700 dark:text-slate-200">Click</span> to remove.</li>
                            <li><span className="font-bold text-slate-700 dark:text-slate-200">Double-click</span> to flip.</li>
                            <li><span className="font-bold text-slate-700 dark:text-slate-200">Drag</span> to move.</li>
                        </ul>
                    </div>
                </Sidebar>

                {/* Main Canvas */}
                <Canvas gridSize={40}>
                    {/* Stats Overlay */}
                    {showStats && (
                        <SummaryStats pos={positiveCount} neg={negativeCount} sum={totalSum} />
                    )}

                    {/* Speed Control Overlay */}
                    {isSequentialMode && (
                        <SpeedControl
                            className="absolute top-4 left-4 md:left-6"
                            speed={animSpeed}
                            onChange={setAnimSpeed}
                        />
                    )}

                    {/* Counters Area */}
                    <div className="w-full h-full overflow-y-auto relative">
                        {counters.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                                <div className="w-24 h-24 mb-6 rounded-full bg-white dark:bg-slate-900 border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                                    <span className="text-4xl font-light text-slate-300 dark:text-slate-600">0</span>
                                </div>
                                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">The board is empty</h3>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add counters using the sidebar</p>
                            </div>
                        )}

                        {counters.map((counter) => (
                            <DraggableCounter
                                key={counter.id}
                                counter={counter}
                                isAnimating={isAnimating}
                                isBreathing={highlightedPair.includes(counter.id)}
                                onRemove={removeCounter}
                                onFlip={flipCounter}
                                onDragEnd={updateCounterPosition}
                            />
                        ))}
                    </div>

                    {/* Floating Number Line */}
                    {showNumberLine && (
                        <NumberLine val={totalSum} />
                    )}
                </Canvas>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
             `}</style>
        </div>
    );
}