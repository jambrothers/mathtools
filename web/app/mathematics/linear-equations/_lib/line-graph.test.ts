import { calculateLineEndpoints, calculateXIntercept, formatEquation, VIEWPORT } from './line-graph';

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

    // Add more tests for viewport clipping if needed, but the basic logic is standard math
});
