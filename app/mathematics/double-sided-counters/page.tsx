'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SetPageTitle } from '@/components/set-page-title';
import { useCounters, CounterType } from './_hooks/use-counters';
import { CountersToolbar } from './_components/counters-toolbar';
import { SummaryStats } from './_components/summary-stats';
import { NumberLine } from './_components/number-line';
import { DraggableCounter } from './_components/draggable-counter';
import { getSidebarLabel, getSidebarTitle } from './_components/counter-type-select';
import { Sidebar, SidebarSection, SidebarButton } from "@/components/tool-ui/sidebar";
import { DraggableSidebarItem } from "@/components/tool-ui/draggable-sidebar-item";
import { SpeedControl } from '@/components/tool-ui/speed-control';
import { Canvas } from '@/components/tool-ui/canvas';
import { HelpButton } from '@/components/tool-ui/help-button';
import { HelpModal } from '@/components/tool-ui/help-modal';
import { counterURLSerializer, CounterURLState } from './_lib/url-state';
import { generateShareableURL, copyURLToClipboard } from '@/lib/url-state';
import helpContent from './HELP.md';

/**
 * Loading fallback component for the counters page.
 */
function CountersPageLoading() {
    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden items-center justify-center">
            <div className="animate-pulse text-slate-400 dark:text-slate-500">Loading...</div>
        </div>
    );
}

/**
 * Main page component wrapped in Suspense for useSearchParams compatibility.
 */
export default function CountersPage() {
    return (
        <Suspense fallback={<CountersPageLoading />}>
            <CountersPageContent />
        </Suspense>
    );
}

/**
 * Inner content component that uses useSearchParams.
 * This must be wrapped in Suspense at the page level for Next.js static prerendering.
 */
