import { renderHook, act } from '@testing-library/react';
import { useLinearEquations } from './use-linear-equations';
import { MAX_LINES, DEFAULT_M } from '../constants';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({ replace: jest.fn() }),
    usePathname: () => '/mathematics/linear-equations',
}));

describe('useLinearEquations', () => {
    it('initializes with default state', () => {
        const { result } = renderHook(() => useLinearEquations());

        expect(result.current.lines).toHaveLength(1);
        expect(result.current.lines[0].m).toBe(DEFAULT_M);
        expect(result.current.activeLineId).toBe('line-1');
        expect(result.current.showGrid).toBe(true);
    });

    it('can add a line', () => {
        const { result } = renderHook(() => useLinearEquations());

        act(() => {
            result.current.addLine();
        });

        expect(result.current.lines).toHaveLength(2);
        expect(result.current.activeLineId).not.toBe('line-1'); // Should switch to new line
    });

    it('limits max lines', () => {
        const { result } = renderHook(() => useLinearEquations());

        // Add lines up to limit
        for (let i = 0; i < MAX_LINES + 2; i++) {
            act(() => {
                result.current.addLine();
            });
        }

        expect(result.current.lines.length).toBeLessThanOrEqual(MAX_LINES);
    });

    it('can remove a line', () => {
        const { result } = renderHook(() => useLinearEquations());

        act(() => {
            result.current.addLine();
        });
        expect(result.current.lines).toHaveLength(2);

        const lineToRemove = result.current.lines[1].id;

        act(() => {
            result.current.removeLine(lineToRemove);
        });

        expect(result.current.lines).toHaveLength(1);
    });

    it('prevents removing the last line', () => {
        const { result } = renderHook(() => useLinearEquations());

        act(() => {
            result.current.removeLine(result.current.lines[0].id);
        });

        expect(result.current.lines).toHaveLength(1);
    });

    it('updates line parameters', () => {
        const { result } = renderHook(() => useLinearEquations());
        const id = result.current.lines[0].id;

        act(() => {
            result.current.updateLine(id, { m: 5, c: -2 });
        });

        expect(result.current.lines[0].m).toBe(5);
        expect(result.current.lines[0].c).toBe(-2);
    });

    it('applies parallel preset', () => {
        const { result } = renderHook(() => useLinearEquations());

        act(() => {
            result.current.applyPreset('parallel');
        });

        expect(result.current.lines).toHaveLength(2);
        // Should have same m
        expect(result.current.lines[1].m).toBe(result.current.lines[0].m);
        // Should have different c
        expect(result.current.lines[1].c).not.toBe(result.current.lines[0].c);
    });
});
