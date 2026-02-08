/**
 * Algebra Tiles URL state serialization.
 * Implements the generic URLStateSerializer interface for the algebra tiles tool.
 */

import {
    URLStateSerializer,
    serializeBool,
    deserializeBool,
    serializeList,
    parseList,
    hasAnyParam
} from '@/lib/url-state';
import { TileData } from '../_hooks/use-algebra-tiles';
import { createId } from '@/lib/id';

/**
 * Full state that can be serialized to/from URL
 */
export interface AlgebraTilesURLState {
    tiles: TileData[];
    showLabels: boolean;
    showY: boolean;
    snapToGrid: boolean;
}

// URL Parameter Keys (kept short for compact URLs)
const PARAM_TILES = 't';
const MAX_TILES = 500; // Security limit to prevent DoS
const PARAM_LABELS = 'lb';
const PARAM_SHOW_Y = 'y';
const PARAM_SNAP = 'sn';

/**
 * Serialize tiles to compact string format.
 *
 * Format: `type:value,x,y;...`
 *
 * - Delimiters:
 *   - `;` separates individual tiles.
 *   - `:` separates the type from the properties.
 *   - `,` separates the numeric properties (value, x, y).
 * 
 * @example
 * // x tile (val=1) at 100,150; negative x^2 tile (val=-1) at 200,200
 * "x:1,100,150;x2:-1,200,200"
 */
export function serializeTiles(tiles: TileData[]): string {
    return serializeList(tiles, (t) => {
        // Round positions to integers for cleaner URLs
        return `${t.type}:${t.value},${Math.round(t.x)},${Math.round(t.y)}`;
    });
}

/**
 * Parse compact tile string back to TileData array.
 * 
 * Uses regex `^([a-z0-9_]+):(-?\d+),(-?\d+),(-?\d+)$` to validate each segment.
 * - Group 1: Type (alphanumeric + underscore)
 * - Group 2: Value (integer)
 * - Group 3: X position (integer)
 * - Group 4: Y position (integer)
 *
 * @param str - The compact tile string.
 * @returns Array of TileData objects with newly generated unique IDs.
 */
export function parseTileString(str: string): TileData[] {
    return parseList(str, (part) => {
        // Parse "type:value,x,y" format
        const match = part.match(/^([a-z0-9_]+):(-?\d+),(-?\d+),(-?\d+)$/i);
        if (!match) return null;
        const [, type, valueStr, xStr, yStr] = match;
        return {
            id: createId('tile'),
            type,
            value: parseInt(valueStr, 10),
            x: parseInt(xStr, 10),
            y: parseInt(yStr, 10),
        };
    }, { maxItems: MAX_TILES });
}

/**
 * Algebra Tiles URL state serializer implementation.
 * Use with generateShareableURL() to create shareable links.
 */
export const algebraTilesURLSerializer: URLStateSerializer<AlgebraTilesURLState> = {
    serialize(state: AlgebraTilesURLState): URLSearchParams {
        const params = new URLSearchParams();

        // Only add tiles param if there are tiles
        const tileStr = serializeTiles(state.tiles);
        if (tileStr) {
            params.set(PARAM_TILES, tileStr);
        }

        // Add all settings
        params.set(PARAM_LABELS, serializeBool(state.showLabels));
        params.set(PARAM_SHOW_Y, serializeBool(state.showY));
        params.set(PARAM_SNAP, serializeBool(state.snapToGrid));

        return params;
    },

    deserialize(params: URLSearchParams): AlgebraTilesURLState | null {
        // Handle null/undefined params (e.g., in tests)
        if (!params) {
            return null;
        }

        // Check if there are any relevant params at all
        const hasAny = hasAnyParam(params, [
            PARAM_TILES, PARAM_LABELS, PARAM_SHOW_Y, PARAM_SNAP
        ]);

        if (!hasAny) {
            return null; // No URL state to restore
        }

        return {
            tiles: parseTileString(params.get(PARAM_TILES) ?? ''),
            showLabels: deserializeBool(params.get(PARAM_LABELS), true),
            showY: deserializeBool(params.get(PARAM_SHOW_Y), false),
            snapToGrid: deserializeBool(params.get(PARAM_SNAP), false),
        };
    }
};