function CountersPageContent() {
    const {
        counters,
        sortState,
        isAnimating,
        highlightedPair,
        isSequentialMode,
        setIsSequentialMode,
        isOrdered,
        addCounter,
        addCounterAtPosition,
        addZeroPair,
        flipCounter,
        removeCounter,
        updateCounterPosition,
        clearBoard,
        flipAll,
        organize,
        cancelZeroPairs,
        animSpeed,
        setAnimSpeed,
        setCountersFromState,
        undo,
        canUndo
    } = useCounters();

    const searchParams = useSearchParams();
    const [showNumberLine, setShowNumberLine] = useState(false);
    const [showStats, setShowStats] = useState(true);
    const [counterType, setCounterType] = useState<CounterType>('numeric');
    const [hasInitialized, setHasInitialized] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowNumberLine(state.showNumberLine);
            setShowStats(state.showStats);
            setCounterType(state.counterType);
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
            showStats,
            counterType
        };
        const url = generateShareableURL(counterURLSerializer, state);
        await copyURLToClipboard(url);
        // TODO: Could add a toast notification here to confirm copy
    }, [counters, sortState, isOrdered, isSequentialMode, animSpeed, showNumberLine, showStats, counterType]);

    /**
     * Handle counters dropped from the sidebar onto the canvas.
     * Places the counter at the exact drop location instead of the next grid position.
     */
    const handleDropOnCanvas = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const { type, value } = JSON.parse(data);
            if (type === 'counter' && typeof value === 'number') {
                // Get the canvas element's bounding rect to calculate relative position
                if (canvasRef.current) {
                    const rect = canvasRef.current.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // Place counter at the drop location
                    addCounterAtPosition(value, x, y);
                }
            }
        } catch {
            // Invalid JSON, ignore
        }
    }, [addCounterAtPosition]);

    /**
     * Handle touch-drop from sidebar (custom event for touch/pen devices).
     * Similar to handleDropOnCanvas but uses custom event detail.
     */
    const handleTouchDrop = useCallback((e: Event) => {
        const customEvent = e as CustomEvent<{ dragData: { type: string; value: number }; clientX: number; clientY: number }>;
        const { dragData, clientX, clientY } = customEvent.detail;

        if (dragData.type === 'counter' && typeof dragData.value === 'number') {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                addCounterAtPosition(dragData.value, x, y);
            }
        }
    }, [addCounterAtPosition]);

    // Register touchdrop listener on canvas
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('touchdrop', handleTouchDrop);
        return () => canvas.removeEventListener('touchdrop', handleTouchDrop);
    }, [handleTouchDrop]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    // Keyboard shortcut for undo (Ctrl+Z / Cmd+Z)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo && !isAnimating) {
                    undo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, isAnimating, undo]);

    return (
        <div className="flex flex-col h-[calc(100vh-81px)] w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <SetPageTitle title="Double Sided Counters" />

            {/* Toolbar */}
            <CountersToolbar
                showNumberLine={showNumberLine}
                setShowNumberLine={setShowNumberLine}
                showStats={showStats}
                setShowStats={setShowStats}
                onSort={organize}
                onFlipAll={flipAll}
                onCancel={cancelZeroPairs}
                isAnimating={isAnimating}
                onClear={clearBoard}
                onAddExpression={handleExpressionAdd}
                isSequentialMode={isSequentialMode}
                setIsSequentialMode={setIsSequentialMode}
                onGenerateLink={handleGenerateLink}
                counterType={counterType}
                onCounterTypeChange={setCounterType}
                onUndo={undo}
                canUndo={canUndo}
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <Sidebar>
                    <SidebarSection title={getSidebarTitle(counterType, true)}>
                        <DraggableSidebarItem
                            dragData={{ type: 'counter', value: 1 }}
                            icon={<div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm" />}
                            label={getSidebarLabel(counterType, true)}
                            onClick={() => addCounter(1, 1, showNumberLine)}
                            disabled={isAnimating}
                        />
                    </SidebarSection>

                    <SidebarSection title={getSidebarTitle(counterType, false)}>
                        <DraggableSidebarItem
                            dragData={{ type: 'counter', value: -1 }}
                            icon={<div className="w-4 h-4 rounded-full bg-red-500 border border-red-700 shadow-sm" />}
                            label={getSidebarLabel(counterType, false)}
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
                                onClick={() => addZeroPair()}
                                disabled={isAnimating}
                            />
                        </SidebarSection>
                    </div>

                    <div className="mt-auto pt-6 text-slate-500 dark:text-slate-400 text-sm">
                        <h3 className="font-semibold mb-2 text-slate-600 dark:text-slate-300">Shortcuts:</h3>
                        <ul className="space-y-1 list-disc pl-4 text-xs">
                            <li><span className="font-bold text-slate-700 dark:text-slate-200">Drag</span> from sidebar to add.</li>
                            <li><span className="font-bold text-slate-700 dark:text-slate-200">Click</span> counter to remove.</li>
                            <li><span className="font-bold text-slate-700 dark:text-slate-200">Double-click</span> to flip.</li>
                            <li><span className="font-bold text-slate-700 dark:text-slate-200">Drag</span> counter to move.</li>
                        </ul>
                    </div>
                </Sidebar>

                {/* Main Canvas */}
                <Canvas
                    ref={canvasRef}
                    gridSize={40}
                    data-testid="counter-canvas"
                    onDrop={handleDropOnCanvas}
                    onDragOver={handleDragOver}
                >
                    {/* Stats Overlay */}
                    {showStats && (
                        <SummaryStats pos={positiveCount} neg={negativeCount} sum={totalSum} />
                    )}

                    {/* Speed Control Overlay - positioned below stats on the right */}
                    {isSequentialMode && (
                        <SpeedControl
                            className="absolute top-24 right-4"
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
                                counterType={counterType}
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

                    {/* Help Button */}
                    <HelpButton onClick={() => setShowHelp(true)} />
                </Canvas>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
             `}</style>

            {/* Help Modal */}
            {showHelp && (
                <HelpModal content={helpContent} onClose={() => setShowHelp(false)} />
            )}
        </div>
    );
}