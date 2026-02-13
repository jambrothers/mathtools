import { parseList, MAX_PARSE_ITERATIONS } from '../../lib/url-state';

describe('parseList DoS', () => {
    it('handles massive empty delimiters without freezing and stops early', () => {
        // Create a large string with 1 million delimiters
        // The implementation should stop at MAX_PARSE_ITERATIONS (200,000)
        const largeString = ';'.repeat(1000000);

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const start = performance.now();
        const result = parseList(largeString, (part) => part, { maxItems: 10 });
        const end = performance.now();

        console.log(`Time taken for 1m delimiters (should be limited): ${end - start}ms`);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Exceeded maximum iterations (${MAX_PARSE_ITERATIONS})`));

        // Should be empty as there are no items
        expect(result.length).toBe(0);

        consoleSpy.mockRestore();
    });

    it('handles massive number of invalid items and stops early', () => {
         // Items that are parsed but return null
         // 300k items > 200k limit
         const largeString = 'invalid;'.repeat(300000);

         const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

         const start = performance.now();
         const result = parseList(largeString, () => null, { maxItems: 10 });
         const end = performance.now();

         console.log(`Time taken for 300k invalid items: ${end - start}ms`);
         expect(result.length).toBe(0);
         expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Exceeded maximum iterations (${MAX_PARSE_ITERATIONS})`));

         consoleSpy.mockRestore();
    });
});
