import { renderHook, act } from '@testing-library/react';
import { useBarModel } from './use-bar-model';

describe('useBarModel splitSelected bug', () => {
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
        let bar = result.current.bars.find(b => b.id === barId);
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
