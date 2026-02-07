import { parseCounterString } from './url-state';

describe('Double Sided Counters URL State', () => {
    it('parses a valid counter string', () => {
        const str = 'p:32,32;n:128,32';
        const counters = parseCounterString(str);
        expect(counters).toHaveLength(2);
        expect(counters[0]).toMatchObject({ value: 1, x: 32, y: 32 });
        expect(counters[1]).toMatchObject({ value: -1, x: 128, y: 32 });
    });

    it('limits the number of counters parsed (security check)', () => {
        // Create a string with 1000 counters
        const largeStr = Array(1000).fill('p:0,0').join(';');
        const counters = parseCounterString(largeStr);

        // It should be capped at MAX_COUNTERS (500)
        expect(counters).toHaveLength(500);
    });
});
