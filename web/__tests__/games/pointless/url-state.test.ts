import { pointlessURLSerializer, PointlessURLState } from '@/app/games/pointless/_lib/url-state';

describe('Pointless URL State Serializer', () => {
    it('serializes category and parameters correctly', () => {
        const state: PointlessURLState = {
            category: 'factors',
            params: { n: 144 }
        };
        const params = pointlessURLSerializer.serialize(state);
        expect(params.get('c')).toBe('factors');
        expect(params.get('p')).toBe('n:144');
    });

    it('serializes complex parameters correctly', () => {
        const state: PointlessURLState = {
            category: 'multiples-in-range',
            params: { multiplier: 7, min: 50, max: 150 }
        };
        const params = pointlessURLSerializer.serialize(state);
        expect(params.get('c')).toBe('multiples-in-range');
        expect(params.get('p')).toBe('multiplier:7,min:50,max:150');
    });

    it('deserializes category and parameters correctly', () => {
        const params = new URLSearchParams('c=factors&p=n:144');
        const state = pointlessURLSerializer.deserialize(params);
        expect(state).toEqual({
            category: 'factors',
            params: { n: 144 }
        });
    });

    it('deserializes multiple parameters correctly', () => {
        const params = new URLSearchParams('c=multiples-in-range&p=multiplier:7,min:50,max:150');
        const state = pointlessURLSerializer.deserialize(params);
        expect(state).toEqual({
            category: 'multiples-in-range',
            params: { multiplier: 7, min: 50, max: 150 }
        });
    });

    it('returns null for empty params', () => {
        const params = new URLSearchParams();
        const state = pointlessURLSerializer.deserialize(params);
        expect(state).toBeNull();
    });

    it('handles legacy or missing params gracefully', () => {
        const params = new URLSearchParams('c=factors'); // Missing p
        const state = pointlessURLSerializer.deserialize(params);
        expect(state).toEqual({
            category: 'factors',
            params: {}
        });
    });
});
