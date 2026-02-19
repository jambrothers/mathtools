import { renderHook, act } from '@testing-library/react';
import { useNumberLine } from './use-number-line';

describe('useNumberLine Hook', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useNumberLine());

        expect(result.current.min).toBe(-10);
        expect(result.current.max).toBe(10);
        expect(result.current.points).toEqual([]);
        expect(result.current.arcs).toEqual([]);
        expect(result.current.showLabels).toBe(true);
    });

    it('should add and remove points', () => {
        const { result } = renderHook(() => useNumberLine());

        act(() => {
            // Set range 10 to ensure step is 1, so 5 is a major tick
            result.current.setRange(0, 10);
        });

        act(() => {
            result.current.addPoint(5, 'A');
        });

        expect(result.current.points.length).toBe(1);
        expect(result.current.points[0].value).toBe(5);
        expect(result.current.points[0].label).toBe('A');

        const id = result.current.points[0].id;
        act(() => {
            result.current.removePoint(id);
        });

        expect(result.current.points.length).toBe(0);
    });

    it('should move points and handle snapping', () => {
        const { result } = renderHook(() => useNumberLine());

        act(() => {
            // Set range 10 to ensure major step is 1
            result.current.setRange(0, 10);
            result.current.addPoint(0);
            result.current.setSnapToTicks(true);
        });

        const id = result.current.points[0].id;
        act(() => {
            result.current.movePoint(id, 4.9);
        });

        expect(result.current.points[0].value).toBe(5);

        act(() => {
            result.current.setSnapToTicks(false);
        });
        act(() => {
            result.current.movePoint(id, 4.9);
        });
        expect(result.current.points[0].value).toBe(4.9);
    });

    it('should manage jump arcs', () => {
        const { result } = renderHook(() => useNumberLine());

        act(() => {
            result.current.addPoint(0);
            result.current.addPoint(5);
        });

        const p1 = result.current.points[0].id;
        const p2 = result.current.points[1].id;

        act(() => {
            result.current.addArc(p1, p2, '+5');
        });

        expect(result.current.arcs.length).toBe(1);
        expect(result.current.arcs[0].fromId).toBe(p1);
        expect(result.current.arcs[0].toId).toBe(p2);
        expect(result.current.arcs[0].label).toBe('+5');
    });

    it('should zoom in and out', () => {
        const { result } = renderHook(() => useNumberLine());

        const initialRange = result.current.max - result.current.min;

        act(() => {
            result.current.zoomIn();
        });

        expect(result.current.max - result.current.min).toBeLessThan(initialRange);

        act(() => {
            result.current.zoomOut();
        });

        expect(result.current.max - result.current.min).toBeCloseTo(initialRange);
    });

    it('should manage interaction mode and arc creation via clicks', () => {
        const { result } = renderHook(() => useNumberLine());

        // Initial state
        expect(result.current.interactionMode).toBe('default');
        expect(result.current.pendingArcStart).toBe(null);

        act(() => {
            result.current.addPoint(0);
            result.current.addPoint(5);
        });

        const p1 = result.current.points[0].id;
        const p2 = result.current.points[1].id;

        // Switching mode
        act(() => {
            result.current.setInteractionMode('add-arc');
        });
        expect(result.current.interactionMode).toBe('add-arc');

        // First click sets pending start
        act(() => {
            result.current.handlePointClick(p1);
        });
        expect(result.current.pendingArcStart).toBe(p1);

        // Click same point deselects
        act(() => {
            result.current.handlePointClick(p1);
        });
        expect(result.current.pendingArcStart).toBe(null);

        // Re-select p1, then click p2 to create arc
        act(() => {
            result.current.handlePointClick(p1);
        });
        act(() => {
            result.current.handlePointClick(p2);
        });

        expect(result.current.arcs.length).toBe(1);
        expect(result.current.arcs[0].fromId).toBe(p1);
        expect(result.current.arcs[0].toId).toBe(p2);
        expect(result.current.pendingArcStart).toBe(null);
        // Mode stays active for rapid addition
        expect(result.current.interactionMode).toBe('add-arc');

        // Cancel/reset
        act(() => {
            result.current.reset();
        });
        expect(result.current.interactionMode).toBe('default');
        expect(result.current.pendingArcStart).toBe(null);
    });

    it('should auto-label arcs when no label is provided', () => {
        const { result } = renderHook(() => useNumberLine());

        act(() => {
            result.current.setRange(0, 10); // step 1
        });

        act(() => {
            result.current.addPoint(3);
            result.current.addPoint(10);
        });

        const p1 = result.current.points[0].id;
        const p2 = result.current.points[1].id;

        act(() => {
            result.current.addArc(p1, p2);
        });

        // 10 - 3 = 7
        expect(result.current.arcs[0].label).toBe('+7');
    });

    it('should respect manual label over auto-label', () => {
        const { result } = renderHook(() => useNumberLine());

        act(() => {
            result.current.setRange(0, 10);
        });

        act(() => {
            result.current.addPoint(0);
            result.current.addPoint(10);
        });

        const p1 = result.current.points[0].id;
        const p2 = result.current.points[1].id;

        act(() => {
            result.current.addArc(p1, p2, 'Custom');
        });

        expect(result.current.arcs[0].label).toBe('Custom');
    });

    it('should handle addition of points via line clicks in add-point mode', () => {
        const { result } = renderHook(() => useNumberLine());

        act(() => {
            result.current.setRange(0, 10);
            result.current.setInteractionMode('add-point');
        });

        act(() => {
            result.current.handleLineClick(5.2);
        });

        expect(result.current.points.length).toBe(1);
        expect(result.current.points[0].value).toBe(5); // Snapped by default
    });

    it('should NOT add points via line clicks in default mode', () => {
        const { result } = renderHook(() => useNumberLine());

        act(() => {
            result.current.handleLineClick(5);
        });

        expect(result.current.points.length).toBe(0);
    });
});
