import {
    parseFactor,
    autoPartition,
    buildModel,
    computePartialProducts,
    computeTotal,
    isAlgebraic,
    adjustLastConstant,
    formatTerm
} from '@/app/mathematics/area-model/_lib/area-model-logic';

describe('Area Model Logic', () => {
    describe('parseFactor', () => {
        it('parses simple integers', () => {
            expect(parseFactor('4')).toEqual([{ coefficient: 4 }]);
            expect(parseFactor('23')).toEqual([{ coefficient: 23 }]);
        });

        it('parses explicit partitions', () => {
            expect(parseFactor('20, 3')).toEqual([{ coefficient: 20 }, { coefficient: 3 }]);
            expect(parseFactor('100, 20, 5')).toEqual([
                { coefficient: 100 },
                { coefficient: 20 },
                { coefficient: 5 }
            ]);
        });

        it('parses single variables', () => {
            expect(parseFactor('x')).toEqual([{ coefficient: 1, variable: 'x', exponent: 1 }]);
            expect(parseFactor('a')).toEqual([{ coefficient: 1, variable: 'a', exponent: 1 }]);
        });

        it('parses variables with coefficients', () => {
            expect(parseFactor('2x')).toEqual([{ coefficient: 2, variable: 'x', exponent: 1 }]);
            expect(parseFactor('-3x')).toEqual([{ coefficient: -3, variable: 'x', exponent: 1 }]);
        });

        it('parses algebraic expressions', () => {
            expect(parseFactor('x + 2')).toEqual([
                { coefficient: 1, variable: 'x', exponent: 1 },
                { coefficient: 2 }
            ]);
            expect(parseFactor('2x - 4')).toEqual([
                { coefficient: 2, variable: 'x', exponent: 1 },
                { coefficient: -4 }
            ]);
            expect(parseFactor('x^2 + 5x + 6')).toEqual([
                { coefficient: 1, variable: 'x', exponent: 2 },
                { coefficient: 5, variable: 'x', exponent: 1 },
                { coefficient: 6 }
            ]);
        });

        it('handles garbage input gracefully', () => {
            expect(parseFactor('')).toEqual([]);
            expect(parseFactor('hello')).toEqual([]);
        });
    });

    describe('autoPartition', () => {
        it('partitions numbers by place value', () => {
            expect(autoPartition(4)).toEqual([4]);
            expect(autoPartition(23)).toEqual([20, 3]);
            expect(autoPartition(356)).toEqual([300, 50, 6]);
            expect(autoPartition(100)).toEqual([100]);
            expect(autoPartition(1005)).toEqual([1000, 5]);
        });
    });

    describe('buildModel', () => {
        it('builds a simple 1x1 model', () => {
            const model = buildModel('3', '4', false);
            expect(model.rowTerms).toEqual([{ coefficient: 3 }]);
            expect(model.colTerms).toEqual([{ coefficient: 4 }]);
        });

        it('builds a partitioned model when autoPartition is enabled', () => {
            const model = buildModel('23', '15', true);
            expect(model.rowTerms).toEqual([{ coefficient: 20 }, { coefficient: 3 }]);
            expect(model.colTerms).toEqual([{ coefficient: 10 }, { coefficient: 5 }]);
        });

        it('respects explicit partitions even with autoPartition enabled', () => {
            const model = buildModel('20, 3', '15', true);
            expect(model.rowTerms).toEqual([{ coefficient: 20 }, { coefficient: 3 }]);
            expect(model.colTerms).toEqual([{ coefficient: 10 }, { coefficient: 5 }]);
        });

        it('builds algebraic models', () => {
            const model = buildModel('x + 2', 'x + 3', false);
            expect(model.rowTerms).toEqual([
                { coefficient: 1, variable: 'x', exponent: 1 },
                { coefficient: 2 }
            ]);
            expect(model.colTerms).toEqual([
                { coefficient: 1, variable: 'x', exponent: 1 },
                { coefficient: 3 }
            ]);
        });
    });

    describe('computePartialProducts', () => {
        it('computes products for numeric models', () => {
            const model = buildModel('20, 3', '10, 5', false);
            const products = computePartialProducts(model);
            expect(products).toHaveLength(2);
            expect(products[0]).toEqual([
                { row: 0, col: 0, label: '200', numericValue: 200 },
                { row: 0, col: 1, label: '100', numericValue: 100 }
            ]);
            expect(products[1]).toEqual([
                { row: 1, col: 0, label: '30', numericValue: 30 },
                { row: 1, col: 1, label: '15', numericValue: 15 }
            ]);
        });

        it('computes products for algebraic models', () => {
            const model = buildModel('x + 2', 'x + 3', false);
            const products = computePartialProducts(model);
            expect(products[0][0].label).toBe('x²');
            expect(products[0][1].label).toBe('3x');
            expect(products[1][0].label).toBe('2x');
            expect(products[1][1].label).toBe('6');
        });

        it('handles coefficients and exponents correctly', () => {
            const model = buildModel('2x + 4', '3x + 6', false);
            const products = computePartialProducts(model);
            expect(products[0][0].label).toBe('6x²');
            expect(products[0][1].label).toBe('12x');
            expect(products[1][0].label).toBe('12x');
            expect(products[1][1].label).toBe('24');
        });
    });

    describe('computeTotal', () => {
        it('sums numeric products', () => {
            const model = buildModel('23', '15', true);
            const products = computePartialProducts(model);
            expect(computeTotal(products, model)).toBe('345');
        });

        it('collects like terms for algebraic products', () => {
            const model = buildModel('x + 2', 'x + 3', false);
            const products = computePartialProducts(model);
            expect(computeTotal(products, model)).toBe('x² + 5x + 6');
        });

        it('handles complex algebraic terms', () => {
            const model = buildModel('2x + 4', '3x + 6', false);
            const products = computePartialProducts(model);
            expect(computeTotal(products, model)).toBe('6x² + 24x + 24');
        });
    });

    describe('isAlgebraic', () => {
        it('detects algebraic models', () => {
            expect(isAlgebraic(buildModel('3', '4', false))).toBe(false);
            expect(isAlgebraic(buildModel('x + 2', '5', false))).toBe(true);
        });
    });

    describe('adjustLastConstant', () => {
        it('increments simple integers', () => {
            expect(adjustLastConstant('5', 1)).toBe('6');
            expect(adjustLastConstant('5', -1)).toBe('4');
        });

        it('increments last value in explicit partition', () => {
            expect(adjustLastConstant('20, 3', 1)).toBe('20, 4');
            expect(adjustLastConstant('10, 5, 2', -1)).toBe('10, 5, 1');
        });

        it('increments last constant in algebraic expression', () => {
            expect(adjustLastConstant('2x + 3', 1)).toBe('2x + 4');
            expect(adjustLastConstant('x^2 + 5x - 2', 1)).toBe('x^2 + 5x - 1');
        });

        it('appends constant if factor ends in variable', () => {
            expect(adjustLastConstant('x', 1)).toBe('x + 1');
            expect(adjustLastConstant('2x', -1)).toBe('2x - 1');
        });
    });

    describe('formatTerm', () => {
        it('formats terms correctly', () => {
            expect(formatTerm({ coefficient: 12 })).toBe('12');
            expect(formatTerm({ coefficient: 1, variable: 'x', exponent: 1 })).toBe('x');
            expect(formatTerm({ coefficient: 2, variable: 'x', exponent: 1 })).toBe('2x');
            expect(formatTerm({ coefficient: -1, variable: 'x', exponent: 1 })).toBe('-x');
            expect(formatTerm({ coefficient: 1, variable: 'x', exponent: 2 })).toBe('x²');
            expect(formatTerm({ coefficient: 6, variable: 'x', exponent: 2 })).toBe('6x²');
        });
    });
});
