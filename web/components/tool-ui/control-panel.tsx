"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Sliders, Eye, BookMarked, Settings2 } from "lucide-react"

// ============================================================================
// Control Section (Collapsible)
// ============================================================================

interface ControlSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    icon?: React.ReactNode
    defaultOpen?: boolean
    children: React.ReactNode
}

export function ControlSection({
    title,
    icon,
    defaultOpen = true,
    children,
    className,
    ...props
}: ControlSectionProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)

    return (
        <div className={cn("border-b border-slate-100 dark:border-slate-800", className)} {...props}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                type="button"
            >
                <div className="flex items-center gap-2">
                    {/* {icon && <span className="text-slate-400">{icon}</span>} */}
                    <h3 className="text-sm uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors select-none">
                        {title}
                    </h3>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    {icon && React.cloneElement(icon as React.ReactElement, { size: 16 })}
                    <ChevronDown
                        size={16}
                        className={cn("transition-transform duration-300", isOpen ? "rotate-180" : "")}
                    />
                </div>
            </button>

            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="px-6 pb-6 pt-2">
                    {children}
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// Control Slider
// ============================================================================

interface ControlSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    value: number
    min: number
    max: number
    step?: number
    displayValue?: React.ReactNode // Custom formatted value display
}

export function ControlSlider({
    label,
    value,
    min,
    max,
    step = 1,
    displayValue,
    className,
    disabled,
    ...props
}: ControlSliderProps) {
    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
                <span className={cn(
                    "font-mono text-sm font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded min-w-[3rem] text-center",
                    disabled && "opacity-50 grayscale"
                )}>
                    {displayValue !== undefined ? displayValue : value}
                </span>
            </div>
            <div className="relative flex items-center pt-1 pb-2">
                <span className="text-xs text-slate-400 absolute left-0 -bottom-4">{min}</span>
                <input
                    type="range"
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    disabled={disabled}
                    {...props}
                />
                <span className="text-xs text-slate-400 absolute right-0 -bottom-4">{max}</span>
            </div>
        </div>
    )
}

// ============================================================================
// Control Toggle
// ============================================================================

interface ControlToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
}

export function ControlToggle({ label, checked, className, ...props }: ControlToggleProps) {
    return (
        <label className={cn("flex items-center justify-between cursor-pointer group", className)}>
            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {label}
            </span>
            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    {...props}
                />
                <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </div>
        </label>
    )
}

// ============================================================================
// Control Preset Button
// ============================================================================

interface ControlPresetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string
    description?: string
    icon?: React.ReactNode
    isActive?: boolean
}

export function ControlPresetButton({
    label,
    description,
    icon,
    isActive,
    className,
    ...props
}: ControlPresetButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                "w-full text-left px-4 py-3 rounded-lg border transition-all group relative overflow-hidden",
                isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "bg-white dark:bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600",
                className
            )}
            {...props}
        >
            <div className="flex items-start gap-3 relative z-10">
                {icon && (
                    <div className={cn(
                        "mt-0.5 transition-colors",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-500"
                    )}>
                        {icon}
                    </div>
                )}
                <div>
                    <div className={cn(
                        "font-medium text-sm transition-colors",
                        isActive ? "text-blue-900 dark:text-blue-100" : "text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300"
                    )}>
                        {label}
                    </div>
                    {description && (
                        <div className={cn(
                            "text-xs mt-1",
                            isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-500"
                        )}>
                            {description}
                        </div>
                    )}
                </div>
            </div>
        </button>
    )
}
