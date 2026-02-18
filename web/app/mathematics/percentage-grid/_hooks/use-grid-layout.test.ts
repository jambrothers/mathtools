import { calculateGridDimensions } from './use-grid-layout';

describe('calculateGridDimensions', () => {
    const PADDING = 48;
    const MAX_WIDTH = 1000;

    it('should fit within max width constraint when ample space is available', () => {
        // Available space: 2000x2000 (huge)
        // Should capture max width (1000) + padding
        const result = calculateGridDimensions(2000, 2000, PADDING, MAX_WIDTH);

        expect(result.width).toBe(1000 + PADDING);
        expect(result.height).toBe(1000 + PADDING); // Square
    });

    it('should be constrained by available width if smaller than max width', () => {
        // Available space: 500x1000 (Small width)
        // Should be (500 - padding) wide
        const availableW = 500;
        const result = calculateGridDimensions(availableW, 1000, PADDING, MAX_WIDTH);

        expect(result.width).toBe(500); // 452 + 48 = 500
        expect(result.height).toBe(500); // Square
    });

    it('should be constrained by available height', () => {
        // Available space: 1000x500 (Short height)
        // Max height for grid is 500 - 48 = 452
        const availableH = 500;
        const result = calculateGridDimensions(1000, availableH, PADDING, MAX_WIDTH);

        expect(result.height).toBe(500);
        expect(result.width).toBe(500); // Square
    });

    // The logic is now content-agnostic (always square), so separate tests for rows/cols are redundant
    // but confirming consistent behavior regardless of potential context is good.
    it('should always return square dimensions', () => {
        const result1 = calculateGridDimensions(2000, 2000, PADDING, MAX_WIDTH);
        expect(result1.width).toBe(result1.height);

        const result2 = calculateGridDimensions(1000, 500, PADDING, MAX_WIDTH);
        expect(result2.width).toBe(result2.height);
    });

    describe('Dual Grid Sizing', () => {
        it('splits width for two grids', () => {
            // Available: 1000 wide
            // PADDING = 48
            // GAP = 24
            // Total Gap = 24
            // Total Chrome = 48 * 2 = 96
            // Available for squares = 1000 - 24 - 96 = 880
            // Per grid squares = 880 / 2 = 440
            // Returned width (per card) = 440 + 48 = 488

            const result = calculateGridDimensions(1000, 1000, PADDING, MAX_WIDTH, 2);
            expect(result.width).toBe(488);
            expect(result.height).toBe(488);
        });

        it('fits side by side at tablet width (768px)', () => {
            // Available: 768
            // Total Gap: 24
            // Total Chrome: 96
            // Available for squares: 768 - 120 = 648
            // Per Grid Squares: 324
            // Per Grid Card: 324 + 48 = 372

            const result = calculateGridDimensions(768, 1000, PADDING, MAX_WIDTH, 2);
            expect(result.width).toBe(372);

            // Check total width constraint
            // 2 * 372 + 24 (gap) = 744 + 24 = 768. Fits exactly.
        });
    });
});
