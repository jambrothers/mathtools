import { calculateGridDimensions } from './use-grid-layout';

describe('calculateGridDimensions', () => {
    const PADDING = 48;
    const MAX_WIDTH = 1000;

    it('should fit within max width constraint when ample space is available', () => {
        // Available space: 2000x2000 (huge)
        // Grid: 10x10 (Square)
        // Should capture max width (1000) + padding
        const result = calculateGridDimensions(2000, 2000, 10, 10, PADDING, MAX_WIDTH);

        expect(result.width).toBe(1000 + PADDING);
        expect(result.height).toBe(1000 + PADDING); // Square
    });

    it('should be constrained by available width if smaller than max width', () => {
        // Available space: 500x1000 (Small width)
        // Grid: 10x10 (Square)
        // Should be (500 - padding) wide
        const availableW = 500;
        const result = calculateGridDimensions(availableW, 1000, 10, 10, PADDING, MAX_WIDTH);

        expect(result.width).toBe(500); // 452 + 48 = 500
        expect(result.height).toBe(500); // Square
    });

    it('should be constrained by available height', () => {
        // Available space: 1000x500 (Short height)
        // Grid: 10x10 (Square)
        // Max height for grid is 500 - 48 = 452
        const availableH = 500;
        const result = calculateGridDimensions(1000, availableH, 10, 10, PADDING, MAX_WIDTH);

        expect(result.height).toBe(500);
        expect(result.width).toBe(500); // Square
    });

    it('should handle non-square aspect ratios (Wide 20x10)', () => {
        // Grid: 20 cols, 10 rows (2:1 ratio)
        // Available: 2000x2000
        // Max width 1000 triggers.
        // Grid Width = 1000. Grid Height = 500.
        const result = calculateGridDimensions(2000, 2000, 10, 20, PADDING, MAX_WIDTH);

        expect(result.width).toBe(1000 + PADDING);
        expect(result.height).toBe(500 + PADDING);
    });

    it('should handle non-square aspect ratios (Tall 10x20)', () => {
        // Grid: 10 cols, 20 rows (1:2 ratio)
        // Available: 1000x1000
        // Max Width 1000? No, height will be bottleneck.
        // Max Grid Height = 1000 - 48 = 952.
        // Grid Width = 952 / 2 = 476.
        const result = calculateGridDimensions(1000, 1000, 20, 10, PADDING, MAX_WIDTH);

        expect(result.height).toBe(1000);
        expect(result.width).toBe(476 + PADDING);
    });
});
