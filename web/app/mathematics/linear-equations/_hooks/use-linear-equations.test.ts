import { renderHook, act, waitFor } from '@testing-library/react';
import { useLinearEquations } from './use-linear-equations';
import { MAX_LINES, DEFAULT_M } from '../constants';

// Mock Next.js hooks
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
    useRouter: () => ({ replace: jest.fn() }),
    usePathname: () => '/mathematics/linear-equations',
}));

describe('useLinearEquations', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            value: {
                origin: 'http://localhost:3000',
                pathname: '/mathematics/linear-equations',
            },
            writable: true
        });
    });

    it('initializes with default state', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => {
            expect(result.current.lines).toHaveLength(1);
        });

        expect(result.current.lines[0].m).toBe(DEFAULT_M);
        expect(result.current.activeLineId).toBe('line-1');
        expect(result.current.showGrid).toBe(true);
    });

    it('can add a line', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        act(() => {
            result.current.addLine();
        });

        expect(result.current.lines).toHaveLength(2);
        expect(result.current.activeLineId).not.toBe('line-1'); // Should switch to new line
    });

    it('limits max lines', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        // Add lines up to limit
        for (let i = 0; i < MAX_LINES + 2; i++) {
            act(() => {
                result.current.addLine();
            });
        }

        expect(result.current.lines.length).toBeLessThanOrEqual(MAX_LINES);
    });

    it('can remove a line', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

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

    it('prevents removing the last line', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        act(() => {
            result.current.removeLine(result.current.lines[0].id);
        });

        expect(result.current.lines).toHaveLength(1);
    });

    it('updates line parameters', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        const id = result.current.lines[0].id;

        act(() => {
            result.current.updateLine(id, { m: 5, c: -2 });
        });

        expect(result.current.lines[0].m).toBe(5);
        expect(result.current.lines[0].c).toBe(-2);
    });

    it('applies parallel preset', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        act(() => {
            result.current.applyPreset('parallel');
        });

        expect(result.current.lines).toHaveLength(2);
        // Should have same m
        expect(result.current.lines[1].m).toBe(result.current.lines[0].m);
        // Should have different c
        expect(result.current.lines[1].c).not.toBe(result.current.lines[0].c);
    });

    it('applies perpendicular preset', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        // Set initial line to have m=2 for easy testing
        const id = result.current.lines[0].id;
        act(() => {
            result.current.updateLine(id, { m: 2 });
        });

        act(() => {
            result.current.applyPreset('perpendicular');
        });

        expect(result.current.lines).toHaveLength(2);
        // m1 * m2 = -1 => m2 = -1/2 = -0.5
        expect(result.current.lines[1].m).toBe(-0.5);
    });

    it('regression: adding a line sets it as active correctly', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        act(() => {
            result.current.addLine();
        });

        const newId = result.current.lines[1].id;
        expect(result.current.activeLineId).toBe(newId);
    });

    it('regression: removing the active line switches to another line', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        act(() => {
            result.current.addLine();
        });

        const line2Id = result.current.activeLineId;
        const line1Id = result.current.lines[0].id;

        act(() => {
            result.current.removeLine(line2Id);
        });

        expect(result.current.lines).toHaveLength(1);
        expect(result.current.activeLineId).toBe(line1Id);
    });

    it('regression: getShareableURL returns an absolute URL', async () => {
        const { result } = renderHook(() => useLinearEquations());

        await waitFor(() => expect(result.current.isInitialized).toBe(true));

        const url = result.current.getShareableURL();
        expect(url.startsWith('http://localhost:3000/mathematics/linear-equations')).toBe(true);
        expect(url).toContain('lines=');
    });
});
