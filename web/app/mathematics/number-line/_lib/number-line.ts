import { MIN_VIEWPORT_RANGE, MAX_VIEWPORT_RANGE } from '../constants';

export interface Viewport {
    min: number;
    max: number;
}

export type TickType = 'major' | 'minor';

export interface Tick {
    value: number;
    type: TickType;
}

/**
 * Maps a graph value to an SVG pixel x-coordinate
 */
export function toPixelX(value: number, viewport: Viewport, canvasWidth: number): number {
    const range = viewport.max - viewport.min;
    if (range === 0) return 0;
    return ((value - viewport.min) / range) * canvasWidth;
}

/**
 * Maps an SVG pixel x-coordinate to a graph value
 */
export function fromPixelX(px: number, viewport: Viewport, canvasWidth: number): number {
    const range = viewport.max - viewport.min;
    if (canvasWidth === 0) return viewport.min;
    return viewport.min + (px / canvasWidth) * range;
}

/**
 * Formats a tick label for display
 */
export function formatTickLabel(value: number): string {
    // Avoid precision issues (0.30000000000000004)
    const formatted = parseFloat(value.toFixed(10));
    return formatted.toString();
}

/**
 * Calculates adaptive ticks based on the current viewport
 */
export function calculateTicks(viewport: Viewport): Tick[] {
    const range = viewport.max - viewport.min;

    // Determine the best step size based on range
    // We want roughly 5-15 major ticks
    const targetMajorTicks = 10;
    const rawStep = range / targetMajorTicks;

    // Find the nearest power of 10 or a nice multiple (1, 2, 5)
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

    let majorStep: number;
    if (normalized < 1.5) majorStep = 1 * magnitude;
    else if (normalized < 3.5) majorStep = 2 * magnitude;
    else if (normalized < 7.5) majorStep = 5 * magnitude;
    else majorStep = 10 * magnitude;

    const minorStep = majorStep / 5;

    const ticks: Tick[] = [];

    // Start from the first multiple of majorStep below viewport.min
    const start = Math.floor(viewport.min / majorStep) * majorStep;
    const end = Math.ceil(viewport.max / majorStep) * majorStep;

    // We'll iterate by minor steps to catch all minor and major ticks
    // Using a safe loop to avoid infinite loops with infinitesimal ranges
    let current = start;
    const maxIterations = 2000; // Safety cap
    let iterations = 0;

    while (current <= end + (minorStep / 2) && iterations < maxIterations) {
        // Use epsilon check for major ticks to avoid floating point issues
        const isMajor = Math.abs(current / majorStep - Math.round(current / majorStep)) < 0.0001;

        if (current >= viewport.min - (minorStep * 0.1) && current <= viewport.max + (minorStep * 0.1)) {
            ticks.push({
                value: parseFloat(current.toFixed(10)),
                type: isMajor ? 'major' : 'minor'
            });
        }

        current += minorStep;
        iterations++;
    }

    return ticks;
}

/**
 * Snaps a value to the nearest major tick in the current viewport
 */
export function snapToTick(value: number, viewport: Viewport): number {
    const ticks = calculateTicks(viewport);
    const majorTicks = ticks.filter(t => t.type === 'major');
    if (majorTicks.length === 0) return value;

    let closest = majorTicks[0].value;
    let minDiff = Math.abs(value - closest);

    for (let i = 1; i < majorTicks.length; i++) {
        const diff = Math.abs(value - majorTicks[i].value);
        if (diff < minDiff) {
            minDiff = diff;
            closest = majorTicks[i].value;
        }
    }

    return closest;
}

/**
 * Zoom the viewport around a focal point
 */
export function zoomViewport(viewport: Viewport, factor: number, focalPoint?: number): Viewport {
    const range = viewport.max - viewport.min;
    const newRange = range * factor;

    const center = focalPoint !== undefined ? focalPoint : (viewport.min + viewport.max) / 2;

    // How far through the current range is the focal point?
    const focalPercent = (center - viewport.min) / range;

    const newMin = center - (newRange * focalPercent);
    const newMax = newMin + newRange;

    return clampViewport({ min: newMin, max: newMax });
}

/**
 * Enforce minimum/maximum range limits on the viewport
 */
export function clampViewport(viewport: Viewport): Viewport {
    let { min, max } = viewport;
    let range = max - min;

    if (range < MIN_VIEWPORT_RANGE) {
        const center = (min + max) / 2;
        min = center - MIN_VIEWPORT_RANGE / 2;
        max = center + MIN_VIEWPORT_RANGE / 2;
    } else if (range > MAX_VIEWPORT_RANGE) {
        const center = (min + max) / 2;
        min = center - MAX_VIEWPORT_RANGE / 2;
        max = center + MAX_VIEWPORT_RANGE / 2;
    }

    return { min, max };
}
