import {
    simplifyFraction,
    areEquivalent,
    compareFractions,
    getEquivalentFractions,
    fractionToDecimal,
    fractionToPercent,
    getShadedCount
} from './fraction-wall';

describe('fraction-wall logic', () => {
    test('simplifyFraction', () => {
        expect(simplifyFraction(4, 8)).toEqual({ n: 1, d: 2 });
        expect(simplifyFraction(3, 12)).toEqual({ n: 1, d: 4 });
        expect(simplifyFraction(5, 7)).toEqual({ n: 5, d: 7 });
        expect(simplifyFraction(10, 10)).toEqual({ n: 1, d: 1 });
    });

    test('areEquivalent', () => {
        expect(areEquivalent({ n: 1, d: 2 }, { n: 2, d: 4 })).toBe(true);
        expect(areEquivalent({ n: 1, d: 3 }, { n: 4, d: 12 })).toBe(true);
        expect(areEquivalent({ n: 1, d: 2 }, { n: 1, d: 3 })).toBe(false);
    });

    test('compareFractions', () => {
        expect(compareFractions({ n: 1, d: 2 }, { n: 1, d: 3 })).toBe('greater');
        expect(compareFractions({ n: 1, d: 4 }, { n: 1, d: 3 })).toBe('less');
        expect(compareFractions({ n: 2, d: 4 }, { n: 1, d: 2 })).toBe('equal');
    });

    test('getEquivalentFractions', () => {
        const eq = getEquivalentFractions(1, 2, 12);
        expect(eq).toEqual([
            { n: 1, d: 2 },
            { n: 2, d: 4 },
            { n: 3, d: 6 },
            { n: 4, d: 8 },
            { n: 5, d: 10 },
            { n: 6, d: 12 }
        ]);

        expect(getEquivalentFractions(1, 4, 12)).toEqual([
            { n: 1, d: 4 },
            { n: 2, d: 8 },
            { n: 3, d: 12 }
        ]);
    });

    test('fractionToDecimal', () => {
        expect(fractionToDecimal(1, 4)).toBe('0.25');
        expect(fractionToDecimal(1, 2)).toBe('0.5');
        expect(fractionToDecimal(1, 3)).toBe('0.333');
    });

    test('fractionToPercent', () => {
        expect(fractionToPercent(1, 4)).toBe('25%');
        expect(fractionToPercent(1, 2)).toBe('50%');
        expect(fractionToPercent(3, 4)).toBe('75%');
    });

    test('getShadedCount', () => {
        const segments = [
            { d: 4, i: 0 }, { d: 4, i: 1 }, { d: 4, i: 2 },
            { d: 8, i: 0 }
        ];
        expect(getShadedCount(4, segments)).toBe(3);
        expect(getShadedCount(8, segments)).toBe(1);
        expect(getShadedCount(2, segments)).toBe(0);
        expect(getShadedCount(4, [])).toBe(0);
    });
});
