'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
    Trash2,
    RefreshCw,
    ArrowRightLeft,
    Eye,
    EyeOff,
    GitMerge,
    Calculator,
    CornerDownLeft,
    Timer,
    Rabbit,
    Turtle,
    X
} from 'lucide-react';

interface Counter {
    id: number;
    value: number;
    isNew?: boolean;
    isLeaving?: boolean;
}

export default function CountersPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-2xl text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
                    Double Sided Counters
                </h1>
                <DoubleSidedCounters />
            </div>
        </div>
    )
}

function DoubleSidedCounters() {
    const [counters, setCounters] = useState<Counter[]>([]);
    const [sortState, setSortState] = useState<'none' | 'grouped' | 'paired'>('none'); // 'none', 'grouped', 'paired'
    const [expression, setExpression] = useState('');

    // Animation Settings
    const [isSequentialMode, setIsSequentialMode] = useState(false);
    const [animSpeed, setAnimSpeed] = useState(1000); // ms per pair
    const [highlightedPair, setHighlightedPair] = useState<number[]>([]); // IDs of currently breathing pair

    // Refs for logic safety
    const nextIdRef = useRef(0);
    const animationQueueEndRef = useRef(0);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const abortAnimationRef = useRef(false); // Flag to stop sequential cancellation

    const [isAnimating, setIsAnimating] = useState(false);
    const [showNumberLine, setShowNumberLine] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Constants
    const POSITIVE = 1;
    const NEGATIVE = -1;

    // --- Core Logic ---

    const addCounter = (value: number, count = 1) => {
        // If we add counters while animating cancellation, it might look weird, 
        // but we allow it. However, if clearing, we must abort.

        // 1. Instant Add (if Number Line is hidden)
        if (!showNumberLine) {
            const newCounters: Counter[] = [];
            for (let i = 0; i < count; i++) {
                newCounters.push({
                    id: nextIdRef.current++,
                    value: value,
                    isNew: true,
                });
            }
            setCounters(prev => [...prev, ...newCounters]);

            const tId = setTimeout(() => {
                setCounters(prev => prev.map(c => ({ ...c, isNew: false })));
                scrollToBottom();
            }, 100);
            timeoutsRef.current.push(tId);
            return;
        }

        // 2. Sequential Add (if Number Line is visible)
        for (let i = 0; i < count; i++) {
            const now = Date.now();
            const startTime = Math.max(now, animationQueueEndRef.current);
            const delay = startTime - now;
            animationQueueEndRef.current = startTime + 500;

            const tId = setTimeout(() => {
                const newId = nextIdRef.current++;
                setCounters(prev => [...prev, {
                    id: newId,
                    value: value,
                    isNew: true
                }]);
                scrollToBottom();

                const cleanTId = setTimeout(() => {
                    setCounters(prev => prev.map(c => c.id === newId ? { ...c, isNew: false } : c));
                }, 50);
                timeoutsRef.current.push(cleanTId);
            }, delay);

            timeoutsRef.current.push(tId);
        }
    };

    const addZeroPair = () => {
        addCounter(POSITIVE, 1);
        addCounter(NEGATIVE, 1);
    };

    const flipCounter = (id: number) => {
        // Prevent flipping during cancellation to avoid logic errors
        if (isAnimating) return;

        setCounters(prev => prev.map(c =>
            c.id === id ? { ...c, value: c.value * -1 } : c
        ));
        setSortState('none');
    };

    const flipAll = () => {
        if (isAnimating) return;
        setCounters(prev => prev.map(c => ({ ...c, value: c.value * -1 })));
        setSortState('none');
    };

    const organize = () => {
        if (isAnimating) return;
        const nextMode = sortState === 'grouped' ? 'paired' : 'grouped';
        setSortState(nextMode);

        setCounters(prev => {
            if (nextMode === 'grouped') {
                return [...prev].sort((a, b) => b.value - a.value);
            } else {
                const positives = prev.filter(c => c.value === POSITIVE);
                const negatives = prev.filter(c => c.value === NEGATIVE);
                const sorted: Counter[] = [];
                const pairCount = Math.min(positives.length, negatives.length);

                for (let i = 0; i < pairCount; i++) {
                    sorted.push(positives[i]);
                    sorted.push(negatives[i]);
                }

                if (positives.length > pairCount) sorted.push(...positives.slice(pairCount));
                if (negatives.length > pairCount) sorted.push(...negatives.slice(pairCount));

                return sorted;
            }
        });
    };

    // --- Cancellation Logic ---

    const wait = (ms: number) => new Promise(resolve => {
        const id = setTimeout(resolve, ms);
        timeoutsRef.current.push(id);
    });

    const cancelZeroPairs = async () => {
        if (isAnimating) return;

        // Calculate pairs
        const positives = counters.filter(c => c.value === POSITIVE);
        const negatives = counters.filter(c => c.value === NEGATIVE);
        const pairCount = Math.min(positives.length, negatives.length);

        if (pairCount === 0) return;

        setIsAnimating(true);
        abortAnimationRef.current = false;

        // Identify Pair IDs
        const pairs: number[][] = [];
        for (let i = 0; i < pairCount; i++) {
            pairs.push([positives[i].id, negatives[i].id]);
        }

        // MODE 1: SEQUENTIAL
        if (isSequentialMode) {
            // 1. Sort into pairs first (Visual help)
            setCounters(prev => {
                const remaining = prev.filter(c => !pairs.flat().includes(c.id));
                const pairedObjs: Counter[] = [];
                pairs.forEach(([pId, nId]) => {
                    const p = prev.find(c => c.id === pId);
                    const n = prev.find(c => c.id === nId);
                    if (p && n) {
                        pairedObjs.push(p);
                        pairedObjs.push(n);
                    }
                });
                return [...pairedObjs, ...remaining];
            });

            // Small pause after sorting
            await wait(300);

            // 2. Loop through pairs
            for (const [posId, negId] of pairs) {
                if (abortAnimationRef.current) break;

                // A. Highlight (Breathe)
                setHighlightedPair([posId, negId]);

                // Wait based on speed (showing the breathing)
                await wait(animSpeed * 0.6);

                if (abortAnimationRef.current) break;

                // B. Trigger Exit Animation
                setCounters(prev => prev.map(c =>
                    (c.id === posId || c.id === negId) ? { ...c, isLeaving: true } : c
                ));

                // C. Clear Highlight so they fade out naturally without the glow/scale
                setHighlightedPair([]);

                // Wait for CSS fade transition (fixed 600ms in CSS, but we can speed up if slider is fast)
                const exitDuration = Math.min(600, animSpeed * 0.4);
                await wait(exitDuration);

                // D. Remove from State
                setCounters(prev => prev.filter(c => c.id !== posId && c.id !== negId));
            }
        }

        // MODE 2: BATCH (Instant)
        else {
            const allIdsToRemove = new Set(pairs.flat());

            setCounters(prev => prev.map(c =>
                allIdsToRemove.has(c.id) ? { ...c, isLeaving: true } : c
            ));

            await wait(600);
            setCounters(prev => prev.filter(c => !allIdsToRemove.has(c.id)));
        }

        setHighlightedPair([]);
        setIsAnimating(false);
    };

    const clearBoard = () => {
        // 1. Abort any running async loops
        abortAnimationRef.current = true;

        // 2. Clear all scheduled timeouts
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        animationQueueEndRef.current = 0;

        // 3. Reset State
        setCounters([]);
        setHighlightedPair([]);
        setSortState('none');
        setIsAnimating(false);
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const handleExpressionAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!expression) return;
        // Don't allow adding while animating cancel to prevent confusion
        if (isAnimating) return;

        let clean = expression.replace(/[\s,]/g, '');
        clean = clean.replace(/([+-]{2,})/g, (match) => {
            const negatives = (match.match(/-/g) || []).length;
            return negatives % 2 === 1 ? '-' : '+';
        });

        const matches = clean.match(/[+-]?\d+/g);

        if (matches) {
            let addedSomething = false;
            matches.forEach(term => {
                const val = parseInt(term, 10);
                if (!isNaN(val)) {
                    if (val > 0) addCounter(POSITIVE, val);
                    if (val < 0) addCounter(NEGATIVE, Math.abs(val));
                    addedSomething = true;
                }
            });
            if (addedSomething) setExpression('');
        }
    };

    const positiveCount = counters.filter(c => c.value === POSITIVE).length;
    const negativeCount = counters.filter(c => c.value === NEGATIVE).length;
    const totalSum = positiveCount - negativeCount;

    // --- Render Helpers ---

    const renderNumberLine = () => {
        const clampedSum = Math.max(-21, Math.min(21, totalSum));
        return (
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-white/95 border-t border-slate-200 backdrop-blur-sm z-30 overflow-hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-300">
                <div className="w-full h-full flex items-center justify-center relative select-none">
                    <div className="relative h-16 w-full max-w-4xl mx-auto flex items-center overflow-x-auto no-scrollbar">
                        <div className="min-w-[1000px] w-full h-full relative">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-300"></div>
                            {Array.from({ length: 41 }, (_, i) => {
                                const val = i - 20;
                                const isMajor = val % 5 === 0;
                                const leftPos = `${(i / 40) * 100}%`;
                                return (
                                    <div key={val} className="absolute top-0 bottom-0 flex flex-col items-center justify-center" style={{ left: leftPos, transform: 'translateX(-50%)' }}>
                                        <div className={`w-px rounded-full transition-all duration-300 ${val === 0 ? 'h-5 bg-slate-800 w-0.5' : isMajor ? 'h-4 bg-slate-400' : 'h-2.5 bg-slate-300'}`}></div>
                                        {(isMajor || Math.abs(val) === Math.abs(totalSum)) && (
                                            <span className={`text-[10px] mt-2 font-medium transition-all duration-300 ${val === totalSum ? 'text-blue-600 font-bold scale-150 -translate-y-0.5' : 'text-slate-400'}`}>{val}</span>
                                        )}
                                    </div>
                                );
                            })}
                            <div className="absolute top-1/2 -mt-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20 flex flex-col items-center" style={{ left: `${((clampedSum + 20) / 40) * 100}%`, transform: 'translate(-50%, -50%)' }}>
                                <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg relative z-10 flex items-center justify-center">
                                    {totalSum > 20 && <div className="text-[9px] text-white font-bold ml-0.5">›</div>}
                                    {totalSum < -20 && <div className="text-[9px] text-white font-bold mr-0.5">‹</div>}
                                </div>
                                <div className="w-0.5 h-6 bg-blue-600/50 -mt-2 rounded-b-full"></div>
                            </div>
                        </div>
                    </div>
                    {(totalSum > 20 || totalSum < -20) && <div className="absolute top-2 right-4 bg-blue-50 text-blue-600 border border-blue-100 text-xs px-2 py-1 rounded-full font-bold shadow-sm">Off Chart: {totalSum}</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 overflow-hidden">

            {/* --- Header --- */}
            <header className="bg-white border-b border-slate-200 px-4 py-3 md:px-6 shadow-sm z-20 shrink-0 relative">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="flex -space-x-2 filter drop-shadow-sm">
                                <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-500"></div>
                                <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-600"></div>
                            </div>
                            <span>Double Sided Counters</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                        <button
                            onClick={() => setShowNumberLine(!showNumberLine)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${showNumberLine ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-inner' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                        >
                            {showNumberLine ? <Eye size={16} /> : <EyeOff size={16} />}
                            <span className="hidden sm:inline">Number Line</span>
                        </button>

                        <div className="flex items-center gap-4 bg-slate-100 px-5 py-2 rounded-xl border border-slate-200 shadow-inner">
                            <div className="text-center">
                                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Pos</span>
                                <span className="text-lg font-bold text-yellow-600 tabular-nums">+{positiveCount}</span>
                            </div>
                            <div className="h-8 w-px bg-slate-300/50"></div>
                            <div className="text-center">
                                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Neg</span>
                                <span className="text-lg font-bold text-red-600 tabular-nums">-{negativeCount}</span>
                            </div>
                            <div className="h-8 w-px bg-slate-300/50"></div>
                            <div className="text-center min-w-[2.5rem]">
                                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Sum</span>
                                <span className={`text-xl font-bold tabular-nums ${totalSum > 0 ? 'text-green-600' : totalSum < 0 ? 'text-red-600' : 'text-slate-700'}`}>{totalSum > 0 ? '+' : ''}{totalSum}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Main Workspace --- */}
            <main className="flex-1 overflow-hidden relative bg-slate-50 flex flex-col">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 scroll-smooth ${showNumberLine ? 'pb-40' : 'pb-24'}`}>
                    <div className="max-w-5xl mx-auto min-h-full flex flex-col justify-center">
                        {counters.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 py-10 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 mb-6 rounded-full bg-white border-4 border-dashed border-slate-200 flex items-center justify-center shadow-sm">
                                    <span className="text-4xl font-light text-slate-300">0</span>
                                </div>
                                <h3 className="text-lg font-medium text-slate-600">The board is empty</h3>
                                <p className="text-sm text-slate-400 mt-1">Add counters using the controls below</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-start justify-center content-start gap-3 md:gap-4 transition-all duration-500 ease-in-out pb-10">
                                {counters.map((counter) => {
                                    // Check if this specific counter is currently part of the active breathing pair
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
                        ${counter.value === POSITIVE
                                                    ? 'bg-yellow-400 border-yellow-500 text-yellow-900 ring-yellow-200'
                                                    : 'bg-red-500 border-red-600 text-white ring-red-200'
                                                }
                        ${!isAnimating ? 'hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer' : 'cursor-default'}
                        ${counter.isNew ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
                        ${counter.isLeaving ? 'scale-0 opacity-0 rotate-180' : ''}
                        ${isBreathing ? 'animate-breathing z-10 ring-4 ring-blue-400 ring-opacity-60 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}
                      `}
                                        >
                                            <span className="relative z-10 drop-shadow-md">{counter.value === POSITIVE ? '+' : '−'}</span>
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none"></div>
                                            <div className="absolute top-2 left-2 w-1/3 h-1/3 bg-white/30 rounded-full blur-[2px] pointer-events-none"></div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Number Line Overlay */}
                {showNumberLine && renderNumberLine()}
            </main>

            {/* --- Controls Footer --- */}
            <footer className="bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] z-40 shrink-0 relative">

                {/* Sequential Animation Settings Panel (Pops up when mode is active) */}
                {isSequentialMode && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-2 fade-in z-50 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Speed</span>
                        <div className="flex items-center gap-3">
                            <Turtle size={16} className="text-slate-400" />
                            <input
                                type="range"
                                min="200"
                                max="2000"
                                step="100"
                                value={3000 - animSpeed} // Invert so right is faster (visual convention usually, but Rabbit/Turtle icons clarify)
                                // Actually simpler: Left = Slow (Turtle), Right = Fast (Rabbit)
                                // So min value (200) should be Fast? No, wait. 
                                // Turtle (Left) -> Long Duration (Large ms)
                                // Rabbit (Right) -> Short Duration (Small ms)
                                // Let's map slider 0-100 to range
                                onChange={(e) => {
                                    // Map slider (0-100) to Duration (2000ms - 200ms)
                                    // Low slider = High Duration
                                    const val = parseInt(e.target.value);
                                    setAnimSpeed(2200 - val);
                                }}
                                className="w-32 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <Rabbit size={16} className="text-slate-400" />
                        </div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto px-3 md:px-6 py-4">
                    <div className="flex flex-col gap-4">

                        {/* Input Row */}
                        <div className="flex justify-center md:justify-start">
                            <form onSubmit={handleExpressionAdd} className="flex gap-2 w-full md:max-w-md relative group">
                                <div className="relative flex-1">
                                    <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={expression}
                                        onChange={(e) => setExpression(e.target.value)}
                                        placeholder="Calculate (e.g. 5 + -3 or 4 - 2)..."
                                        disabled={isAnimating}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                        transition-all shadow-sm placeholder:text-slate-400 disabled:opacity-60"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!expression || isAnimating}
                                    className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold 
                     hover:bg-slate-700 hover:shadow-md hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0
                     transition-all flex items-center gap-2"
                                >
                                    <CornerDownLeft size={16} />
                                    <span className="hidden sm:inline">Add</span>
                                </button>
                            </form>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                            {/* Add Counters Group */}
                            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 px-1 justify-center md:justify-start">
                                <button
                                    onClick={() => addCounter(POSITIVE)}
                                    disabled={isAnimating}
                                    className="flex items-center gap-2 px-5 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 
                    rounded-xl font-bold transition-all border-2 border-yellow-300 shadow-sm active:scale-95 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                                >
                                    <div className="w-5 h-5 rounded-full bg-yellow-400 border border-yellow-600 flex items-center justify-center text-[10px] text-yellow-900 shadow-sm">+</div>
                                    Add +1
                                </button>

                                <button
                                    onClick={() => addCounter(NEGATIVE)}
                                    disabled={isAnimating}
                                    className="flex items-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-800 
                    rounded-xl font-bold transition-all border-2 border-red-300 shadow-sm active:scale-95 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                                >
                                    <div className="w-5 h-5 rounded-full bg-red-500 border border-red-700 flex items-center justify-center text-[10px] text-white shadow-sm">-</div>
                                    Add -1
                                </button>

                                <button
                                    onClick={addZeroPair}
                                    disabled={isAnimating}
                                    className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 
                    rounded-xl font-semibold transition-all border-2 border-slate-200 min-w-max shadow-sm active:scale-95 hover:border-slate-300 disabled:opacity-50 disabled:transform-none"
                                    title="Add a positive and negative counter together"
                                >
                                    <div className="flex -space-x-1 scale-75">
                                        <div className="w-5 h-5 rounded-full bg-yellow-400 border border-yellow-600"></div>
                                        <div className="w-5 h-5 rounded-full bg-red-500 border border-red-600"></div>
                                    </div>
                                    <span>Zero Pair</span>
                                </button>
                            </div>

                            <div className="hidden md:block w-px h-12 bg-slate-200"></div>

                            {/* Tools Group */}
                            <div className="flex gap-2 w-full md:w-auto flex-wrap justify-center md:justify-end">

                                <button
                                    onClick={organize}
                                    disabled={counters.length === 0 || isAnimating}
                                    className="flex flex-col items-center justify-center w-16 h-14 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600
                    border border-slate-200 hover:border-blue-200 rounded-xl transition-all shadow-sm active:scale-95 
                    disabled:opacity-50 disabled:cursor-not-allowed group"
                                    title={sortState === 'grouped' ? "Sort into Zero Pairs" : "Sort by Type"}
                                >
                                    {sortState === 'grouped' ? (
                                        <GitMerge size={20} className="mb-1 text-blue-500" />
                                    ) : (
                                        <ArrowRightLeft size={20} className="mb-1" />
                                    )}
                                    <span className="text-[10px] font-bold">
                                        {sortState === 'grouped' ? "Pair" : "Sort"}
                                    </span>
                                </button>

                                <button
                                    onClick={flipAll}
                                    disabled={counters.length === 0 || isAnimating}
                                    className="flex flex-col items-center justify-center w-16 h-14 bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-600
                    border border-slate-200 hover:border-purple-200 rounded-xl transition-all shadow-sm active:scale-95 
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Flip all counters (Multiply by -1)"
                                >
                                    <RefreshCw size={18} className="mb-1" />
                                    <span className="text-[10px] font-bold">Flip All</span>
                                </button>

                                {/* Cancel Group with Toggle */}
                                <div className="flex items-center gap-1 bg-white border-2 border-slate-200 rounded-xl p-1 shadow-sm">
                                    <button
                                        onClick={cancelZeroPairs}
                                        disabled={counters.length === 0 || isAnimating}
                                        className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all active:scale-95 h-full
                      ${Math.min(positiveCount, negativeCount) > 0
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }
                    `}
                                        title="Remove pairs of positive and negative counters"
                                    >
                                        <RefreshCw size={18} className={isAnimating ? "animate-spin" : ""} />
                                        <span>Cancel</span>
                                    </button>

                                    <div className="w-px h-8 bg-slate-200 mx-1"></div>

                                    <button
                                        onClick={() => !isAnimating && setIsSequentialMode(!isSequentialMode)}
                                        disabled={isAnimating}
                                        className={`
                      w-10 h-full flex items-center justify-center rounded-lg transition-colors
                      ${isSequentialMode ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
                    `}
                                        title={isSequentialMode ? "Sequential Mode On" : "Sequential Mode Off"}
                                    >
                                        <Timer size={20} />
                                    </button>
                                </div>

                                <div className="w-px h-10 bg-slate-300 mx-2"></div>

                                <button
                                    onClick={clearBoard}
                                    disabled={counters.length === 0}
                                    className="flex flex-col items-center justify-center w-14 h-14 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 
                    border border-slate-200 hover:border-red-200 rounded-xl transition-all shadow-sm active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Clear Board"
                                >
                                    <Trash2 size={20} className="mb-1" />
                                    <span className="text-[10px] font-bold">Clear</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* --- Styles --- */}
            <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes breathe {
          0% { transform: scale(1.1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { transform: scale(1.15); box-shadow: 0 0 15px 5px rgba(59, 130, 246, 0.2); }
          100% { transform: scale(1.1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .animate-breathing {
          animation: breathe 1.5s infinite;
        }
      `}</style>
        </div>
    );
}