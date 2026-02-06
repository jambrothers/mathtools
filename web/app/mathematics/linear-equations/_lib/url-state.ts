import { URLStateSerializer, serializeBool, deserializeBool } from "@/lib/url-state"
import { LineConfig, LINE_COLORS, DEFAULT_M, DEFAULT_C } from "../constants"

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
 * Serializer for LineConfig array
 * Format: "m,c,color|m,c,color"
 * Color is stored as index if standard, or hex? Let's just store m,c for simplicity and auto-assign colors on load based on index?
 * Or serialize active state too?
 * Let's serialize: "m,c" pairs separated by "|". We will reconstruct IDs and colors on load (deterministic).
 * Actually, to support deleting/adding effectively, we might just want minimal state.
 * 
 * Compact format:
 * lines: "0.5,1|2,0"  (line 1: m=0.5, c=1; line 2: m=2, c=0)
 */
function serializeLines(lines: LineConfig[]): string {
    return lines.map(line => `${Number(line.m.toFixed(2))},${Number(line.c.toFixed(2))}`).join('|')
}

function deserializeLines(value: string | null): LineConfig[] {
    if (!value) {
        return [{
            id: 'line-1',
            m: DEFAULT_M,
            c: DEFAULT_C,
            color: LINE_COLORS[0],
            visible: true
        }]
    }

    try {
        const parts = value.split('|')
        return parts.map((part, index) => {
            const [mStr, cStr] = part.split(',')
            const m = parseFloat(mStr)
            const c = parseFloat(cStr)
            return {
                id: `line-${index + 1}`, // Deterministic IDs based on order
                m: isNaN(m) ? DEFAULT_M : m,
                c: isNaN(c) ? DEFAULT_C : c,
                color: LINE_COLORS[index % LINE_COLORS.length],
                visible: true
            }
        })
    } catch {
        return [{
            id: 'line-1',
            m: DEFAULT_M,
            c: DEFAULT_C,
            color: LINE_COLORS[0],
            visible: true
        }]
    }
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
