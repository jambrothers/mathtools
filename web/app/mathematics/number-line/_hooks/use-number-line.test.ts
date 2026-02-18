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
});
