import {
    URLStateSerializer,
    serializeList,
    parseList,
    serializeBool,
    deserializeBool
} from '@/lib/url-state';

// Security: Limit maximum denominator to prevent SVG rendering DoS
// The UI only shows up to 12, but we allow up to 20 for advanced usage.
const MAX_DENOMINATOR = 20;

export type LabelMode = 'fraction' | 'decimal' | 'percent' | 'none';

export interface ShadedSegment {
    d: number;
    i: number; // 0-indexed segment index
}

export interface FractionWallState {
    visibleDenominators: number[];
    shadedSegments: ShadedSegment[];
    labelMode: LabelMode;
    showEquivalenceLines: boolean;
    comparisonPair: [ShadedSegment, ShadedSegment] | null;
}

export const fractionWallURLSerializer: URLStateSerializer<FractionWallState> = {
    serialize: (state) => {
        const params = new URLSearchParams();

        if (state.visibleDenominators.length > 0) {
            params.set('v', serializeList(state.visibleDenominators, d => d.toString()));
        }

        if (state.shadedSegments.length > 0) {
            params.set('s', serializeList(state.shadedSegments, s => `${s.d}:${s.i}`));
        }

        if (state.labelMode !== 'fraction') {
            params.set('l', state.labelMode[0]); // f, d, p, n
        }

        if (state.showEquivalenceLines) {
            params.set('e', serializeBool(true));
        }

        if (state.comparisonPair) {
            const [s1, s2] = state.comparisonPair;
            params.set('c', `${s1.d}:${s1.i},${s2.d}:${s2.i}`);
        }

        return params;
    },

    deserialize: (params) => {
        const v = parseList(params.get('v'), p => {
            const d = parseInt(p);
            // Security: Enforce limits
            if (isNaN(d) || d < 1 || d > MAX_DENOMINATOR) return null;
            return d;
        });

        const s = parseList(params.get('s'), p => {
            const [dStr, iStr] = p.split(':');
            const d = parseInt(dStr);
            const i = parseInt(iStr);
            // Security: Enforce limits
            if (isNaN(d) || isNaN(i)) return null;
            if (d < 1 || d > MAX_DENOMINATOR) return null;
            if (i < 0 || i >= d) return null; // Segment index must be valid
            return { d, i };
        });

        const lMode = params.get('l');
        let labelMode: LabelMode = 'fraction';
        if (lMode === 'd') labelMode = 'decimal';
        else if (lMode === 'p') labelMode = 'percent';
        else if (lMode === 'n') labelMode = 'none';

        const showEquivalenceLines = deserializeBool(params.get('e'), false);

        let comparisonPair: [ShadedSegment, ShadedSegment] | null = null;
        const c = params.get('c');
        if (c) {
            const parts = c.split(',');
            if (parts.length === 2) {
                const parseSeg = (p: string): ShadedSegment | null => {
                    const [dStr, iStr] = p.split(':');
                    const d = parseInt(dStr);
                    const i = parseInt(iStr);
                    // Security: Enforce limits
                    if (isNaN(d) || isNaN(i)) return null;
                    if (d < 1 || d > MAX_DENOMINATOR) return null;
                    if (i < 0 || i >= d) return null;
                    return { d, i };
                };
                const s1 = parseSeg(parts[0]);
                const s2 = parseSeg(parts[1]);
                if (s1 && s2) comparisonPair = [s1, s2];
            }
        }

        return {
            visibleDenominators: v.length > 0 ? v : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            shadedSegments: s,
            labelMode,
            showEquivalenceLines,
            comparisonPair
        };
    }
};
