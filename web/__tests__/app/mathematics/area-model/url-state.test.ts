import { areaModelURLSerializer } from '@/app/mathematics/area-model/_lib/url-state';

describe('Area Model URL State', () => {
    it('serializes state correctly', () => {
        const state = {
            factorA: '20, 3',
            factorB: '15',
            autoPartition: true,
            showFactorLabels: true,
            showPartialProducts: false,
            showTotal: true,
            showGridLines: true,
            showArray: false,
            revealedCells: new Set(['0-0', '1-0'])
        };

        const params = areaModelURLSerializer.serialize(state);
        expect(params.get('a')).toBe('20, 3');
        expect(params.get('b')).toBe('15');
        expect(params.get('ap')).toBe('1');
        expect(params.get('pp')).toBe('0');
        expect(params.get('rc')).toBe('0-0;1-0');
    });

    it('deserializes state correctly', () => {
        const params = new URLSearchParams('a=x%2B1&b=x%2B2&ap=0&fl=1&pp=1&rc=0-0');
        const state = areaModelURLSerializer.deserialize(params);

        expect(state?.factorA).toBe('x+1');
        expect(state?.factorB).toBe('x+2');
        expect(state?.autoPartition).toBe(false);
        expect(state?.revealedCells).toEqual(new Set(['0-0']));
    });

    it('handles empty/invalid params', () => {
        const params = new URLSearchParams('');
        const state = areaModelURLSerializer.deserialize(params);

        expect(state?.factorA).toBe('');
        expect(state?.showFactorLabels).toBe(true); // Default true
    });
});
