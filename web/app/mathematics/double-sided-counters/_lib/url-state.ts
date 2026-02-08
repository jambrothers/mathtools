/**
 * Counter-specific URL state serialization.
 * Implements the generic URLStateSerializer interface for the double-sided counters tool.
 */

import {
    URLStateSerializer,
    serializeBool,
    deserializeBool,
    serializeNumber,
    deserializeNumber,
    serializeList,
    parseList,
    hasAnyParam
} from '@/lib/url-state';
import { Counter, SortState, CounterType } from '../_hooks/use-counters';

/**
 * Full state that can be serialized to/from URL
 */
export interface CounterURLState {
    counters: Counter[];
    sortState: SortState;
    isOrdered: boolean;
    isSequentialMode: boolean;
    animSpeed: number;
    showNumberLine: boolean;
    showStats: boolean;
    counterType: CounterType;
}

// URL Parameter Keys (kept short for compact URLs)
const PARAM_COUNTERS = 'c';
const MAX_COUNTERS = 500; // Security limit to prevent DoS
const PARAM_NUMBER_LINE = 'nl';
const PARAM_STATS = 'st';
const PARAM_SLOW_MODE = 'sl';
const PARAM_SPEED = 'sp';
const PARAM_SORT_STATE = 'so';
const PARAM_ORDERED = 'or';
const PARAM_COUNTER_TYPE = 'ct';

/**
 * Serialize counters to compact string format.
 *
 * Format: `type:x,y;...`
 *
 * Legend:
 * - `p`: Positive counter (+1)
 * - `n`: Negative counter (-1)
 * - `x,y`: Integer coordinates
 * 
 * @example
 * // Two positive counters and one negative
 * "p:32,32;p:128,32;n:224,32"
 */
export function serializeCounters(counters: Counter[]): string {
    return serializeList(counters, (c) => {
        const type = c.value > 0 ? 'p' : 'n';
        // Round positions to integers for cleaner URLs
        return `${type}:${Math.round(c.x)},${Math.round(c.y)}`;
    });
}

/**
 * Parse compact counter string back to Counter array.
 * Creates new IDs starting from 0.
 * 
 * @param str - The compact counter string (e.g., "p:32,32;n:128,32")
 * @returns Array of Counter objects with generated IDs
 */
export function parseCounterString(str: string): Counter[] {
    let index = 0;
    return parseList(str, (part) => {
        // Parse "p:x,y" or "n:x,y" format
        const match = part.match(/^([pn]):(-?\d+),(-?\d+)$/);
        if (!match) return null;
        const [, type, xStr, yStr] = match;
        const counter: Counter = {
            id: index,
            value: type === 'p' ? 1 : -1,
            x: parseInt(xStr, 10),
            y: parseInt(yStr, 10),
        };
        index += 1;
        return counter;
    }, { maxItems: MAX_COUNTERS });
}

/**
 * Validate and parse sort state from URL param.
 */
function parseSortState(value: string | null): SortState {
    if (value === 'grouped' || value === 'paired') {
        return value;
    }
    return 'none';
}

/**
 * Validate and parse counter type from URL param.
 * Defaults to 'numeric' for backwards compatibility.
 */
function parseCounterType(value: string | null): CounterType {
    const validTypes: CounterType[] = ['numeric', 'x', 'y', 'z', 'a', 'b', 'c'];
    if (value && validTypes.includes(value as CounterType)) {
        return value as CounterType;
    }
    return 'numeric';
}

/**
 * Counter URL state serializer implementation.
 * Use with generateShareableURL() to create shareable links.
 */
export const counterURLSerializer: URLStateSerializer<CounterURLState> = {
    serialize(state: CounterURLState): URLSearchParams {
        const params = new URLSearchParams();

        // Only add counters param if there are counters
        const counterStr = serializeCounters(state.counters);
        if (counterStr) {
            params.set(PARAM_COUNTERS, counterStr);
        }

        // Add all settings
        params.set(PARAM_NUMBER_LINE, serializeBool(state.showNumberLine));
        params.set(PARAM_STATS, serializeBool(state.showStats));
        params.set(PARAM_SLOW_MODE, serializeBool(state.isSequentialMode));
        params.set(PARAM_ORDERED, serializeBool(state.isOrdered));
        params.set(PARAM_SORT_STATE, state.sortState);

        // Only add speed if slow mode is enabled (for cleaner URLs)
        if (state.isSequentialMode) {
            params.set(PARAM_SPEED, serializeNumber(state.animSpeed));
        }

        // Only add counter type if not numeric (for cleaner backwards-compatible URLs)
        if (state.counterType && state.counterType !== 'numeric') {
            params.set(PARAM_COUNTER_TYPE, state.counterType);
        }

        return params;
    },

    deserialize(params: URLSearchParams): CounterURLState | null {
        // Check if there are any relevant params at all
        const hasAny = hasAnyParam(params, [
            PARAM_COUNTERS, PARAM_NUMBER_LINE, PARAM_STATS,
            PARAM_SLOW_MODE, PARAM_SPEED, PARAM_SORT_STATE, PARAM_ORDERED,
            PARAM_COUNTER_TYPE
        ]);

        if (!hasAny) {
            return null; // No URL state to restore
        }

        return {
            counters: parseCounterString(params.get(PARAM_COUNTERS) ?? ''),
            showNumberLine: deserializeBool(params.get(PARAM_NUMBER_LINE), false),
            showStats: deserializeBool(params.get(PARAM_STATS), true),
            isSequentialMode: deserializeBool(params.get(PARAM_SLOW_MODE), false),
            animSpeed: deserializeNumber(params.get(PARAM_SPEED), 1000),
            sortState: parseSortState(params.get(PARAM_SORT_STATE)),
            isOrdered: deserializeBool(params.get(PARAM_ORDERED), true),
            counterType: parseCounterType(params.get(PARAM_COUNTER_TYPE)),
        };
    }
};
