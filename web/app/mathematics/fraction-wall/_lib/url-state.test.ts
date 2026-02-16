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
});
