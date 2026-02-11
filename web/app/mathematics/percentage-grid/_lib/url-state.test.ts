import { percentageGridURLSerializer } from './url-state';

describe('percentageGridURLSerializer', () => {
    it('serializes selected indices to URL params', () => {
        const params = percentageGridURLSerializer.serialize({
            selectedIndices: [0, 5, 42],
            showPanel: true,
            showPercentage: false,
            showDecimal: false,
            showFraction: false,
            simplifyFraction: false,
        });
        expect(params.get('s')).toBe('0;5;42');
    });

    it('deserializes URL params to selected indices', () => {
        const params = new URLSearchParams('s=0;5;42&p=1&pc=1&dc=0&fr=1&sf=0');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state).not.toBeNull();
        expect(state?.selectedIndices).toEqual([0, 5, 42]);
        expect(state?.showPanel).toBe(true);
        expect(state?.showPercentage).toBe(true);
        expect(state?.showDecimal).toBe(false);
        expect(state?.showFraction).toBe(true);
        expect(state?.simplifyFraction).toBe(false);
    });

    it('returns null when no relevant params are present', () => {
        const params = new URLSearchParams('');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state).toBeNull();
    });

    it('filters out invalid indices', () => {
        const params = new URLSearchParams('s=-1;0;100;50');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state?.selectedIndices).toEqual([0, 50]);
    });

    it('defaults display options when missing', () => {
        const params = new URLSearchParams('s=1;2;3');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state?.showPanel).toBe(true);
        expect(state?.showPercentage).toBe(false);
        expect(state?.showDecimal).toBe(false);
        expect(state?.showFraction).toBe(false);
        expect(state?.simplifyFraction).toBe(false);
    });
});
