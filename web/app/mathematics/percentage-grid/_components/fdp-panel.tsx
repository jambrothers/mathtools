import * as React from 'react';
import { FloatingPanel } from '@/components/tool-ui/floating-panel';
import { cn } from '@/lib/utils';

interface FdpPanelProps {
    percentage: string;
    decimal: string;
    fraction: string;
    showPercentage: boolean;
    showDecimal: boolean;
    showFraction: boolean;
}

export function FdpPanel({
    percentage,
    decimal,
    fraction,
    showPercentage,
    showDecimal,
    showFraction,
}: FdpPanelProps) {
    const rows = [
        { label: 'Percentage', value: showPercentage ? percentage : '?' },
        { label: 'Decimal', value: showDecimal ? decimal : '?' },
        { label: 'Fraction', value: showFraction ? fraction : '?' },
    ];

    return (
        <FloatingPanel className="right-6 top-6 w-56">
            <div className="flex flex-col gap-2">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Live Equivalence</div>
                <div className="space-y-2">
                    {rows.map(row => (
                        <div key={row.label} className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
                            <span className={cn('font-semibold text-slate-900 dark:text-white', row.value === '?' && 'text-slate-400 dark:text-slate-500')}>
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </FloatingPanel>
    );
}
