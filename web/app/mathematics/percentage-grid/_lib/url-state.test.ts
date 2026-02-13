import { percentageGridURLSerializer } from './url-state';

describe('percentageGridURLSerializer', () => {
    it('serializes selected indices to URL params', () => {
        const params = percentageGridURLSerializer.serialize({
            gridMode: '10x10',
            selectedIndices: [0, 5, 42],
            showPanel: true,
            showPercentage: false,
            showDecimal: false,
            showFraction: false,
            simplifyFraction: false,
            showLabels: false,
        });
        expect(params.get('s')).toBe('0;5;42');
        expect(params.get('gm')).toBe('10x10');
    });

    it('deserializes URL params to selected indices', () => {
        const params = new URLSearchParams('gm=10x2&s=0;5;19&p=1&pc=1&dc=0&fr=1&sf=0');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state).not.toBeNull();
        expect(state?.gridMode).toBe('10x2');
        expect(state?.selectedIndices).toEqual([0, 5, 19]);
        expect(state?.showPanel).toBe(true);
        expect(state?.showPercentage).toBe(true);
        expect(state?.showDecimal).toBe(false);
        expect(state?.showFraction).toBe(true);
        expect(state?.simplifyFraction).toBe(false);
        expect(state?.showLabels).toBe(false);
    });

    it('round-trips showLabels', () => {
        const state = {
            gridMode: '10x10' as const,
            selectedIndices: [],
            showPanel: true,
            showPercentage: false,
            showDecimal: false,
            showFraction: false,
            simplifyFraction: false,
            showLabels: true,
        };
        const params = percentageGridURLSerializer.serialize(state);
        const restored = percentageGridURLSerializer.deserialize(params);
        expect(restored?.showLabels).toBe(true);
    });

    it('defaults showLabels to false when missing from URL', () => {
        const params = new URLSearchParams('s=1;2;3');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state?.showLabels).toBe(false);
    });

    it('returns null when no relevant params are present', () => {
        const params = new URLSearchParams('');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state).toBeNull();
    });

    it('filters out invalid indices based on mode', () => {
        // 10x1 mode has 10 cells (0-9). Index 50 is invalid.
        const params = new URLSearchParams('gm=10x1&s=-1;0;50;5');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state?.selectedIndices).toEqual([0, 5]);
    });

    it('defaults display options when missing', () => {
        const params = new URLSearchParams('s=1;2;3');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state?.gridMode).toBe('10x10'); // Default
        expect(state?.showPanel).toBe(true);
        expect(state?.showPercentage).toBe(false);
        expect(state?.showDecimal).toBe(false);
        expect(state?.showFraction).toBe(false);
        expect(state?.simplifyFraction).toBe(false);
        expect(state?.showLabels).toBe(false);
    });
});
