import { renderHook, act } from '@testing-library/react';
import { useCircuitDesigner } from '@/app/computing/circuit-designer/_hooks/use-circuit-designer';

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

describe('useCircuitDesigner - Security', () => {
    it('should not add a node with an invalid type via addNode', () => {
        const { result } = renderHook(() => useCircuitDesigner());

        act(() => {
            // @ts-expect-error Testing invalid input
            result.current.addNode('INVALID_TYPE');
        });

        // Should be 0, but will fail if not validated
        expect(result.current.nodes).toHaveLength(0);
    });

    it('should not add a node with an invalid type via addNodeAtPosition', () => {
        const { result } = renderHook(() => useCircuitDesigner());

        act(() => {
            // @ts-expect-error Testing invalid input
            result.current.addNodeAtPosition('INVALID_TYPE', 100, 100);
        });

        // Should be 0, but will fail if not validated
        expect(result.current.nodes).toHaveLength(0);
    });

    it('should protect against Prototype Pollution attacks (e.g. "constructor")', () => {
        const { result } = renderHook(() => useCircuitDesigner());

        // Attempt to exploit prototype properties
        // COMPONENT_TYPES['constructor'] would return the Function constructor (truthy)
        // creating a vulnerability if not checking hasOwnProperty
        act(() => {
            // @ts-expect-error Testing invalid input
            result.current.addNodeAtPosition('constructor', 100, 100);
        });

        expect(result.current.nodes).toHaveLength(0);
    });
});
