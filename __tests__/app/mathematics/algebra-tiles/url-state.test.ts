/**
 * Unit tests for algebra tiles URL state serialization.
 */

import {
    serializeTiles,
    parseTileString,
    algebraTilesURLSerializer,
    AlgebraTilesURLState
} from '@/app/mathematics/algebra-tiles/_lib/url-state';
import { TileData } from '@/app/mathematics/algebra-tiles/_hooks/use-algebra-tiles';

describe('serializeTiles', () => {
    it('should return empty string for empty array', () => {
        expect(serializeTiles([])).toBe('');
    });

    it('should serialize a single tile correctly', () => {
        const tiles: TileData[] = [
            { id: 'abc', type: 'x', value: 1, x: 100, y: 150 }
        ];
        expect(serializeTiles(tiles)).toBe('x:1,100,150');
    });

    it('should serialize multiple tiles separated by semicolons', () => {
        const tiles: TileData[] = [
            { id: 'a', type: 'x', value: 1, x: 100, y: 150 },
            { id: 'b', type: 'x2', value: -1, x: 200, y: 200 }
        ];
        expect(serializeTiles(tiles)).toBe('x:1,100,150;x2:-1,200,200');
    });

    it('should round positions to integers', () => {
        const tiles: TileData[] = [
            { id: 'a', type: '1', value: 1, x: 100.7, y: 50.3 }
        ];
        expect(serializeTiles(tiles)).toBe('1:1,101,50');
    });

    it('should handle horizontal tile types', () => {
        const tiles: TileData[] = [
            { id: 'a', type: 'x_h', value: 1, x: 50, y: 50 },
            { id: 'b', type: 'y_h', value: -1, x: 100, y: 100 }
        ];
        expect(serializeTiles(tiles)).toBe('x_h:1,50,50;y_h:-1,100,100');
    });
});

describe('parseTileString', () => {
    it('should return empty array for empty string', () => {
        expect(parseTileString('')).toEqual([]);
    });

    it('should return empty array for null/undefined input', () => {
        expect(parseTileString(null as unknown as string)).toEqual([]);
    });

    it('should parse a single tile correctly', () => {
        const result = parseTileString('x:1,100,150');
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            type: 'x',
            value: 1,
            x: 100,
            y: 150
        });
        expect(result[0].id).toBeDefined();
    });

    it('should parse multiple tiles', () => {
        const result = parseTileString('x:1,100,150;x2:-1,200,200');
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ type: 'x', value: 1, x: 100, y: 150 });
        expect(result[1]).toMatchObject({ type: 'x2', value: -1, x: 200, y: 200 });
    });

    it('should handle horizontal tile types', () => {
        const result = parseTileString('x_h:1,50,50;y_h:-1,100,100');
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ type: 'x_h', value: 1 });
        expect(result[1]).toMatchObject({ type: 'y_h', value: -1 });
    });

    it('should ignore invalid parts', () => {
        const result = parseTileString('x:1,100,150;invalid;x2:-1,200,200');
        expect(result).toHaveLength(2);
    });
});

describe('algebraTilesURLSerializer', () => {
    describe('serialize', () => {
        it('should serialize empty state', () => {
            const state: AlgebraTilesURLState = {
                tiles: [],
                showLabels: true,
                showY: false,
                snapToGrid: false
            };
            const params = algebraTilesURLSerializer.serialize(state);
            expect(params.get('lb')).toBe('1');
            expect(params.get('y')).toBe('0');
            expect(params.get('sn')).toBe('0');
            expect(params.has('t')).toBe(false);
        });

        it('should serialize tiles and settings', () => {
            const state: AlgebraTilesURLState = {
                tiles: [{ id: 'a', type: 'x', value: 1, x: 100, y: 100 }],
                showLabels: false,
                showY: true,
                snapToGrid: true
            };
            const params = algebraTilesURLSerializer.serialize(state);
            expect(params.get('t')).toBe('x:1,100,100');
            expect(params.get('lb')).toBe('0');
            expect(params.get('y')).toBe('1');
            expect(params.get('sn')).toBe('1');
        });
    });

    describe('deserialize', () => {
        it('should return null for empty params', () => {
            const params = new URLSearchParams();
            expect(algebraTilesURLSerializer.deserialize(params)).toBeNull();
        });

        it('should deserialize tiles and settings', () => {
            const params = new URLSearchParams({
                t: 'x:1,100,100;x2:-1,200,200',
                lb: '0',
                y: '1',
                sn: '1'
            });
            const result = algebraTilesURLSerializer.deserialize(params);
            expect(result).not.toBeNull();
            expect(result!.tiles).toHaveLength(2);
            expect(result!.showLabels).toBe(false);
            expect(result!.showY).toBe(true);
            expect(result!.snapToGrid).toBe(true);
        });

        it('should use defaults for missing settings', () => {
            const params = new URLSearchParams({ t: 'x:1,100,100' });
            const result = algebraTilesURLSerializer.deserialize(params);
            expect(result).not.toBeNull();
            expect(result!.showLabels).toBe(true); // default
            expect(result!.showY).toBe(false); // default
            expect(result!.snapToGrid).toBe(false); // default
        });
    });

    describe('roundtrip', () => {
        it('should roundtrip state correctly', () => {
            const original: AlgebraTilesURLState = {
                tiles: [
                    { id: 'a', type: 'x', value: 1, x: 100, y: 150 },
                    { id: 'b', type: 'x2', value: -1, x: 200, y: 200 },
                    { id: 'c', type: 'y_h', value: 1, x: 50, y: 50 }
                ],
                showLabels: false,
                showY: true,
                snapToGrid: true
            };

            const params = algebraTilesURLSerializer.serialize(original);
            const restored = algebraTilesURLSerializer.deserialize(params);

            expect(restored).not.toBeNull();
            expect(restored!.tiles).toHaveLength(3);
            expect(restored!.tiles[0]).toMatchObject({ type: 'x', value: 1, x: 100, y: 150 });
            expect(restored!.tiles[1]).toMatchObject({ type: 'x2', value: -1, x: 200, y: 200 });
            expect(restored!.tiles[2]).toMatchObject({ type: 'y_h', value: 1, x: 50, y: 50 });
            expect(restored!.showLabels).toBe(false);
            expect(restored!.showY).toBe(true);
            expect(restored!.snapToGrid).toBe(true);
        });
    });
});
