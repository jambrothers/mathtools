/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { useCircuitDesigner } from '@/app/computing/circuit-designer/_hooks/use-circuit-designer';
import { CircuitNode, Connection } from '@/app/computing/circuit-designer/constants';

// Mock useSearchParams
jest.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(),
}));

// Mock constants to have predictable defaults
jest.mock('@/app/computing/circuit-designer/constants', () => {
    const original = jest.requireActual('@/app/computing/circuit-designer/constants');
    return {
        ...original,
        DEFAULT_NODES: [],
        DEFAULT_CONNECTIONS: [],
        // Ensure SNAP_GRID is 20
        SNAP_GRID: 20
    };
});

describe('useCircuitDesigner - Drag Logic', () => {
    beforeEach(() => {
        // Reset mocks and DOM
        jest.clearAllMocks();
    });

    it('should update node position when dragged', () => {
        const { result } = renderHook(() => useCircuitDesigner());

        // 1. Setup environment
        const canvasRect = { left: 0, top: 0, width: 800, height: 600 };
        const canvasEl = document.createElement('div');
        jest.spyOn(canvasEl, 'getBoundingClientRect').mockReturnValue(canvasRect as DOMRect);

        // Assign refs
        // Note: In a real component, React assigns these. In hook tests, we must manually assign if the hook exposes the ref object but not the setter.
        // The hook exposes { canvasRef: { current: ... } }
        (result.current.canvasRef as any).current = canvasEl;

        // 2. Add a node
        act(() => {
            result.current.addNodeAtPosition('INPUT', 100, 100);
        });

        const node = result.current.nodes[0];
        expect(node).toBeDefined();
        const initialX = node.x;
        const initialY = node.y;

        // 3. Start dragging
        act(() => {
            const event = {
                stopPropagation: jest.fn(),
                clientX: 100,
                clientY: 100,
                shiftKey: false
            } as any;
            result.current.handlePointerDownNode(event, node.id);
        });

        expect(result.current.dragging).not.toBeNull();
        expect(result.current.dragging?.id).toBe(node.id);

        // 4. Move mouse (simulate window event)
        // Drag by +40px (2 grid steps)
        act(() => {
            const moveEvent = new MouseEvent('pointermove', {
                clientX: 140,
                clientY: 140,
                bubbles: true
            });
            window.dispatchEvent(moveEvent);
        });

        // 5. Verify position updated
        const updatedNode = result.current.nodes[0];
        // 100 + 40 = 140. Snapped to 20 grid -> 140.
        expect(updatedNode.x).toBe(140);
        expect(updatedNode.y).toBe(140);

        // 6. End drag
        act(() => {
            const upEvent = new MouseEvent('pointerup', {
                bubbles: true
            });
            window.dispatchEvent(upEvent);
        });

        expect(result.current.dragging).toBeNull();
        expect((result.current as any).canUndo).toBe(true);
    });

    it('should support group dragging', () => {
        const { result } = renderHook(() => useCircuitDesigner());
        const canvasEl = document.createElement('div');
        jest.spyOn(canvasEl, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
        (result.current.canvasRef as any).current = canvasEl;

        // Add two nodes
        act(() => {
            result.current.addNodeAtPosition('INPUT', 100, 100); // Node 1
            result.current.addNodeAtPosition('OUTPUT', 200, 200); // Node 2
        });

        const node1 = result.current.nodes[0];
        const node2 = result.current.nodes[1];

        // Select both nodes
        act(() => {
            // Click Node 1
            result.current.handlePointerDownNode({ stopPropagation: jest.fn(), shiftKey: false } as any, node1.id);
        });
        // End drag immediately to just select
        act(() => { window.dispatchEvent(new MouseEvent('pointerup')); });

        act(() => {
            // Shift+Click Node 2
            result.current.handlePointerDownNode({ stopPropagation: jest.fn(), shiftKey: true } as any, node2.id);
        });

        expect(result.current.selectedIds.has(node1.id)).toBe(true);
        expect(result.current.selectedIds.has(node2.id)).toBe(true);

        // Start dragging Node 1
        act(() => {
            result.current.handlePointerDownNode({
                stopPropagation: jest.fn(),
                clientX: 100,
                clientY: 100,
                shiftKey: false // Should maintain selection if clicking already selected node
            } as any, node1.id);
        });

        // Move +20px
        act(() => {
            window.dispatchEvent(new MouseEvent('pointermove', { clientX: 120, clientY: 120 }));
        });

        // Verify both moved
        expect(result.current.nodes[0].x).toBe(120); // 100 + 20
        expect(result.current.nodes[1].x).toBe(220); // 200 + 20
    });

    it('should delete node when dragged to trash', () => {
        const { result } = renderHook(() => useCircuitDesigner());
        const canvasEl = document.createElement('div');
        jest.spyOn(canvasEl, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
        (result.current.canvasRef as any).current = canvasEl;

        // Mock Trash
        const trashEl = document.createElement('div');
        // Trash is at 800, 800 (far away)
        jest.spyOn(trashEl, 'getBoundingClientRect').mockReturnValue({
            left: 800, right: 900, top: 800, bottom: 900,
            width: 100, height: 100, x: 800, y: 800, toJSON: () => { }
        } as DOMRect);
        (result.current.trashRef as any).current = trashEl;

        act(() => {
            result.current.addNodeAtPosition('INPUT', 100, 100);
        });
        const node = result.current.nodes[0];

        // Start dragging
        act(() => {
            result.current.handlePointerDownNode({
                stopPropagation: jest.fn(),
                clientX: 100,
                clientY: 100
            } as any, node.id);
        });

        // Move over trash
        act(() => {
            window.dispatchEvent(new MouseEvent('pointermove', { clientX: 850, clientY: 850 }));
        });

        expect(result.current.isTrashHovered).toBe(true);

        // Drop
        act(() => {
            window.dispatchEvent(new MouseEvent('pointerup'));
        });

        // Node should be gone
        expect(result.current.nodes).toHaveLength(0);
        expect(result.current.isTrashHovered).toBe(false);
    });
});
