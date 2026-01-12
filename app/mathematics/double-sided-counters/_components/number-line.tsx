"use client"

import React from 'react';
import { FloatingPanel } from '@/components/tool-ui/floating-panel';

interface NumberLineProps {
    val: number;
}

export function NumberLine({ val: currentSum }: NumberLineProps) {
    const clampedSum = Math.max(-21, Math.min(21, currentSum));

    return (
        <FloatingPanel className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl animate-in slide-in-from-bottom duration-300">
            <div className="h-20 w-full relative select-none">
                <div className="relative h-full mx-12">
                    {/* Horizontal Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-300 dark:bg-slate-700"></div>

                    {/* Ticks and Numbers */}
                    {Array.from({ length: 21 }, (_, i) => {
                        // Display range -10 to +10
                        const val = i - 10;
                        const isMajor = val % 5 === 0;
                        const leftPos = `${(i / 20) * 100}%`;

                        return (
                            <div key={val} className="absolute top-0 bottom-0 flex flex-col items-center justify-center pointer-events-none" style={{ left: leftPos, width: 40, marginLeft: -20 }}>
                                <div className={`w-px rounded-full transition-all ${val === 0 ? 'h-5 bg-slate-800 dark:bg-slate-200 w-0.5' : isMajor ? 'h-4 bg-slate-400 dark:bg-slate-500' : 'h-2.5 bg-slate-300 dark:bg-slate-600'}`}></div>
                                <span className={`text-[10px] mt-2 font-medium ${val === 0 ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>{val}</span>
                            </div>
                        );
                    })}

                    {/* Indicator */}
                    {Math.abs(currentSum) <= 10 && (
                        <div
                            className="absolute top-1/2 -mt-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20 flex flex-col items-center"
                            style={{ left: `${((currentSum + 10) / 20) * 100}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg relative z-10"></div>
                            <div className="w-0.5 h-6 bg-blue-600/50 dark:bg-blue-500/50 -mt-2 rounded-b-full"></div>
                        </div>
                    )}
                </div>
            </div>
            {(currentSum > 10 || currentSum < -10) && (
                <div className="absolute top-2 right-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                    Off Scale: {currentSum}
                </div>
            )}
        </FloatingPanel>
    );
}
