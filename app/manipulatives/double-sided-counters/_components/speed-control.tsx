import React from 'react';
import { Rabbit, Turtle } from 'lucide-react';

interface SpeedControlProps {
    speed: number;
    onChange: (speed: number) => void;
}

export function SpeedControl({ speed, onChange }: SpeedControlProps) {
    // Speed is in ms per item/pair. 
    // Higher speed value = Slower animation (more ms).
    // Slider should probably go from Slow (Left) to Fast (Right).
    // So Left = High ms, Right = Low ms.

    // min slider = 0, max slider = 100
    // 0 -> 2000ms (Slow)
    // 100 -> 200ms (Fast)

    // Convert speed (ms) to slider value
    // speed = 2000 - (slider / 100 * 1800)
    // slider = (2000 - speed) / 18

    const sliderVal = Math.max(0, Math.min(100, (2000 - speed) / 18));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        // Convert slider back to speed (ms)
        const newSpeed = 2000 - (val * 18);
        onChange(Math.max(200, newSpeed));
    };

    return (
        <div className="absolute top-4 left-4 md:left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg z-30 animate-in fade-in slide-in-from-top-2 flex flex-col items-center gap-2 min-w-[140px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Animation Speed
            </span>
            <div className="flex items-center gap-2 w-full">
                <Turtle size={16} className="text-slate-400 dark:text-slate-500" />
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={sliderVal}
                    onChange={handleChange}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                />
                <Rabbit size={16} className="text-slate-400 dark:text-slate-500" />
            </div>
        </div>
    );
}
