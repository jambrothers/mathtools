import { renderHook, act } from '@testing-library/react';
import { useCircuitDesigner } from '@/app/computing/circuit-designer/_hooks/use-circuit-designer';
import { CircuitNode, Connection } from '@/app/computing/circuit-designer/constants';

// Mock useSearchParams
jest.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(),
}));

// Mock constants to have empty defaults for testing
jest.mock('@/app/computing/circuit-designer/constants', () => {
    const original = jest.requireActual('@/app/computing/circuit-designer/constants');
    return {
        ...original,
        DEFAULT_NODES: [],
        DEFAULT_CONNECTIONS: [],
    };
});

describe('useCircuitDesigner - Undo Functionality', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should have initial state with no undo history', () => {
        const { result } = renderHook(() => useCircuitDesigner());

        expect(result.current.nodes).toEqual([]);
        expect(result.current.connections).toEqual([]);
        expect((result.current as any).canUndo).toBe(false);
        expect((result.current as any).canRedo).toBe(false);
    });

    it('should add a node and allow undo', () => {
        const { result } = renderHook(() => useCircuitDesigner());

        act(() => {
            result.current.addNode('INPUT');
        });

        expect(result.current.nodes).toHaveLength(1);
        expect((result.current as any).canUndo).toBe(true);

        act(() => {
            (result.current as any).undo();
        });

        expect(result.current.nodes).toHaveLength(0);
        expect((result.current as any).canUndo).toBe(false);
    });

    it('should allow redo after undo', () => {
        const { result } = renderHook(() => useCircuitDesigner());

        act(() => {
            result.current.addNode('INPUT');
        });

        act(() => {
            (result.current as any).undo();
        });

        expect(result.current.nodes).toHaveLength(0);
        expect((result.current as any).canRedo).toBe(true);

        act(() => {
            (result.current as any).redo();
        });

        expect(result.current.nodes).toHaveLength(1);
    });

    it('should undo multiple actions', () => {
        const { result } = renderHook(() => useCircuitDesigner());

        // Add 3 nodes
        act(() => { result.current.addNode('INPUT'); });
        act(() => { result.current.addNode('OUTPUT'); });
        act(() => { result.current.addNode('AND'); });

        expect(result.current.nodes).toHaveLength(3);

        // Undo 3 times
        act(() => { (result.current as any).undo(); });
        expect(result.current.nodes).toHaveLength(2);

        act(() => { (result.current as any).undo(); });
        expect(result.current.nodes).toHaveLength(1);

        act(() => { (result.current as any).undo(); });
        expect(result.current.nodes).toHaveLength(0);
    });

    it('should undo clearing the canvas', () => {
        const { result } = renderHook(() => useCircuitDesigner());

        act(() => {
            result.current.addNode('INPUT');
            result.current.addNode('OUTPUT');
        });

        expect(result.current.nodes).toHaveLength(2);

        // Clear canvas
        act(() => {
            result.current.confirmClear();
        });

        expect(result.current.nodes).toHaveLength(0);

        // Undo clear
        act(() => {
            (result.current as any).undo();
        });

        expect(result.current.nodes).toHaveLength(2);
    });

    // Note: Testing connections requires simulating mouse events or calling internal handlers
    // which might be harder to test if they depend on specific event structures.
    // For now, testing basic state mutations via exposed methods is sufficient.
});
