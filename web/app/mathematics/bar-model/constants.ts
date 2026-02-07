/**
 * Bar Model Tool Constants
 *
 * Defines colors, sizes, and sidebar items for the bar model manipulative.
 */

// =============================================================================
// Layout Constants
// =============================================================================

/** Grid snap size in pixels - bars will snap to this grid */
export const GRID_SIZE = 20;

/** Default height of bars in pixels */
export const BAR_HEIGHT = 60;

/** Default width for new bars (5 grid units) */
export const DEFAULT_BAR_WIDTH = 100;

/** Minimum bar width (1 grid unit) */
export const MIN_BAR_WIDTH = 20;

/** Quick label types for labeling bars */
export type QuickLabelType = 'x' | 'y' | '?' | 'units' | 'relative';

/** Valid parts for splitting bars */
export const SPLIT_PARTS = [2, 3, 5] as const;
export type SplitPart = typeof SPLIT_PARTS[number];

// =============================================================================
// Color Definitions
// =============================================================================

/**
 * Bar color configuration.
 * Uses CSS variables and Tailwind classes following DESIGN.md guidelines.
 */
export interface BarColor {
    /** Display name for the color */
    name: string;
    /** Background color class */
    bg: string;
    /** Border color class */
    border: string;
    /** Text color class */
    text: string;
    /** Background color for dark mode */
    bgDark: string;
    /** Border color for dark mode */
    borderDark: string;
    /** Text color for dark mode */
    textDark: string;
}

/**
 * Color palette for bars.
 * Index is used as colorIndex in BarData.
 */
export const BAR_COLORS: BarColor[] = [
    // 0: Unit (Red)
    {
        name: 'Unit',
        bg: 'bg-red-400',
        border: 'border-red-500',
        text: 'text-white',
        bgDark: 'dark:bg-red-600',
        borderDark: 'dark:border-red-400',
        textDark: 'dark:text-white',
    },
    // 1: Variable X (Blue)
    {
        name: 'Variable X',
        bg: 'bg-blue-400',
        border: 'border-blue-500',
        text: 'text-white',
        bgDark: 'dark:bg-blue-600',
        borderDark: 'dark:border-blue-400',
        textDark: 'dark:text-white',
    },
    // 2: Variable Y (Green)
    {
        name: 'Variable Y',
        bg: 'bg-emerald-400',
        border: 'border-emerald-500',
        text: 'text-white',
        bgDark: 'dark:bg-emerald-600',
        borderDark: 'dark:border-emerald-400',
        textDark: 'dark:text-white',
    },
    // 3: Generic (Yellow)
    {
        name: 'Generic',
        bg: 'bg-amber-300',
        border: 'border-amber-400',
        text: 'text-amber-900',
        bgDark: 'dark:bg-amber-500',
        borderDark: 'dark:border-amber-400',
        textDark: 'dark:text-amber-950',
    },
    // 4: Quantity (Purple)
    {
        name: 'Quantity',
        bg: 'bg-violet-400',
        border: 'border-violet-500',
        text: 'text-white',
        bgDark: 'dark:bg-violet-600',
        borderDark: 'dark:border-violet-400',
        textDark: 'dark:text-white',
    },
    // 5: Unknown/Total (Gray)
    {
        name: 'Unknown',
        bg: 'bg-slate-200',
        border: 'border-slate-300',
        text: 'text-slate-700',
        bgDark: 'dark:bg-slate-600',
        borderDark: 'dark:border-slate-500',
        textDark: 'dark:text-slate-100',
    },
];

// =============================================================================
// Sidebar Items
// =============================================================================

/**
 * Sidebar item configuration for draggable bar blocks.
 */
export interface SidebarItem {
    /** Unique identifier */
    id: string;
    /** Default label when placed on canvas (empty = no label) */
    defaultLabel: string;
    /** Color index into BAR_COLORS */
    colorIndex: number;
    /** Width in grid units relative to default */
    width: number;
    /** Label shown in sidebar */
    sidebarLabel: string;
}

/**
 * Predefined bar types available in the sidebar.
 */
export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        id: 'unit',
        sidebarLabel: '1 Unit',
        defaultLabel: '',
        colorIndex: 0,
        width: 1,
    },
    {
        id: 'var-x',
        sidebarLabel: 'Variable x',
        defaultLabel: '',
        colorIndex: 1,
        width: 1,
    },
    {
        id: 'var-y',
        sidebarLabel: 'Variable y',
        defaultLabel: '',
        colorIndex: 2,
        width: 1,
    },
    {
        id: 'generic',
        sidebarLabel: 'Generic',
        defaultLabel: '',
        colorIndex: 3,
        width: 1,
    },
    {
        id: 'quantity',
        sidebarLabel: 'Quantity',
        defaultLabel: '',
        colorIndex: 4,
        width: 1,
    },
    {
        id: 'unknown',
        sidebarLabel: 'Unknown',
        defaultLabel: '',
        colorIndex: 5,
        width: 1,
    },
];
