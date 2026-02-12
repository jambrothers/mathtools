import { renderHook, act } from '@testing-library/react';
import { useAlgebraTiles } from '@/app/mathematics/algebra-tiles/_hooks/use-algebra-tiles';

// Create a spy for updateState
const updateStateSpy = jest.fn();

// Mock useHistory hook
jest.mock('@/lib/hooks/use-history', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useHistory: (initialState: any) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const [state, setState] = require('react').useState(initialState);
        return {
            state,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pushState: (newState: any) => {
                if (typeof newState === 'function') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setState((prev: any) => newState(prev));
                } else {
                    setState(newState);
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updateState: (newState: any) => {
                updateStateSpy(newState); // Call the spy
                if (typeof newState === 'function') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setState((prev: any) => newState(prev));
                } else {
                    setState(newState);
                }
            },
            undo: jest.fn(),
            redo: jest.fn(),
            canUndo: true,
            canRedo: true,
            beginTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            cancelTransaction: jest.fn(),
        };
    }
}));

describe('useAlgebraTiles Drag Optimization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        updateStateSpy.mockClear();
    });

    it('should NOT update state when dragging a single tile (optimization)', () => {
        const { result } = renderHook(() => useAlgebraTiles());

        // Add a tile
        act(() => {
            result.current.addTile('x', 1);
        });

        const tileId = result.current.tiles[0].id;

        // Select it (implicitly handled in handleDragMove if single, but let's be explicit or just rely on logic)
        // Logic: const idsToMove = isSelected ? ids : new Set([id]);

        // Drag it
        act(() => {
            result.current.handleDragMove(tileId, { x: 10, y: 10 });
        });

        // Expectation: updateState should NOT be called because it's a single tile drag
        // This confirms the optimization: local state handles visual drag, global state update is skipped.
        expect(updateStateSpy).not.toHaveBeenCalled();
    });

    it('should update state when dragging multiple tiles', () => {
        const { result } = renderHook(() => useAlgebraTiles());

        // Add two tiles
        act(() => {
            result.current.addTile('x', 1);
        });
        act(() => {
            result.current.addTile('1', 1);
        });

        const tile1 = result.current.tiles[0].id;
        const tile2 = result.current.tiles[1].id;

        // Select both
        act(() => {
            result.current.handleSelect(tile1, true);
            result.current.handleSelect(tile2, true);
        });

        // Drag tile1
        act(() => {
            result.current.handleDragMove(tile1, { x: 10, y: 10 });
        });

        // Expectation: updateState SHOULD be called
        expect(updateStateSpy).toHaveBeenCalled();
    });
});
