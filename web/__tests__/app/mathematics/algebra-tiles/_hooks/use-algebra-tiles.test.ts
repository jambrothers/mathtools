import { renderHook, act } from '@testing-library/react';
import { useAlgebraTiles } from '@/app/mathematics/algebra-tiles/_hooks/use-algebra-tiles';
import { TileData } from '@/app/mathematics/algebra-tiles/_hooks/use-algebra-tiles';

// Mock useHistory hook
jest.mock('@/lib/hooks/use-history', () => ({
    useHistory: (initialState: any) => {
        const [state, setState] = require('react').useState(initialState);
        return {
            state,
            pushState: (newState: any) => {
                if (typeof newState === 'function') {
                    setState((prev: any) => newState(prev));
                } else {
                    setState(newState);
                }
            },
            updateState: (newState: any) => {
                if (typeof newState === 'function') {
                    setState((prev: any) => newState(prev));
                } else {
                    setState(newState);
                }
            },
            undo: jest.fn(),
            redo: jest.fn(),
            canUndo: true,
            canRedo: true
        };
    }
}));

describe('useAlgebraTiles', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with empty tiles', () => {
        const { result } = renderHook(() => useAlgebraTiles());
        expect(result.current.tiles).toEqual([]);
        expect(result.current.selectedIds.size).toBe(0);
    });

    describe('addTile', () => {
        it('should add a tile correctly', () => {
            const { result } = renderHook(() => useAlgebraTiles());

            act(() => {
                result.current.addTile('x', 1, 100, 100);
            });

            expect(result.current.tiles).toHaveLength(1);
            expect(result.current.tiles[0]).toMatchObject({
                type: 'x',
                value: 1,
            });
            // Approximate check for coordinates due to random offset
            expect(result.current.tiles[0].x).toBeGreaterThanOrEqual(100);
            expect(result.current.tiles[0].y).toBeGreaterThanOrEqual(100);
        });
    });

    describe('Selection', () => {
        it('should select a single tile', () => {
            const { result } = renderHook(() => useAlgebraTiles());

            act(() => {
                result.current.addTile('x', 1);
            });

            const tileId = result.current.tiles[0].id;

            act(() => {
                result.current.handleSelect(tileId, false);
            });

            expect(result.current.selectedIds.has(tileId)).toBe(true);
            expect(result.current.selectedIds.size).toBe(1);
        });

        it('should toggle selection with multi-select', () => {
            const { result } = renderHook(() => useAlgebraTiles());

            act(() => {
                result.current.addTile('x', 1);
            });
            const tileId = result.current.tiles[0].id;

            act(() => {
                result.current.handleSelect(tileId, true);
            });
            expect(result.current.selectedIds.has(tileId)).toBe(true);

            act(() => {
                result.current.handleSelect(tileId, true);
            });
            expect(result.current.selectedIds.has(tileId)).toBe(false);
        });

        it('should clear selection', () => {
            const { result } = renderHook(() => useAlgebraTiles());
            act(() => { result.current.addTile('x', 1); });
            const tileId = result.current.tiles[0].id;

            act(() => { result.current.handleSelect(tileId, false); });
            expect(result.current.selectedIds.size).toBe(1);

            act(() => { result.current.clearSelection(); });
            expect(result.current.selectedIds.size).toBe(0);
        });
    });

    describe('removeTiles', () => {
        it('should remove specified tiles and update selection', () => {
            const { result } = renderHook(() => useAlgebraTiles());
            act(() => { result.current.addTile('x', 1); });
            const tileId = result.current.tiles[0].id;

            act(() => { result.current.handleSelect(tileId, false); });
            expect(result.current.selectedIds.has(tileId)).toBe(true);

            act(() => { result.current.removeTiles([tileId]); });

            expect(result.current.tiles).toHaveLength(0);
            expect(result.current.selectedIds.has(tileId)).toBe(false);
        });
    });

    describe('Rotations and Flips', () => {
        it('should rotate a tile', () => {
            const { result } = renderHook(() => useAlgebraTiles());
            act(() => { result.current.addTile('x', 1); }); // 'x' rotates to 'x_h'
            const tileId = result.current.tiles[0].id;

            act(() => { result.current.rotateTile(tileId); });

            expect(result.current.tiles[0].type).toBe('x_h');

            act(() => { result.current.rotateTile(tileId); });
            expect(result.current.tiles[0].type).toBe('x');
        });

        it('should flip a tile', () => {
            const { result } = renderHook(() => useAlgebraTiles());
            act(() => { result.current.addTile('x', 1); });
            const tileId = result.current.tiles[0].id;

            act(() => { result.current.flipTile(tileId); });
            expect(result.current.tiles[0].value).toBe(-1);

            act(() => { result.current.flipTile(tileId); });
            expect(result.current.tiles[0].value).toBe(1);
        });
    });

    describe('visualizeEquation', () => {
        it('should create tiles for an equation', () => {
            const { result } = renderHook(() => useAlgebraTiles());

            act(() => {
                result.current.visualizeEquation("2x + 1 = 3");
            });

            // 2x + 1 on left, 3 on right
            // Left: 2 'x', 1 '1'
            // Right: 3 '1'
            // Total: 6 tiles
            expect(result.current.tiles).toHaveLength(6);
            const xTiles = result.current.tiles.filter(t => t.type === 'x');
            const unitTiles = result.current.tiles.filter(t => t.type === '1');

            expect(xTiles).toHaveLength(2);
            expect(unitTiles).toHaveLength(4); // 1 + 3
        });
    });

    describe('simplifyTiles', () => {
        it('should remove pairs of opposite tiles', () => {
            const { result } = renderHook(() => useAlgebraTiles());

            act(() => { result.current.addTile('x', 1, 0, 0); });
            act(() => { result.current.addTile('x', -1, 10, 10); });
            act(() => { result.current.addTile('1', 1, 20, 20); });

            expect(result.current.tiles).toHaveLength(3);

            act(() => {
                result.current.simplifyTiles();
            });

            // x and -x should cancel, leaving 1
            expect(result.current.tiles).toHaveLength(1);
            expect(result.current.tiles[0].type).toBe('1');
        });
    });
});
