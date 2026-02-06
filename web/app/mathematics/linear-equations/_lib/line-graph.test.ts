import { calculateLineEndpoints, calculateXIntercept, formatEquation, calculateSlopeTriangle, VIEWPORT } from './line-graph';

describe('line-graph math', () => {
    describe('formatEquation', () => {
        it('formats basic equation', () => {
            expect(formatEquation(2, 3)).toBe('y = 2x + 3');
        });

        it('handles negative gradients', () => {
            expect(formatEquation(-2, 3)).toBe('y = -2x + 3');
        });

        it('handles unit gradients', () => {
            expect(formatEquation(1, 3)).toBe('y = x + 3');
            expect(formatEquation(-1, 3)).toBe('y = -x + 3');
        });

        it('handles zero intercept', () => {
            expect(formatEquation(2, 0)).toBe('y = 2x');
        });

        it('handles negative intercept', () => {
            expect(formatEquation(2, -3)).toBe('y = 2x - 3');
        });

        it('handles horizontal lines', () => {
            expect(formatEquation(0, 5)).toBe('y = 5');
        });
    });

    describe('calculateXIntercept', () => {
        it('calculates standard intercept', () => {
            // y = 2x - 4 => 0 = 2x - 4 => x = 2
            expect(calculateXIntercept(2, -4)).toEqual({ x: 2, y: 0 });
        });

        it('returns null for horizontal lines', () => {
            expect(calculateXIntercept(0, 5)).toBeNull();
        });
    });

    describe('calculateSlopeTriangle', () => {
        it('calculates standard triangle with step 1', () => {
            const result = calculateSlopeTriangle(2, 1, 0, 1);
            expect(result).toEqual({
                runStart: { x: 0, y: 1 },
                runEnd: { x: 1, y: 1 },
                riseEnd: { x: 1, y: 3 }
            });
        });

        it('calculates larger triangle with step 2', () => {
            const result = calculateSlopeTriangle(2, 1, 0, 2);
            expect(result).toEqual({
                runStart: { x: 0, y: 1 },
                runEnd: { x: 2, y: 1 },
                riseEnd: { x: 2, y: 5 }
            });
        });

        it('calculates fractional step', () => {
            const result = calculateSlopeTriangle(4, 0, 0, 0.5);
            expect(result).toEqual({
                runStart: { x: 0, y: 0 },
                runEnd: { x: 0.5, y: 0 },
                riseEnd: { x: 0.5, y: 2 }
            });
        });
    });
});
