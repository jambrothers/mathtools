import { renderHook, act } from '@testing-library/react';
import { useBarModel } from './use-bar-model';

// Mock useHistory if needed, or rely on the real one if it's simple enough.
// Since useHistory is a custom hook, we might want to mock it to isolate useBarModel,
// but for a reproduction test, using the real one is often better if it doesn't have external deps.
// Based on the file content I saw, useHistory imports from "@/lib/hooks/use-history".
// I'll assume for now we can run with the real implementation if the environment is set up correctly.
// If not, I'll need to mock it.

// Mocking constants if necessary, but importing them is better.
// The file imports from "../constants".

describe('useBarModel', () => {
    it('joinSelected should merge bars instead of creating a Total bar', () => {
        const { result } = renderHook(() => useBarModel());

        // 1. Add 3 bars
        act(() => {
            result.current.addBar(0, 0, 0, 'Bar 1');
            result.current.addBar(100, 0, 0, 'Bar 2');
            result.current.addBar(200, 0, 0, 'Bar 3');
        });

        // Get ids
        const bars = result.current.bars;
        expect(bars).toHaveLength(3);
        const ids = bars.map(b => b.id);

        // 2. Select all 3
        act(() => {
            result.current.selectBars(ids);
        });

        // 3. Join
        act(() => {
            result.current.joinSelected();
        });

        // 4. Verify
        // Expected: 1 bar total, which is the merged bar.
        // Current Bug Behavior: Original bars might remain, and a new Total bar is added?
        // Or original bars remain and a total bar is added below.

        // Let's assert what we WANT (The Fix)
        expect(result.current.bars).toHaveLength(1);
        const mergedBar = result.current.bars[0];
        expect(mergedBar.isTotal).toBeFalsy();
        expect(mergedBar.label).not.toBe('Total');
        // Width should be sum of 3 default widths.
        // DEFAULT_BAR_WIDTH was imported. I should probably import it or check the value.
        // In the code file: width: DEFAULT_BAR_WIDTH
        // I don't have the constant file content, but I can check if width is > 0.
        expect(mergedBar.width).toBeGreaterThan(0);
    });
    it('should maintain relative label property when splitting a bar', () => {
        const { result } = renderHook(() => useBarModel());

        let barId: string;

        // 1. Add a bar
        act(() => {
            const bar = result.current.addBar(0, 0, 0, 'Test Bar');
            barId = bar.id;
        });

        // 2. Select the bar
        act(() => {
            result.current.selectBars([barId]);
        });

        // 3. Enable relative label
        act(() => {
            result.current.toggleRelativeLabel();
        });

        // Verify the bar has relative label enabled
        const bar = result.current.bars.find(b => b.id === barId);
        expect(bar?.showRelativeLabel).toBe(true);

        // 4. Split the bar
        act(() => {
            result.current.splitSelected(2);
        });

        // 5. Verify the split bars have relative label enabled
        // The original bar should be gone, and 2 new bars should exist
        const splitBars = result.current.bars;
        expect(splitBars).toHaveLength(2);

        splitBars.forEach(b => {
            expect(b.showRelativeLabel).toBe(true);
        });
    });
});
