
import { renderHook, act } from '@testing-library/react';
import { useBarModel } from '@/app/mathematics/bar-model/_hooks/use-bar-model';

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

describe('useBarModel New Features', () => {
    it('should split bars without adding default labels', () => {
        const { result } = renderHook(() => useBarModel());

        act(() => {
            result.current.addBar(0, 0, 0, 'Original');
        });

        const id = result.current.bars[0].id;

        act(() => {
            result.current.selectBar(id, false);
        });

        act(() => {
            result.current.splitSelected(2);
        });

        expect(result.current.bars).toHaveLength(2);
        expect(result.current.bars[0].label).toBe('');
        expect(result.current.bars[1].label).toBe('');
    });

    it('should clone selected bar to the right', () => {
        const { result } = renderHook(() => useBarModel());

        act(() => {
            result.current.addBar(0, 0, 0, 'Test');
        });

        const id = result.current.bars[0].id;

        act(() => {
            result.current.selectBar(id, false);
        });

        const originalBar = result.current.bars[0];

        act(() => {
            result.current.cloneSelectedRight();
        });

        expect(result.current.bars).toHaveLength(2);
        const newBar = result.current.bars.find(b => b.id !== originalBar.id)!;

        // Should be to the right: x + width
        expect(newBar.x).toBe(originalBar.x + originalBar.width);
        expect(newBar.y).toBe(originalBar.y);
        expect(newBar.label).toBe(originalBar.label);
    });

    it('should clone selected bar downwards', () => {
        const { result } = renderHook(() => useBarModel());

        act(() => {
            result.current.addBar(0, 0, 0, 'Test');
        });

        const id = result.current.bars[0].id;

        act(() => {
            result.current.selectBar(id, false);
        });

        const originalBar = result.current.bars[0];

        act(() => {
            result.current.cloneSelectedDown();
        });

        expect(result.current.bars).toHaveLength(2);
        const newBar = result.current.bars.find(b => b.id !== originalBar.id)!;

        // Should be below
        expect(newBar.y).toBeGreaterThan(originalBar.y);
        expect(newBar.x).toBe(originalBar.x);
    });

    it('should support setting a bar as total', () => {
        const { result } = renderHook(() => useBarModel());

        act(() => {
            result.current.addBar(0, 0, 0, '');
        });

        const id = result.current.bars[0].id;

        act(() => {
            result.current.selectBar(id, false);
        });

        act(() => {
            result.current.toggleTotal();
        });

        expect(result.current.bars[0].isTotal).toBe(true);

        act(() => {
            result.current.toggleTotal();
        });

        expect(result.current.bars[0].isTotal).toBe(false);
    });

    it('should ensure only one bar is total at a time', () => {
        const { result } = renderHook(() => useBarModel());

        act(() => {
            result.current.addBar(0, 0, 0, '1');
            result.current.addBar(0, 100, 0, '2');
        });

        const id1 = result.current.bars[0].id;
        const id2 = result.current.bars[1].id;

        act(() => {
            result.current.selectBar(id1, false);
        });

        act(() => {
            result.current.toggleTotal();
        });

        expect(result.current.bars.find(b => b.id === id1)?.isTotal).toBe(true);

        act(() => {
            result.current.selectBar(id2, false);
        });

        act(() => {
            result.current.toggleTotal();
        });

        expect(result.current.bars.find(b => b.id === id1)?.isTotal).toBe(false);
        expect(result.current.bars.find(b => b.id === id2)?.isTotal).toBe(true);
    });

    it('should apply quick labels: units', () => {
        const { result } = renderHook(() => useBarModel());

        act(() => {
            result.current.addBar(0, 0, 0, '');
        });

        const id = result.current.bars[0].id;

        act(() => {
            result.current.selectBar(id, false);
        });

        // 100px width / 20px grid = 5 units
        act(() => {
            result.current.applyQuickLabel('units');
        });

        expect(result.current.bars[0].label).toBe('5');
    });

    test('should apply quick labels: relative', () => {
        const { result } = renderHook(() => useBarModel());

        // Add total bar
        act(() => {
            result.current.addBar(0, 0, 0, 'Total'); // Default 100px
        });

        const totalId = result.current.bars[0].id;

        act(() => {
            result.current.selectBar(totalId, false);
        });

        act(() => {
            result.current.toggleTotal();
        });

        // Add bar to label
        act(() => {
            result.current.addBar(0, 100, 0, 'Part');
        });

        const partId = result.current.bars[1].id;

        act(() => {
            result.current.resizeBar(partId, 20); // Resize to 20px (1/5 of 100)
        });

        act(() => {
            result.current.selectBar(partId, false);
        });

        act(() => {
            result.current.applyQuickLabel('relative');
        });

        // 20/100 = 1/5
        expect(result.current.bars[1].label).toBe('1/5');
    });

    it('should move all selected bars together when one is moved', () => {
        const { result } = renderHook(() => useBarModel());

        // Add 3 bars
        act(() => {
            result.current.addBar(0, 0, 0, 'Bar1');
            result.current.addBar(200, 0, 1, 'Bar2');
            result.current.addBar(400, 0, 2, 'Bar3');
        });

        const id1 = result.current.bars[0].id;
        const id2 = result.current.bars[1].id;
        const id3 = result.current.bars[2].id;

        // Select first two bars
        act(() => {
            result.current.selectBar(id1, false);
            result.current.selectBar(id2, true); // additive
        });

        // Get initial positions
        const bar1InitialX = result.current.bars[0].x;
        const bar2InitialX = result.current.bars[1].x;
        const bar3InitialX = result.current.bars[2].x;

        // Move selected bars by delta (60, 100) - using grid-aligned values
        act(() => {
            result.current.moveSelected(60, 100);
        });

        // Bar1 and Bar2 should have moved (values snap to 20px grid)
        expect(result.current.bars.find(b => b.id === id1)?.x).toBe(bar1InitialX + 60);
        expect(result.current.bars.find(b => b.id === id1)?.y).toBe(100);
        expect(result.current.bars.find(b => b.id === id2)?.x).toBe(bar2InitialX + 60);
        expect(result.current.bars.find(b => b.id === id2)?.y).toBe(100);

        // Bar3 should NOT have moved (not selected)
        expect(result.current.bars.find(b => b.id === id3)?.x).toBe(bar3InitialX);
        expect(result.current.bars.find(b => b.id === id3)?.y).toBe(0);
    });
});

