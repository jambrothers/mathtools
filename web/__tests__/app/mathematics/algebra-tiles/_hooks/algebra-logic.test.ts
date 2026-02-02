import {
    parseExpression,
    groupTilesLogic,
    simplifyTilesLogic,
    getBaseType,
    getRotatedType
} from '@/app/mathematics/algebra-tiles/_hooks/algebra-logic';
import { TileData } from '@/app/mathematics/algebra-tiles/_hooks/use-algebra-tiles';

describe('Algebra Logic', () => {
    describe('parseExpression', () => {
        it('should parse simple expressions', () => {
            const result = parseExpression('2x + 1');
            expect(result.x).toEqual([1, 1]); // Two positive x
            expect(result['1']).toEqual([1]); // One positive 1
        });

        it('should parse negative coefficients', () => {
            const result = parseExpression('-2x - 3');
            expect(result.x).toEqual([-1, -1]);
            expect(result['1']).toEqual([-1, -1, -1]);
        });

        it('should parse squared terms', () => {
            const result = parseExpression('x^2 - y^2');
            expect(result.x2).toEqual([1]);
            expect(result.y2).toEqual([-1]);
        });

        it('should handle xy terms', () => {
            const result = parseExpression('3xy');
            expect(result.xy).toEqual([1, 1, 1]);
        });

        it('should handle complex expressions', () => {
            const result = parseExpression('x^2 + 2x + 1');
            expect(result.x2).toEqual([1]);
            expect(result.x).toEqual([1, 1]);
            expect(result['1']).toEqual([1]);
        });

        it('should handle empty or whitespace strings', () => {
            const result = parseExpression('   ');
            expect(result.x).toEqual([]);
        });
    });

    describe('getBaseType', () => {
        it('should return base type for rotated tiles', () => {
            expect(getBaseType('x_h')).toBe('x');
            expect(getBaseType('y_h')).toBe('y');
            expect(getBaseType('xy_h')).toBe('xy');
        });

        it('should return same type for standard tiles', () => {
            expect(getBaseType('x')).toBe('x');
            expect(getBaseType('1')).toBe('1');
        });
    });

    describe('getRotatedType', () => {
        it('should toggle rotation for rectangular tiles', () => {
            expect(getRotatedType('x')).toBe('x_h');
            expect(getRotatedType('x_h')).toBe('x');
            expect(getRotatedType('y')).toBe('y_h');
            expect(getRotatedType('y_h')).toBe('y');
        });

        it('should not rotate square tiles', () => {
            expect(getRotatedType('1')).toBe('1');
            expect(getRotatedType('x2')).toBe('x2');
        });
    });

    describe('simplifyTilesLogic', () => {
        it('should remove opposite pairs', () => {
            const tiles: TileData[] = [
                { id: '1', type: 'x', value: 1, x: 0, y: 0 },
                { id: '2', type: 'x', value: -1, x: 0, y: 0 },
                { id: '3', type: '1', value: 1, x: 0, y: 0 }
            ];

            const simplified = simplifyTilesLogic(tiles);
            expect(simplified).toHaveLength(1);
            expect(simplified[0].id).toBe('3');
        });

        it('should handle rotated opposite pairs', () => {
            const tiles: TileData[] = [
                { id: '1', type: 'x', value: 1, x: 0, y: 0 },
                { id: '2', type: 'x_h', value: -1, x: 0, y: 0 } // x and x_h should cancel if logic normalizes them
            ];

            // Logic uses `getBaseType` so they SHOULD cancel if implementation is correct
            const simplified = simplifyTilesLogic(tiles);
            expect(simplified).toHaveLength(0);
        });

        it('should keep unmatched tiles', () => {
            const tiles: TileData[] = [
                { id: '1', type: 'x', value: 1, x: 0, y: 0 },
                { id: '2', type: 'x', value: 1, x: 0, y: 0 }, // Same sign, keep both
            ];
            const simplified = simplifyTilesLogic(tiles);
            expect(simplified).toHaveLength(2);
        });
    });

    describe('groupTilesLogic', () => {
        it('should sort tiles by type', () => {
            const tiles: TileData[] = [
                { id: '1', type: '1', value: 1, x: 0, y: 0 },
                { id: '2', type: 'x2', value: 1, x: 0, y: 0 },
                { id: '3', type: 'x', value: 1, x: 0, y: 0 }
            ];

            // Order: x2, y2, xy, x, y, 1
            const grouped = groupTilesLogic(tiles);

            expect(grouped[0].type).toBe('x2');
            expect(grouped[1].type).toBe('x');
            expect(grouped[2].type).toBe('1');
        });

        it('should reposition tiles', () => {
            const tiles: TileData[] = [
                { id: '1', type: 'x', value: 1, x: 0, y: 0 },
                { id: '2', type: 'x', value: 1, x: 0, y: 0 }
            ];

            const grouped = groupTilesLogic(tiles, 50, 50);

            // First tile at startX, startY
            expect(grouped[0].x).toBe(50);
            expect(grouped[0].y).toBe(50);

            // Second tile shifted right
            expect(grouped[1].x).toBeGreaterThan(50);
            expect(grouped[1].y).toBe(50);
        });
    });
});
