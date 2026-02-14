import { computeSequence, getWordedRule, getNthTermFormula, SequenceType } from './sequences';

describe('sequences logic', () => {
    describe('computeSequence', () => {
        it('computes arithmetic sequences', () => {
            expect(computeSequence('arithmetic', 2, 3, 0, 0, 5)).toEqual([2, 5, 8, 11, 14]);
            expect(computeSequence('arithmetic', 10, -2, 0, 0, 4)).toEqual([10, 8, 6, 4]);
            expect(computeSequence('arithmetic', 0, 0, 0, 0, 3)).toEqual([0, 0, 0]);
        });

        it('computes geometric sequences', () => {
            expect(computeSequence('geometric', 3, 0, 2, 0, 4)).toEqual([3, 6, 12, 24]);
            expect(computeSequence('geometric', 100, 0, 0.5, 0, 3)).toEqual([100, 50, 25]);
            expect(computeSequence('geometric', 5, 0, -1, 0, 3)).toEqual([5, -5, 5]);
        });

        it('computes quadratic sequences', () => {
            // T(n) = n^2
            // 1, 4, 9, 16, 25
            // diffs: 3, 5, 7, 9
            // 2nd diff: 2
            // params: a=1, d1=3, d2=2 (using first term and first difference)
            expect(computeSequence('quadratic', 1, 3, 0, 2, 5)).toEqual([1, 4, 9, 16, 25]);

            // T(n) = 2n^2 + n + 1
            // n=1: 4
            // n=2: 11
            // n=3: 22
            // n=4: 37
            // diffs: 7, 11, 15
            // 2nd diff: 4
            expect(computeSequence('quadratic', 4, 7, 0, 4, 4)).toEqual([4, 11, 22, 37]);
        });
    });

    describe('getWordedRule', () => {
        it('formats arithmetic rules', () => {
            expect(getWordedRule('arithmetic', 3, 2, 0, 0)).toBe('Start at 3, add 2 each term');
            expect(getWordedRule('arithmetic', 5, -1, 0, 0)).toBe('Start at 5, subtract 1 each term');
            expect(getWordedRule('arithmetic', 2, 0, 0, 0)).toBe('Start at 2, add 0 each term');
        });

        it('formats geometric rules', () => {
            expect(getWordedRule('geometric', 2, 0, 3, 0)).toBe('Start at 2, multiply by 3 each term');
            expect(getWordedRule('geometric', 10, 0, 0.5, 0)).toBe('Start at 10, multiply by 0.5 each term');
        });

        it('formats quadratic rules', () => {
            expect(getWordedRule('quadratic', 1, 3, 0, 2)).toBe('A quadratic sequence starting at 1');
        });
    });

    describe('getNthTermFormula', () => {
        it('formats arithmetic nth term', () => {
            // a=3, d=2 -> T(n) = 2n + 1
            expect(getNthTermFormula('arithmetic', 3, 2, 0, 0)).toBe('T(n) = 2n + 1');
            // a=5, d=-1 -> T(n) = -n + 6
            expect(getNthTermFormula('arithmetic', 5, -1, 0, 0)).toBe('T(n) = -n + 6');
            // a=4, d=0 -> T(n) = 4
            expect(getNthTermFormula('arithmetic', 4, 0, 0, 0)).toBe('T(n) = 4');
        });

        it('formats geometric nth term', () => {
            expect(getNthTermFormula('geometric', 2, 0, 3, 0)).toBe('T(n) = 2 × 3ⁿ⁻¹');
            expect(getNthTermFormula('geometric', 1, 0, 2, 0)).toBe('T(n) = 2ⁿ⁻¹');
        });

        it('formats quadratic nth term', () => {
            // T(n) = n^2
            expect(getNthTermFormula('quadratic', 1, 3, 0, 2)).toBe('T(n) = n²');
            // T(n) = 2n^2 + n + 1
            expect(getNthTermFormula('quadratic', 4, 7, 0, 4)).toBe('T(n) = 2n² + n + 1');
        });
    });
});
