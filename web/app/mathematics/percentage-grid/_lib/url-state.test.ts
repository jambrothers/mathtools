import { percentageGridURLSerializer } from './url-state';

describe('percentageGridURLSerializer', () => {
    it('serializes selected indices to URL params', () => {
        const params = percentageGridURLSerializer.serialize({ selectedIndices: [0, 5, 42] });
        expect(params.get('s')).toBe('0;5;42');
    });

    it('deserializes URL params to selected indices', () => {
        const params = new URLSearchParams('s=0;5;42');
        const state = percentageGridURLSerializer.deserialize(params);
        expect(state).not.toBeNull();
        expect(state?.selectedIndices).toEqual([0, 5, 42]);
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
});
