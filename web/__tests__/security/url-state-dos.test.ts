import { parseList, MAX_PARSE_ITERATIONS, MAX_INPUT_LENGTH } from '../../lib/url-state';

describe('parseList DoS', () => {
    it('rejects input exceeding MAX_INPUT_LENGTH', () => {
        const largeString = 'a'.repeat(MAX_INPUT_LENGTH + 1);
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const result = parseList(largeString, (part) => part);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Input length (${largeString.length}) exceeds maximum (${MAX_INPUT_LENGTH})`));
        expect(result.length).toBe(0);

        consoleSpy.mockRestore();
    });

    it('handles massive empty delimiters without freezing and stops early', () => {
        // Create a string that fits in length limit but exceeds iteration limit
        // MAX_INPUT_LENGTH = 100,000
        // MAX_PARSE_ITERATIONS = 20,000
        // 30,000 delimiters = 30,000 length (OK) and 30,000 iterations (Too many)
        const largeString = ';'.repeat(30000);

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const start = performance.now();
        const result = parseList(largeString, (part) => part, { maxItems: 10 });
        const end = performance.now();

        console.log(`Time taken for 30k delimiters: ${end - start}ms`);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Exceeded maximum iterations (${MAX_PARSE_ITERATIONS})`));

        // Should be empty as there are no items
        expect(result.length).toBe(0);

        consoleSpy.mockRestore();
    });

    it('handles massive number of invalid items and stops early', () => {
         // Items that are parsed but return null
         // 'a;' is 2 chars. 30,000 items = 60,000 chars (OK < 100k)
         // 30,000 iterations > 20,000 limit
         const largeString = 'a;'.repeat(30000);

         const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

         const start = performance.now();
         const result = parseList(largeString, () => null, { maxItems: 10 });
         const end = performance.now();

         console.log(`Time taken for 30k invalid items: ${end - start}ms`);
         expect(result.length).toBe(0);
         expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`Exceeded maximum iterations (${MAX_PARSE_ITERATIONS})`));

         consoleSpy.mockRestore();
    });
});
