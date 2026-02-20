import { fractionWallURLSerializer, FractionWallState, LabelMode } from './url-state';

describe('fraction-wall url-state', () => {
    const defaultState: FractionWallState = {
        visibleDenominators: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        shadedSegments: [],
        labelMode: 'fraction',
        showEquivalenceLines: false,
        comparisonPair: null
    };

    test('serialize default state', () => {
        const params = fractionWallURLSerializer.serialize(defaultState);
        // Default values (except v) are omitted if possible, but keep it simple
        expect(params.toString()).toContain('v=1%3B2%3B3%3B4%3B5%3B6%3B7%3B8%3B9%3B10%3B11%3B12');
    });

    test('round-trip serialization', () => {
        const state: FractionWallState = {
            visibleDenominators: [1, 2, 4, 8],
            shadedSegments: [
                { d: 2, i: 0 },
                { d: 4, i: 1 }
            ],
            labelMode: 'decimal',
            showEquivalenceLines: true,
            comparisonPair: [
                { d: 2, i: 0 },
                { d: 4, i: 2 }
            ]
        };

        const params = fractionWallURLSerializer.serialize(state);
        const restored = fractionWallURLSerializer.deserialize(params);

        expect(restored).toEqual(state);
    });

    test('deserialize empty params returns defaults', () => {
        const params = new URLSearchParams();
        const restored = fractionWallURLSerializer.deserialize(params);
        expect(restored).toEqual(defaultState);
    });

    test('label mode mapping', () => {
        const check = (mode: LabelMode, char: string) => {
            const params = fractionWallURLSerializer.serialize({ ...defaultState, labelMode: mode });
            expect(params.get('l')).toBe(char);
            const restored = fractionWallURLSerializer.deserialize(params);
            expect(restored!.labelMode).toBe(mode);
        };

        check('decimal', 'd');
        check('percent', 'p');
        check('none', 'n');
    });

    // SECURITY TESTS
    describe('security validation', () => {
        it('should ignore dangerously large denominators', () => {
            const params = new URLSearchParams();
            params.set('v', '1000000'); // 1 million rows
            params.set('s', '1000000:1'); // Segment in millionth row
            params.set('c', '1000000:1,2:1'); // Comparison with millionth row

            const state = fractionWallURLSerializer.deserialize(params);

            if (!state) throw new Error('State should not be null');

            // Safe behavior: dangerous values should be filtered out
            expect(state.visibleDenominators).not.toContain(1000000);
            expect(state.visibleDenominators).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

            expect(state.shadedSegments).not.toContainEqual({ d: 1000000, i: 1 });
            expect(state.shadedSegments).toHaveLength(0);

            expect(state.comparisonPair).toBeNull();
        });

        it('should allow valid denominators', () => {
            const params = new URLSearchParams();
            params.set('v', '12');
            params.set('s', '12:0');

            const state = fractionWallURLSerializer.deserialize(params);

            if (!state) throw new Error('State should not be null');

            expect(state.visibleDenominators).toContain(12);
            expect(state.shadedSegments).toContainEqual({ d: 12, i: 0 });
        });

        it('should reject invalid segment indices', () => {
            const params = new URLSearchParams();
            // Denominator 10 has indices 0-9. Index 10 is invalid.
            params.set('s', '10:10');

            const state = fractionWallURLSerializer.deserialize(params);

            if (!state) throw new Error('State should not be null');

            expect(state.shadedSegments).toHaveLength(0);
        });
    });
});
