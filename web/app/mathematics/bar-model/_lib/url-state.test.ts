
import { serializeBars, parseBarsString } from './url-state';
import { BarData } from '../_hooks/use-bar-model';

describe('Bar Model URL State Serialization (Comprehensive)', () => {

    const mockBar = (id: string, label: string, isTotal: boolean, showRelativeLabel: boolean): BarData => ({
        id,
        x: 0,
        y: 0,
        width: 100,
        colorIndex: 0,
        label,
        isTotal,
        showRelativeLabel,
    });

    it('should handle bars with no flags (backward compatibility)', () => {
        // Mock old format string: "0:OldBar,10,20,100"
        const oldString = "0:OldBar,10,20,100;1:Another,30,40,50";
        const bars = parseBarsString(oldString);

        expect(bars).toHaveLength(2);
        expect(bars[0].label).toBe('OldBar');
        expect(bars[0].isTotal).toBe(false);
        expect(bars[0].showRelativeLabel).toBe(false);

        expect(bars[1].label).toBe('Another');
        expect(bars[1].isTotal).toBe(false);
        expect(bars[1].showRelativeLabel).toBe(false);
    });

    it('should serialize and deserialize flags correctly', () => {
        const bars: BarData[] = [
            mockBar('1', 'None', false, false),
            mockBar('2', 'Total', true, false),
            mockBar('3', 'Relative', false, true),
        ];

        const str = serializeBars(bars);
        const parsed = parseBarsString(str);

        expect(parsed).toHaveLength(3);

        // None
        expect(parsed[0].isTotal).toBe(false);
        expect(parsed[0].showRelativeLabel).toBe(false);

        // Total
        expect(parsed[1].isTotal).toBe(true);
        expect(parsed[1].showRelativeLabel).toBe(false);

        // Relative
        expect(parsed[2].isTotal).toBe(false);
        expect(parsed[2].showRelativeLabel).toBe(true);
    });

    it('should handle both flags being set by ignoring both (invalid state handling)', () => {
        // Manually construct a string with flags = 3 (1 | 2)
        // Format: colorIndex:label,x,y,width,flags
        const invalidString = "0:Invalid,10,10,100,3";
        const bars = parseBarsString(invalidString);

        expect(bars).toHaveLength(1);
        expect(bars[0].label).toBe('Invalid');
        // Both should be false because flags=3 implies both bits set
        expect(bars[0].isTotal).toBe(false);
        expect(bars[0].showRelativeLabel).toBe(false);
    });

    it('should handle garbage flags gracefully', () => {
        const barsString = "0:Garbage,10,10,100,XYZ";
        const bars = parseBarsString(barsString);

        expect(bars).toHaveLength(1);
        expect(bars[0].isTotal).toBe(false);
        expect(bars[0].showRelativeLabel).toBe(false);
    });
});
