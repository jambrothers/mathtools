/**
 * Algebra Tiles URL state serialization.
 * Implements the generic URLStateSerializer interface for the algebra tiles tool.
 */

import {
    URLStateSerializer,
    serializeBool,
    deserializeBool,
} from '@/lib/url-state';
import { TileData } from '../_hooks/use-algebra-tiles';

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
const PARAM_LABELS = 'lb';
const PARAM_SHOW_Y = 'y';
const PARAM_SNAP = 'sn';

/**
 * Serialize tiles to compact string format.
 * Format: "type:value,x,y;type:value,x,y;..."
 * 
 * @example
 * serializeTiles([
 *   { id: 'abc', type: 'x', value: 1, x: 100, y: 150 },
 *   { id: 'def', type: 'x2', value: -1, x: 200, y: 200 }
 * ])
 * // Returns: "x:1,100,150;x2:-1,200,200"
 */
export function serializeTiles(tiles: TileData[]): string {
    if (tiles.length === 0) return '';

    return tiles.map(t => {
        // Round positions to integers for cleaner URLs
        return `${t.type}:${t.value},${Math.round(t.x)},${Math.round(t.y)}`;
    }).join(';');
}

/**
 * Parse compact tile string back to TileData array.
 * Creates new IDs for each tile.
 * 
 * @param str - The compact tile string (e.g., "x:1,100,150;x2:-1,200,200")
 * @returns Array of TileData objects with generated IDs
 */
export function parseTileString(str: string): TileData[] {
    if (!str || str.trim() === '') return [];

    const tiles: TileData[] = [];
    const parts = str.split(';');

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;

        // Parse "type:value,x,y" format
        const match = part.match(/^([a-z0-9_]+):(-?\d+),(-?\d+),(-?\d+)$/i);
        if (match) {
            const [, type, valueStr, xStr, yStr] = match;
            tiles.push({
                id: Math.random().toString(36).substr(2, 9),
                type,
                value: parseInt(valueStr, 10),
                x: parseInt(xStr, 10),
                y: parseInt(yStr, 10),
            });
        }
    }

    return tiles;
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
        const hasAnyParam = [
            PARAM_TILES, PARAM_LABELS, PARAM_SHOW_Y, PARAM_SNAP
        ].some(key => params.has(key));

        if (!hasAnyParam) {
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
