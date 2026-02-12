"use client"

import React from 'react';
import { Rabbit, Turtle } from 'lucide-react';
import { FloatingPanel } from './floating-panel';

interface SpeedControlProps {
    /** 
     * Current speed value in milliseconds (or arbitrary units). 
     * Higher value usually means slower animation.
     */
    speed: number;
    /**
     * Callback with new speed value.
     */
    onChange: (speed: number) => void;
    /**
     * Min speed value (fastest animation, lowest ms). Default 200.
     */
    min?: number;
    /**
     * Max speed value (slowest animation, highest ms). Default 2000.
     */
    max?: number;

    className?: string;
}

export function SpeedControl({ speed, onChange, min = 200, max = 2000, className }: SpeedControlProps) {
    // Map speed (ms) to Slider (0-100)
    // 0 slider = max (Slowest)
    // 100 slider = min (Fastest)

    // Formula: speed = max - (slider / 100 * (max - min))
    // slider = (max - speed) / (max - min) * 100

    const range = max - min;
    const sliderVal = Math.max(0, Math.min(100, ((max - speed) / range) * 100));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        // speed = max - (val / 100 * range)
        const newSpeed = max - ((val / 100) * range);
        onChange(Math.round(newSpeed));
    };

    const getAriaValueText = (val: number) => {
        const rounded = Math.round(val);
        if (rounded === 0) return "Slowest speed";
        if (rounded === 100) return "Fastest speed";
        return `Animation speed ${rounded}%`;
    };

    return (
        <FloatingPanel className={className}>
            <div className="flex flex-col items-center gap-2 min-w-[140px]">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    Animation Speed
                </span>
                <div className="flex items-center gap-2 w-full">
                    <Turtle
                        size={16}
                        className="text-slate-400 dark:text-slate-500"
                        aria-hidden="true"
                    />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={sliderVal}
                        onChange={handleChange}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Animation Speed"
                        aria-valuetext={getAriaValueText(sliderVal)}
                    />
                    <Rabbit
                        size={16}
                        className="text-slate-400 dark:text-slate-500"
                        aria-hidden="true"
                    />
                </div>
            </div>
        </FloatingPanel>
    );
}
