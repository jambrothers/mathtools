import { parseList } from '@/lib/url-state';

describe('parseList Security Tests', () => {
    // 2026-02-09 - Allocation-Based DoS in URL State Parsing
    it('should handle large input with empty delimiter without allocation DoS', () => {
        // Create a large string (e.g. 1MB)
        const hugeString = 'a'.repeat(1000000);
        const maxItems = 10;

        const startTime = process.hrtime();

        // This should process only 10 items and return immediately
        const result = parseList(hugeString, (char) => char, { delimiter: '', maxItems });

        const [seconds, nanoseconds] = process.hrtime(startTime);
        const durationMs = seconds * 1000 + nanoseconds / 1e6;

        expect(result).toHaveLength(maxItems);
        expect(result[0]).toBe('a');

        // Ensure it's fast (iterative) and didn't process the whole string
        // With split(''), it would allocate 1MB array first, taking time and memory.
        // With iterative, it should be instant.
        // 50ms is generous for 10 iterations.
        expect(durationMs).toBeLessThan(50);
    });

    it('should correctly parse characters with empty delimiter', () => {
        const input = 'abc';
        const result = parseList(input, (char) => char, { delimiter: '' });
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should respect maxItems with empty delimiter', () => {
        const input = 'abcde';
        const result = parseList(input, (char) => char, { delimiter: '', maxItems: 3 });
        expect(result).toEqual(['a', 'b', 'c']);
    });
});
