/**
 * Unit tests for bar model URL state serialization.
 */

import {
    serializeBars,
    parseBarsString,
    barModelURLSerializer,
    BarModelURLState
} from '@/app/mathematics/bar-model/_lib/url-state';
import { BarData } from '@/app/mathematics/bar-model/_hooks/use-bar-model';

describe('serializeBars', () => {
    it('should return empty string for empty array', () => {
        expect(serializeBars([])).toBe('');
    });

    it('should serialize a single bar correctly', () => {
        const bars: BarData[] = [
            { id: 'abc', x: 100, y: 150, width: 200, colorIndex: 0, label: '1' }
        ];
        expect(serializeBars(bars)).toBe('0:1,100,150,200');
    });

    it('should serialize multiple bars separated by semicolons', () => {
        const bars: BarData[] = [
            { id: 'a', x: 100, y: 100, width: 100, colorIndex: 0, label: '1' },
            { id: 'b', x: 200, y: 100, width: 150, colorIndex: 1, label: 'x' }
        ];
        expect(serializeBars(bars)).toBe('0:1,100,100,100;1:x,200,100,150');
    });

    it('should round positions to integers', () => {
        const bars: BarData[] = [
            { id: 'a', x: 100.7, y: 50.3, width: 99.8, colorIndex: 2, label: 'y' }
        ];
        expect(serializeBars(bars)).toBe('2:y,101,50,100');
    });

    it('should URL-encode special characters in labels', () => {
        const bars: BarData[] = [
            { id: 'a', x: 100, y: 100, width: 100, colorIndex: 3, label: '½' }
        ];
        const result = serializeBars(bars);
        expect(result).toContain('3:');
        // The label should be encoded
    });

    it('should handle empty labels', () => {
        const bars: BarData[] = [
            { id: 'a', x: 100, y: 100, width: 100, colorIndex: 3, label: '' }
        ];
        expect(serializeBars(bars)).toBe('3:,100,100,100');
    });
});

describe('parseBarsString', () => {
    it('should return empty array for empty string', () => {
        expect(parseBarsString('')).toEqual([]);
    });

    it('should return empty array for null/undefined input', () => {
        expect(parseBarsString(null as unknown as string)).toEqual([]);
    });

    it('should parse a single bar correctly', () => {
        const result = parseBarsString('0:1,100,150,200');
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            x: 100,
            y: 150,
            width: 200,
            colorIndex: 0,
            label: '1'
        });
        expect(result[0].id).toBeDefined();
    });

    it('should parse multiple bars', () => {
        const result = parseBarsString('0:1,100,100,100;1:x,200,100,150');
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ colorIndex: 0, label: '1', x: 100 });
        expect(result[1]).toMatchObject({ colorIndex: 1, label: 'x', x: 200 });
    });

    it('should handle empty labels', () => {
        const result = parseBarsString('3:,100,100,100');
        expect(result).toHaveLength(1);
        expect(result[0].label).toBe('');
    });

    it('should handle URL-encoded labels', () => {
        const result = parseBarsString('0:%C2%BD,100,100,100'); // ½ encoded
        expect(result).toHaveLength(1);
        expect(result[0].label).toBe('½');
    });

    it('should ignore invalid parts', () => {
        const result = parseBarsString('0:1,100,100,100;invalid;1:x,200,100,150');
        expect(result).toHaveLength(2);
    });
});

describe('barModelURLSerializer', () => {
    describe('serialize', () => {
        it('should serialize empty state', () => {
            const state: BarModelURLState = { bars: [] };
            const params = barModelURLSerializer.serialize(state);
            expect(params.has('b')).toBe(false);
        });

        it('should serialize bars', () => {
            const state: BarModelURLState = {
                bars: [{ id: 'a', x: 100, y: 100, width: 100, colorIndex: 0, label: '1' }]
            };
            const params = barModelURLSerializer.serialize(state);
            expect(params.get('b')).toBe('0:1,100,100,100');
        });
    });

    describe('deserialize', () => {
        it('should return null for empty params', () => {
            const params = new URLSearchParams();
            expect(barModelURLSerializer.deserialize(params)).toBeNull();
        });

        it('should deserialize bars', () => {
            const params = new URLSearchParams({
                b: '0:1,100,100,100;1:x,200,100,150'
            });
            const result = barModelURLSerializer.deserialize(params);
            expect(result).not.toBeNull();
            expect(result!.bars).toHaveLength(2);
        });
    });

    describe('roundtrip', () => {
        it('should roundtrip state correctly', () => {
            const original: BarModelURLState = {
                bars: [
                    { id: 'a', x: 100, y: 150, width: 200, colorIndex: 0, label: '1' },
                    { id: 'b', x: 200, y: 200, width: 100, colorIndex: 1, label: 'x' },
                    { id: 'c', x: 50, y: 50, width: 120, colorIndex: 5, label: 'Total' }
                ]
            };

            const params = barModelURLSerializer.serialize(original);
            const restored = barModelURLSerializer.deserialize(params);

            expect(restored).not.toBeNull();
            expect(restored!.bars).toHaveLength(3);
            expect(restored!.bars[0]).toMatchObject({ x: 100, y: 150, width: 200, colorIndex: 0, label: '1' });
            expect(restored!.bars[1]).toMatchObject({ x: 200, y: 200, width: 100, colorIndex: 1, label: 'x' });
            expect(restored!.bars[2]).toMatchObject({ x: 50, y: 50, width: 120, colorIndex: 5, label: 'Total' });
        });

        it('should handle special characters in labels', () => {
            const original: BarModelURLState = {
                bars: [
                    { id: 'a', x: 100, y: 100, width: 100, colorIndex: 0, label: '½' },
                    { id: 'b', x: 200, y: 100, width: 100, colorIndex: 1, label: '⅓' }
                ]
            };

            const params = barModelURLSerializer.serialize(original);
            const restored = barModelURLSerializer.deserialize(params);

            expect(restored).not.toBeNull();
            expect(restored!.bars[0].label).toBe('½');
            expect(restored!.bars[1].label).toBe('⅓');
        });
    });
});
