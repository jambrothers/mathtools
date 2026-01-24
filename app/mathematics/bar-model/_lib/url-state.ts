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

// =============================================================================
// Serialization Helpers
// =============================================================================

/**
 * Serialize bars to a compact string format.
 * Format: "colorIndex:label,x,y,width;colorIndex:label,x,y,width"
 *
 * @param bars - Array of bar data to serialize
 * @returns Compact string representation
 */
export function serializeBars(bars: BarData[]): string {
    if (bars.length === 0) return '';

    return bars.map(bar => {
        const encodedLabel = encodeURIComponent(bar.label);
        return `${bar.colorIndex}:${encodedLabel},${Math.round(bar.x)},${Math.round(bar.y)},${Math.round(bar.width)}`;
    }).join(';');
}

/**
 * Parse a bar string back to BarData array.
 *
 * @param str - The serialized bar string
 * @returns Array of BarData (with generated IDs)
 */
export function parseBarsString(str: string): BarData[] {
    if (!str || str.trim() === '') return [];

    const bars: BarData[] = [];
    const parts = str.split(';');

    for (const part of parts) {
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

            const coords = rest.substring(commaIndex + 1).split(',');
            if (coords.length !== 3) continue;

            const x = parseInt(coords[0], 10);
            const y = parseInt(coords[1], 10);
            const width = parseInt(coords[2], 10);

            if (isNaN(x) || isNaN(y) || isNaN(width)) continue;

            bars.push({
                id: `bar-url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                x,
                y,
                width,
                colorIndex,
                label,
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
