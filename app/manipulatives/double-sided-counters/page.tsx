'use client';

import React, { useState } from 'react';
import { SetPageTitle } from '@/components/set-page-title';
import { useCounters } from './_hooks/use-counters';
import { CountersToolbar } from './_components/counters-toolbar';
import { CountersSidebar } from './_components/counters-sidebar';
import { SummaryStats } from './_components/summary-stats';
import { NumberLine } from './_components/number-line';
import { SpeedControl } from './_components/speed-control';

export default function CountersPage() {
    const {
        counters,
        sortState,
        isAnimating,
        highlightedPair,
        isSequentialMode,
        setIsSequentialMode,
        addCounter,
        addZeroPair,
        flipCounter,
        flipAll,
        organize,
        cancelZeroPairs,
        clearBoard,
        animSpeed,
        setAnimSpeed
    } = useCounters();

    const [showNumberLine, setShowNumberLine] = useState(false);
    const [showStats, setShowStats] = useState(true);

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
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <CountersSidebar
                    onAddPositive={() => addCounter(1, 1, showNumberLine)}
                    onAddNegative={() => addCounter(-1, 1, showNumberLine)}
                    onAddZeroPair={() => addZeroPair(showNumberLine)}
                    disabled={isAnimating}
                />

                {/* Main Canvas */}
                <main className="flex-1 relative bg-slate-50 dark:bg-slate-950 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>

                    {/* Dark mode grid (white lines) */}
                    <div className="absolute inset-0 opacity-0 dark:opacity-[0.05] pointer-events-none mix-blend-screen"
                        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>

                    {/* Stats Overlay */}
                    {showStats && (
                        <SummaryStats pos={positiveCount} neg={negativeCount} sum={totalSum} />
                    )}

                    {/* Speed Control Overlay */}
                    {isSequentialMode && (
                        <SpeedControl speed={animSpeed} onChange={setAnimSpeed} />
                    )}

                    {/* Counters Area */}
                    <div className="w-full h-full overflow-y-auto p-8 relative">
                        <div className="min-h-full flex flex-wrap content-center justify-center gap-4 transition-all duration-500 pb-32">
                            {counters.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                                    <div className="w-24 h-24 mb-6 rounded-full bg-white dark:bg-slate-900 border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                                        <span className="text-4xl font-light text-slate-300 dark:text-slate-600">0</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">The board is empty</h3>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add counters using the sidebar</p>
                                </div>
                            )}

                            {counters.map((counter) => {
                                const isBreathing = highlightedPair.includes(counter.id);
                                return (
                                    <button
                                        key={counter.id}
                                        onClick={() => flipCounter(counter.id)}
                                        disabled={isAnimating}
                                        className={`
                                            relative w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg border-4 
                                            flex items-center justify-center text-3xl font-bold 
                                            transition-all duration-500 transform
                                            select-none group
                                            ${counter.value > 0
                                                ? 'bg-yellow-400 border-yellow-500 text-yellow-900 ring-yellow-200'
                                                : 'bg-red-500 border-red-600 text-white ring-red-200'
                                            }
                                            ${!isAnimating ? 'hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer' : 'cursor-default'}
                                            ${counter.isNew ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
                                            ${counter.isLeaving ? 'scale-0 opacity-0 rotate-180' : ''}
                                            ${isBreathing ? 'scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-4 ring-blue-400 ring-opacity-60 z-20' : ''}
                                        `}
                                    >
                                        <span className="relative z-10 drop-shadow-md">{counter.value > 0 ? '+' : '−'}</span>
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none"></div>
                                        <div className="absolute top-2 left-2 w-1/3 h-1/3 bg-white/30 rounded-full blur-[2px] pointer-events-none"></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Floating Number Line */}
                    {showNumberLine && (
                        <NumberLine val={totalSum} />
                    )}

                </main>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
             `}</style>
        </div>
    );
}