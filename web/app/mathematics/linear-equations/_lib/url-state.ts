import { URLStateSerializer, serializeBool, deserializeBool, parseList } from "@/lib/url-state"
import { LineConfig, LINE_COLORS, DEFAULT_M, DEFAULT_C } from "../constants"

const MAX_LINES = 20; // Security limit to prevent DoS
// Limit split parts to 4 (m, c + 2 future properties like color/style)
const MAX_LINE_PARTS = 4;

/**
 * State interface for the linear equations tool
 */
export interface LinearEquationsState {
    lines: LineConfig[]
    activeLineId: string
    showEquation: boolean
    showIntercepts: boolean
    showSlopeTriangle: boolean
    slopeTriangleSize: number
    showGradientCalculation: boolean
    showGrid: boolean
}

/**
 * Serializer for LineConfig array.
 * 
 * Format: `m,c|m,c|...`
 *
 * Strategy:
 * - Only stores slope (m) and y-intercept (c) for each line.
 * - Uses `|` as the line separator and `,` as the property separator.
 * - Colors and IDs are not stored; they are deterministically regenerated upon deserialization
 *   based on the line's index in the array.
 *
 * @param lines - The list of lines to serialize.
 * @returns Compact string representation.
 */
function serializeLines(lines: LineConfig[]): string {
    return lines.map(line => `${Number(line.m.toFixed(2))},${Number(line.c.toFixed(2))}`).join('|')
}

/**
 * Deserializer for LineConfig array.
 *
 * - Reconstructs lines from `m,c` pairs.
 * - Assigns deterministic IDs (`line-1`, `line-2`, etc.) and colors based on order.
 * - Falls back to a default line if the input string is invalid or empty.
 *
 * @param value - The serialized line string.
 * @returns Reconstructed array of LineConfig objects.
 */
function deserializeLines(value: string | null): LineConfig[] {
    let index = 0;
    const lines = parseList(value, (part) => {
        const [mStr, cStr] = part.split(',', MAX_LINE_PARTS);
        const m = parseFloat(mStr);
        const c = parseFloat(cStr);

        const line: LineConfig = {
            id: `line-${index + 1}`, // Deterministic IDs based on order
            m: isNaN(m) ? DEFAULT_M : m,
            c: isNaN(c) ? DEFAULT_C : c,
            color: LINE_COLORS[index % LINE_COLORS.length],
            visible: true
        };
        index++;
        return line;
    }, { delimiter: '|', maxItems: MAX_LINES });

    if (lines.length === 0) {
        return [{
            id: 'line-1',
            m: DEFAULT_M,
            c: DEFAULT_C,
            color: LINE_COLORS[0],
            visible: true
        }];
    }

    return lines;
}

export const linearEquationsSerializer: URLStateSerializer<LinearEquationsState> = {
    serialize: (state) => {
        const params = new URLSearchParams()

        params.set('lines', serializeLines(state.lines))
        if (state.activeLineId) params.set('active', state.activeLineId)

        params.set('eq', serializeBool(state.showEquation))
        params.set('int', serializeBool(state.showIntercepts))
        params.set('tri', serializeBool(state.showSlopeTriangle))
        params.set('triSize', state.slopeTriangleSize.toString())
        params.set('triCalc', serializeBool(state.showGradientCalculation))
        params.set('grid', serializeBool(state.showGrid))

        return params
    },
    deserialize: (params) => {
        const lines = deserializeLines(params.get('lines'))
        // If active ID is stored but invalid (e.g. line deleted), fallback to first
        const storedActiveId = params.get('active')
        const activeLineId = (storedActiveId && lines.find(l => l.id === storedActiveId))
            ? storedActiveId
            : lines[0].id

        return {
            lines,
            activeLineId,
            showEquation: deserializeBool(params.get('eq'), false),
            showIntercepts: deserializeBool(params.get('int'), false),
            showSlopeTriangle: deserializeBool(params.get('tri'), false),
            slopeTriangleSize: params.get('triSize') ? parseFloat(params.get('triSize')!) : 1,
            showGradientCalculation: deserializeBool(params.get('triCalc'), false),
            showGrid: deserializeBool(params.get('grid'), true)
        }
    }
}
