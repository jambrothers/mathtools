import { parseList } from '@/lib/url-state';

describe('parseList', () => {
    it('parses a delimited string', () => {
        const result = parseList('a;b;c', (part) => part);
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('respects custom delimiter', () => {
        const result = parseList('a,b,c', (part) => part, { delimiter: ',' });
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('trims whitespace by default', () => {
        const result = parseList(' a ; b ; c ', (part) => part);
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('skips empty items', () => {
        const result = parseList('a;;b', (part) => part);
        expect(result).toEqual(['a', 'b']);
    });

    it('skips items where parseItem returns null', () => {
        const result = parseList('1;a;2', (part) => {
            const n = Number(part);
            return isNaN(n) ? null : n;
        });
        expect(result).toEqual([1, 2]);
    });

    it('respects maxItems limit', () => {
        const result = parseList('a;b;c;d;e', (part) => part, { maxItems: 3 });
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('handles large input without crashing (allocation check)', () => {
        // Create a large string that would cause memory issues if split entirely
        // 1 million items
        const largeString = 'a;'.repeat(1000000);

        const start = performance.now();
        const result = parseList(largeString, (part) => part, { maxItems: 10 });
        const end = performance.now();

        expect(result.length).toBe(10);
        expect(end - start).toBeLessThan(100); // Should be very fast if it stops early
    });

    it('uses default maxItems (1000) if not provided', () => {
         // Create a string with 2000 items
         const largeString = 'a;'.repeat(2000);
         // Expect it to be capped at default limit (1000)
         const result = parseList(largeString, (part) => part);
         expect(result.length).toBe(1000);
    });
});
