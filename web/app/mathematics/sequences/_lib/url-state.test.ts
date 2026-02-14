import { sequencesURLSerializer, SequencesURLState } from './url-state';

describe('sequencesURLSerializer', () => {
    const defaultState: SequencesURLState = {
        sequenceType: 'arithmetic',
        a: 2,
        d: 3,
        r: 2,
        d2: 2,
        termCount: 0,
        revealedCount: 0,
        showCounters: true,
        showRule: false,
        showNthTerm: false,
        showConfig: false
    };

    it('serializes and deserializes correctly', () => {
        const params = sequencesURLSerializer.serialize(defaultState);
        const result = sequencesURLSerializer.deserialize(params);
        expect(result).toEqual(defaultState);
    });

    it('handles custom sequence parameters', () => {
        const state: SequencesURLState = {
            ...defaultState,
            sequenceType: 'geometric',
            a: 5,
            r: 1.5,
            termCount: 10,
            revealedCount: 3,
            showRule: true,
            showConfig: true
        };
        const params = sequencesURLSerializer.serialize(state);
        const result = sequencesURLSerializer.deserialize(params);
        expect(result).toEqual(state);
    });

    it('handles quadratic sequences', () => {
        const state: SequencesURLState = {
            ...defaultState,
            sequenceType: 'quadratic',
            a: 0,
            d: 1,
            d2: 2,
            showNthTerm: true
        };
        const params = sequencesURLSerializer.serialize(state);
        const result = sequencesURLSerializer.deserialize(params);
        expect(result).toEqual(state);
    });

    it('returns null for empty params', () => {
        const result = sequencesURLSerializer.deserialize(new URLSearchParams());
        expect(result).toBeNull();
    });

    it('uses defaults for missing values if at least one param is present', () => {
        const params = new URLSearchParams();
        params.set('t', 'arithmetic');
        const result = sequencesURLSerializer.deserialize(params);
        expect(result).not.toBeNull();
        expect(result?.a).toBe(2); // default
        expect(result?.sequenceType).toBe('arithmetic');
        expect(result?.termCount).toBe(0); // new default
    });
});
