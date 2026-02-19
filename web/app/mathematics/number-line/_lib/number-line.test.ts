import {
    toPixelX,
    fromPixelX,
    calculateTicks,
    formatTickLabel,
    snapToTick,
    zoomViewport,
    clampViewport,
    formatJumpLabel
} from './number-line';

describe('Number Line Core Library', () => {
    const viewport = { min: -10, max: 10 };
    const canvasWidth = 1000;

    describe('Coordinate Mapping', () => {
        it('should map graph values to pixel x-coordinates', () => {
            expect(toPixelX(-10, viewport, canvasWidth)).toBe(0);
            expect(toPixelX(10, viewport, canvasWidth)).toBe(1000);
            expect(toPixelX(0, viewport, canvasWidth)).toBe(500);
        });

        it('should map pixel x-coordinates to graph values', () => {
            expect(fromPixelX(0, viewport, canvasWidth)).toBe(-10);
            expect(fromPixelX(1000, viewport, canvasWidth)).toBe(10);
            expect(fromPixelX(500, viewport, canvasWidth)).toBe(0);
        });
    });

    describe('Tick Calculation', () => {
        it('should calculate integer ticks for -10 to 10 range', () => {
            const ticks = calculateTicks(viewport);
            const majorTicks = ticks.filter(t => t.type === 'major').map(t => t.value);
            expect(majorTicks).toContain(0);
            expect(majorTicks).toContain(-10);
            expect(majorTicks).toContain(10);
            // With range 20, it should pick step 2
            expect(majorTicks).toContain(2);
        });

        it('should calculate decimal ticks when zoomed in', () => {
            const zoomedViewport = { min: 0, max: 1 };
            const ticks = calculateTicks(zoomedViewport);
            expect(ticks.some(t => t.value === 0.1)).toBe(true);
        });
    });

    describe('Formatting', () => {
        it('should format tick labels correctly without trailing zeros', () => {
            expect(formatTickLabel(10)).toBe("10");
            expect(formatTickLabel(0.5)).toBe("0.5");
            expect(formatTickLabel(-1.2)).toBe("-1.2");
        });

        it('should format jump labels with proper plus/minus signs', () => {
            expect(formatJumpLabel(0, 5)).toBe("+5");
            expect(formatJumpLabel(5, 0)).toBe("−5");
            expect(formatJumpLabel(-3, 2)).toBe("+5");
            expect(formatJumpLabel(2, -3)).toBe("−5");
            expect(formatJumpLabel(0, 0.5)).toBe("+0.5");
            expect(formatJumpLabel(0.5, 0)).toBe("−0.5");
            expect(formatJumpLabel(10, 10)).toBe("0");
        });
    });

    describe('Snapping', () => {
        it('should snap values to nearest tick', () => {
            // viewport -10 to 10 -> major step 2. Ticks: ..., 4, 6, ...
            expect(snapToTick(4.1, viewport)).toBe(4);
            expect(snapToTick(5.9, viewport)).toBe(6);

            // For a range that gives step 1
            const unitViewport = { min: 0, max: 10 }; // range 10 -> step 1
            expect(snapToTick(4.9, unitViewport)).toBe(5);
        });
    });

    describe('Viewport Management', () => {
        it('should zoom in around a focal point', () => {
            const zoomed = zoomViewport(viewport, 0.5, 0); // Zoom in 2x at 0
            expect(zoomed.min).toBe(-5);
            expect(zoomed.max).toBe(5);
        });

        it('should clamp viewport range', () => {
            const tinyViewport = { min: 0, max: 0.0000001 };
            const clamped = clampViewport(tinyViewport);
            expect(clamped.max - clamped.min).toBeGreaterThanOrEqual(0.01);
        });
    });
});
