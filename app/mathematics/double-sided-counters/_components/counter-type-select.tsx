"use client"

import * as React from "react"
import { CounterType } from "../_hooks/use-counters"

import { cn } from "@/lib/utils"

interface CounterTypeSelectProps {
    value: CounterType
    onChange: (type: CounterType) => void
    disabled?: boolean
    className?: string
}

const COUNTER_TYPE_OPTIONS: { value: CounterType; label: string }[] = [
    { value: 'numeric', label: '+1/-1' },
    { value: 'x', label: 'x' },
    { value: 'y', label: 'y' },
    { value: 'z', label: 'z' },
    { value: 'a', label: 'a' },
    { value: 'b', label: 'b' },
    { value: 'c', label: 'c' },
]

/**
 * Dropdown for selecting counter type.
 * Positioned next to the Add button in the toolbar.
 */
export function CounterTypeSelect({ value, onChange, disabled, className }: CounterTypeSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as CounterType)}
            disabled={disabled}
            className={cn(
                "h-10 px-2 rounded-md text-sm font-medium",
                "bg-slate-100 dark:bg-slate-800",
                "text-slate-700 dark:text-slate-200",
                "border border-slate-200 dark:border-slate-700",
                "hover:bg-slate-200 dark:hover:bg-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-violet-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "cursor-pointer",
                className
            )}
            data-testid="counter-type-select"
        >
            {COUNTER_TYPE_OPTIONS.map(({ value: optValue, label }) => (
                <option key={optValue} value={optValue}>
                    {label}
                </option>
            ))}
        </select>
    )
}

/**
 * Helper to get display label for a counter based on type and value.
 */
export function getCounterLabel(counterType: CounterType, isPositive: boolean): string {
    if (counterType === 'numeric') {
        return isPositive ? '+' : '−'
    }
    return isPositive ? `+${counterType}` : `−${counterType}`
}

/**
 * Helper to get sidebar label for add button.
 */
export function getSidebarLabel(counterType: CounterType, isPositive: boolean): string {
    if (counterType === 'numeric') {
        return isPositive ? 'Add +1' : 'Add -1'
    }
    return isPositive ? `Add +${counterType}` : `Add -${counterType}`
}

/**
 * Helper to get sidebar section title.
 */
export function getSidebarTitle(counterType: CounterType, isPositive: boolean): string {
    if (counterType === 'numeric') {
        return isPositive ? 'Add Positive' : 'Add Negative'
    }
    return isPositive ? `Add +${counterType}` : `Add -${counterType}`
}
