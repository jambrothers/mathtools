import { rectsIntersect, selectIdsByRect, RectBounds } from '../../lib/selection';

describe('Selection Utilities', () => {
    describe('rectsIntersect', () => {
        it('should return true when rectangles overlap', () => {
            const rect1: RectBounds = { left: 0, top: 0, right: 10, bottom: 10 };
            const rect2: RectBounds = { left: 5, top: 5, right: 15, bottom: 15 };
            expect(rectsIntersect(rect1, rect2)).toBe(true);
        });

        it('should return true when one rectangle is inside another', () => {
            const outer: RectBounds = { left: 0, top: 0, right: 20, bottom: 20 };
            const inner: RectBounds = { left: 5, top: 5, right: 15, bottom: 15 };
            expect(rectsIntersect(outer, inner)).toBe(true);
            expect(rectsIntersect(inner, outer)).toBe(true);
        });

        it('should return false when rectangles are completely separate', () => {
            const rect1: RectBounds = { left: 0, top: 0, right: 10, bottom: 10 };
            const rect2: RectBounds = { left: 20, top: 20, right: 30, bottom: 30 };
            expect(rectsIntersect(rect1, rect2)).toBe(false);
        });

        it('should return true when rectangles touch at the edge', () => {
            // Because the logic is `!(a.right < b.left ...)`
            // If a.right (10) == b.left (10), then 10 < 10 is false, so it returns true.
            const rect1: RectBounds = { left: 0, top: 0, right: 10, bottom: 10 };
            const rect2: RectBounds = { left: 10, top: 0, right: 20, bottom: 10 };
            expect(rectsIntersect(rect1, rect2)).toBe(true);
        });

        it('should return true when rectangles touch at the corner', () => {
            const rect1: RectBounds = { left: 0, top: 0, right: 10, bottom: 10 };
            const rect2: RectBounds = { left: 10, top: 10, right: 20, bottom: 20 };
            expect(rectsIntersect(rect1, rect2)).toBe(true);
        });
    });

    describe('selectIdsByRect', () => {
        interface TestItem {
            id: string;
            x: number;
            y: number;
            width: number;
            height: number;
        }

        const items: TestItem[] = [
            { id: '1', x: 0, y: 0, width: 10, height: 10 },    // Top-left
            { id: '2', x: 20, y: 0, width: 10, height: 10 },   // Top-right
            { id: '3', x: 0, y: 20, width: 10, height: 10 },   // Bottom-left
            { id: '4', x: 20, y: 20, width: 10, height: 10 },  // Bottom-right
        ];

        const getBounds = (item: TestItem): RectBounds => ({
            left: item.x,
            top: item.y,
            right: item.x + item.width,
            bottom: item.y + item.height,
        });

        const getId = (item: TestItem) => item.id;

        it('should select items intersecting with the selection rect', () => {
            // Selection rect covers item 1 and partially item 2
            const selectionRect = { x: 0, y: 0, width: 25, height: 15 } as DOMRect;

            const result = selectIdsByRect(items, selectionRect, getBounds, getId);

            expect(result.has('1')).toBe(true);
            expect(result.has('2')).toBe(true);
            expect(result.has('3')).toBe(false);
            expect(result.has('4')).toBe(false);
        });

        it('should select all items if selection rect covers everything', () => {
            const selectionRect = { x: -10, y: -10, width: 100, height: 100 } as DOMRect;
            const result = selectIdsByRect(items, selectionRect, getBounds, getId);
            expect(result.size).toBe(4);
        });

        it('should select nothing if selection rect is far away', () => {
            const selectionRect = { x: 100, y: 100, width: 10, height: 10 } as DOMRect;
            const result = selectIdsByRect(items, selectionRect, getBounds, getId);
            expect(result.size).toBe(0);
        });

        it('should handle empty item list', () => {
            const selectionRect = { x: 0, y: 0, width: 100, height: 100 } as DOMRect;
            const result = selectIdsByRect([], selectionRect, getBounds, getId);
            expect(result.size).toBe(0);
        });
    });
});
