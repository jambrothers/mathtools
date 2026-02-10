/**
 * URL state serialization for the bar model tool.
 *
 * Provides utilities to serialize bar model state to URL query parameters
 * and deserialize from URL back to state.
 */

import { URLStateSerializer, serializeList, parseList } from '@/lib/url-state';
import { BarData } from '../_hooks/use-bar-model';
import { RelativeDisplayFormat } from '../constants';
import { createId } from '@/lib/id';

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
    return serializeList(bars, (bar) => {
        const encodedLabel = encodeURIComponent(bar.label);

        let flags = 0;
        if (bar.isTotal) flags |= 1;
        if (bar.showRelativeLabel) flags |= 2;

        // Encode display format bits 2-3
        // 0 (00) = total/undefined
        // 1 (01) = fraction
        // 2 (10) = decimal
        // 3 (11) = percentage
        if (bar.displayFormat) {
            let formatBits = 0;
            switch (bar.displayFormat) {
                case 'fraction': formatBits = 1; break;
                case 'decimal': formatBits = 2; break;
                case 'percentage': formatBits = 3; break;
            }
            flags |= (formatBits << 2);
        }

        return `${bar.colorIndex}:${encodedLabel},${Math.round(bar.x)},${Math.round(bar.y)},${Math.round(bar.width)},${flags}`;
    });
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
    return parseList(str, (part) => {
        try {
            // Format: colorIndex:label,x,y,width
            const colonIndex = part.indexOf(':');
            if (colonIndex === -1) return null;

            const colorIndex = parseInt(part.substring(0, colonIndex), 10);
            if (isNaN(colorIndex)) return null;

            const rest = part.substring(colonIndex + 1);
            const commaIndex = rest.indexOf(',');
            if (commaIndex === -1) return null;

            const encodedLabel = rest.substring(0, commaIndex);
            const label = decodeURIComponent(encodedLabel);

            const coordsAndFlags = rest.substring(commaIndex + 1).split(',', 4);
            // We expect at least x,y,width. flags is optional.
            if (coordsAndFlags.length < 3) return null;

            const x = parseInt(coordsAndFlags[0], 10);
            const y = parseInt(coordsAndFlags[1], 10);
            const width = parseInt(coordsAndFlags[2], 10);

            let isTotal = false;
            let showRelativeLabel = false;
            let parsedDisplayFormat: RelativeDisplayFormat | undefined = undefined;

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

                    // Parse display format bits 2-3
                    const formatBits = (flags >> 2) & 3;
                    let displayFormat: RelativeDisplayFormat | undefined = undefined;

                    if (formatBits === 1) displayFormat = 'fraction';
                    else if (formatBits === 2) displayFormat = 'decimal';
                    else if (formatBits === 3) displayFormat = 'percentage';
                    else displayFormat = 'total'; // Default to total/undefined

                    if (formatBits !== 0) {
                        parsedDisplayFormat = displayFormat;
                    } else {
                        parsedDisplayFormat = 'total';
                    }
                }
            }

            if (isNaN(x) || isNaN(y) || isNaN(width)) return null;

            return {
                id: createId('bar'),
                x,
                y,
                width,
                colorIndex,
                label,
                isTotal,
                showRelativeLabel,
                displayFormat: parsedDisplayFormat,
            };
        } catch {
            return null;
        }
    }, { maxItems: MAX_BARS });
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
