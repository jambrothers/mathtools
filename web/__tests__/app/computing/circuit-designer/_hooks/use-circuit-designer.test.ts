/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
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
    describe('Simulation Logic', () => {
        it('should evaluate NOT gate correctly', () => {
            const { result } = renderHook(() => useCircuitDesigner());

            // Create: Input -> NOT -> Output
            act(() => {
                result.current.loadDemo('NOT');
            });

            // Find parts
            const input = result.current.nodes.find(n => n.type === 'INPUT')!;
            const output = result.current.nodes.find(n => n.type === 'OUTPUT')!;

            // Initial state: Input False -> NOT -> Output True
            expect(result.current.activeSimulation[input.id]).toBe(false);
            expect(result.current.activeSimulation[output.id]).toBe(true);

            // Toggle Input
            act(() => {
                const event = { stopPropagation: jest.fn() } as any;
                result.current.toggleInput(event, input.id);
            });

            // Input True -> NOT -> Output False
            expect(result.current.activeSimulation[input.id]).toBe(true);
            expect(result.current.activeSimulation[output.id]).toBe(false);
        });

        it('should evaluate AND gate correctly', () => {
            const { result } = renderHook(() => useCircuitDesigner());
            act(() => { result.current.loadDemo('AND'); });

            const inputs = result.current.nodes.filter(n => n.type === 'INPUT');
            const output = result.current.nodes.find(n => n.type === 'OUTPUT')!;
            const idA = inputs[0].id;
            const idB = inputs[1].id;

            // 0 AND 0 = 0
            expect(result.current.activeSimulation[output.id]).toBe(false);

            // 1 AND 0 = 0
            act(() => { result.current.toggleInput({ stopPropagation: jest.fn() } as any, idA); });
            expect(result.current.activeSimulation[output.id]).toBe(false);

            // 1 AND 1 = 1
            act(() => { result.current.toggleInput({ stopPropagation: jest.fn() } as any, idB); });
            expect(result.current.activeSimulation[output.id]).toBe(true);
        });
    });

    describe('Wiring', () => {
        it('should create connection between nodes', () => {
            const { result } = renderHook(() => useCircuitDesigner());

            act(() => {
                result.current.addNode('INPUT');
                result.current.addNode('OUTPUT');
            });
            const inputId = result.current.nodes[0].id; // INPUT
            const outputId = result.current.nodes[1].id; // OUTPUT

            // Start wiring from Input
            act(() => {
                const event = { stopPropagation: jest.fn() } as any;
                result.current.startWiring(event, inputId);
            });

            expect(result.current.wiring).toEqual({ nodeId: inputId, portType: 'output' });

            // Complete wiring to Output
            act(() => {
                const event = { stopPropagation: jest.fn() } as any;
                result.current.completeWiring(event, outputId, 0); // Input index 0
            });

            expect(result.current.connections).toHaveLength(1);
            expect(result.current.connections[0]).toMatchObject({
                from: inputId,
                to: outputId,
                inputIndex: 0
            });
            expect(result.current.wiring).toBeNull();
        });
    });

    describe('Truth Table', () => {
        it('should generate truth table for simple circuit', () => {
            const { result } = renderHook(() => useCircuitDesigner());
            act(() => { result.current.loadDemo('AND'); });

            act(() => {
                result.current.generateTruthTable();
            });

            expect(result.current.truthTable).not.toBeNull();
            // AND gate: 4 rows
            expect(result.current.truthTable!.rows).toHaveLength(4);
            // 1, 1 -> 1 (Last row usually if sorted binary)
            // 0, 0 -> 0
        });
    });
});
