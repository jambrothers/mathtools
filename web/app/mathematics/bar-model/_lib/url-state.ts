/**
 * URL state serialization for the bar model tool.
 *
 * Provides utilities to serialize bar model state to URL query parameters
 * and deserialize from URL back to state.
 */

import { URLStateSerializer } from '@/lib/url-state';
import { BarData } from '../_hooks/use-bar-model';

// =============================================================================
// Types
// =============================================================================

export interface BarModelURLState {
    bars: BarData[];
}

const MAX_BARS = 50; // Security limit to prevent DoS

// =============================================================================
// Serialization Helpers
// =============================================================================

/**
 * Serialize bars to a compact string format.
 *
 * Format: `colorIndex:label,x,y,width;...`
 *
 * Important:
 * - Labels are `encodeURIComponent`'d to prevent delimiter conflicts (e.g. if label contains `,` or `;`).
 * - Coordinates are rounded to integers to save space.
 *
 * @param bars - Array of bar data to serialize.
 * @returns Compact string representation using `;` as the item delimiter.
 */
export function serializeBars(bars: BarData[]): string {
    if (bars.length === 0) return '';

    return bars.map(bar => {
        const encodedLabel = encodeURIComponent(bar.label);

        let flags = 0;
        if (bar.isTotal) flags |= 1;
        if (bar.showRelativeLabel) flags |= 2;

        // If flags is 0, we can omit it to keep URL short (optional, but let's be explicit for now for consistency)
        // Actually, to keep it backward compatible/cleaner, let's just always append it if > 0, 
        // or we can append it always. The parsing logic needs to handle optionality.
        // Let's append it always for simplicity in parsing for now, or use a specific format.
        // Current format: colorIndex:label,x,y,width
        // New format: colorIndex:label,x,y,width,flags

        return `${bar.colorIndex}:${encodedLabel},${Math.round(bar.x)},${Math.round(bar.y)},${Math.round(bar.width)},${flags}`;
    }).join(';');
}

/**
 * Parse a bar string back to BarData array.
 *
 * Logic:
 * - Splits string by `;` to get individual bar segments.
 * - Parses each segment using the `colorIndex:label,x,y,width` schema.
 * - Decodes the label using `decodeURIComponent`.
 * - Generates a new unique ID for each bar to avoid collisions on reload.
 *
 * @param str - The serialized bar string.
 * @returns Array of BarData objects.
 */
export function parseBarsString(str: string): BarData[] {
    if (!str || str.trim() === '') return [];

    const bars: BarData[] = [];
    const parts = str.split(';');

    for (const part of parts) {
        if (bars.length >= MAX_BARS) break;
        try {
            // Format: colorIndex:label,x,y,width
            const colonIndex = part.indexOf(':');
            if (colonIndex === -1) continue;

            const colorIndex = parseInt(part.substring(0, colonIndex), 10);
            if (isNaN(colorIndex)) continue;

            const rest = part.substring(colonIndex + 1);
            const commaIndex = rest.indexOf(',');
            if (commaIndex === -1) continue;

            const encodedLabel = rest.substring(0, commaIndex);
            const label = decodeURIComponent(encodedLabel);

            const coordsAndFlags = rest.substring(commaIndex + 1).split(',');
            // We expect at least x,y,width. flags is optional.
            if (coordsAndFlags.length < 3) continue;

            const x = parseInt(coordsAndFlags[0], 10);
            const y = parseInt(coordsAndFlags[1], 10);
            const width = parseInt(coordsAndFlags[2], 10);

            let isTotal = false;
            let showRelativeLabel = false;

            if (coordsAndFlags.length >= 4) {
                const flags = parseInt(coordsAndFlags[3], 10);
                if (!isNaN(flags)) {
                    const hasIsTotal = (flags & 1) !== 0;
                    const hasShowRelativeLabel = (flags & 2) !== 0;

                    // Handled incompatible flags: if both set, ignore both
                    if (hasIsTotal && hasShowRelativeLabel) {
                        isTotal = false;
                        showRelativeLabel = false;
                    } else {
                        isTotal = hasIsTotal;
                        showRelativeLabel = hasShowRelativeLabel;
                    }
                }
            }

            if (isNaN(x) || isNaN(y) || isNaN(width)) continue;

            bars.push({
                id: `bar-url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                x,
                y,
                width,
                colorIndex,
                label,
                isTotal,
                showRelativeLabel,
            });
        } catch {
            // Skip invalid parts
            continue;
        }
    }

    return bars;
}

// =============================================================================
// URL Serializer
// =============================================================================

/**
 * URL state serializer for the bar model tool.
 */
export const barModelURLSerializer: URLStateSerializer<BarModelURLState> = {
    serialize(state: BarModelURLState): URLSearchParams {
        const params = new URLSearchParams();

        if (state.bars.length > 0) {
            params.set('b', serializeBars(state.bars));
        }

        return params;
    },

    deserialize(params: URLSearchParams): BarModelURLState | null {
        const barsStr = params.get('b');

        // If no bar data, return null
        if (!barsStr) return null;

        const bars = parseBarsString(barsStr);

        return { bars };
    },
};
