import { parseNodeString, parseConnectionString } from '@/app/computing/circuit-designer/_lib/url-state';
import { parseBarsString } from '@/app/mathematics/bar-model/_lib/url-state';
import { linearEquationsSerializer } from '@/app/mathematics/linear-equations/_lib/url-state';

describe('Security: Unbounded String Splitting', () => {
    describe('Circuit Designer', () => {
        it('should handle excessive delimiters in parseNodeString', () => {
            // Normal: T:id:x,y:Label
            // Attack: T:id:x,y:Label::::::::::::::::::::...
            const validPart = 'A:n1:100,100:Label';
            const excessiveColons = ':'.repeat(100);
            const input = validPart + excessiveColons;

            const result = parseNodeString(input);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('n1');
            expect(result[0].label).toBe('Label');
        });

        it('should handle excessive delimiters in parseConnectionString', () => {
            // Normal: from>to:idx
            // Attack: from>to:idx::::::::::::::::::::...
            const validPart = 'n1>n2:0';
            const excessiveColons = ':'.repeat(100);
            const input = validPart + excessiveColons;

            const result = parseConnectionString(input);
            expect(result).toHaveLength(1);
            expect(result[0].from).toBe('n1');
            expect(result[0].to).toBe('n2');
            expect(result[0].inputIndex).toBe(0);
        });

        it('should handle excessive arrows in parseConnectionString', () => {
            // Normal: from>to:idx
            // Attack: from>to:idx>>>>>>>>>>>>>>>>>>>>...
            const validPart = 'n1>n2:0';
            const excessiveArrows = '>'.repeat(100);
            const input = validPart + excessiveArrows;

            const result = parseConnectionString(input);
            // With split(limit), extra parts are ignored.
            // If the limit is 2 (or 3), it takes the first 2 parts.
            // "n1>n2:0>>>>..." -> ["n1", "n2:0>>>>..."]
            // Then "n2:0>>>>..." is parsed as remaining.
            // remaining.split(':') -> ["n2", "0>>>>..."]
            // idx is parseInt("0>>>>...") -> 0.

            // So it should still work!
            expect(result).toHaveLength(1);
            expect(result[0].from).toBe('n1');
            expect(result[0].to).toBe('n2');
            expect(result[0].inputIndex).toBe(0);
        });
    });

    describe('Bar Model', () => {
        it('should handle excessive commas in parseBarsString', () => {
            // Normal: colorIndex:label,x,y,width
            // Attack: 0:Label,10,10,100,,,,,,,,,,,,,,,,
            const validPart = '0:Label,10,10,100';
            const excessiveCommas = ','.repeat(100);
            const input = validPart + excessiveCommas;

            const result = parseBarsString(input);
            expect(result).toHaveLength(1);
            expect(result[0].x).toBe(10);
            expect(result[0].width).toBe(100);
        });
    });

    describe('Linear Equations', () => {
        it('should handle excessive commas in deserializeLines', () => {
            // Normal: m,c
            // Attack: 1,2,,,,,,,,,,,,,,,,
            const validPart = '1,2';
            const params = new URLSearchParams();
            params.set('lines', validPart + ','.repeat(100));

            const state = linearEquationsSerializer.deserialize(params);
            expect(state).not.toBeNull();
            if (state) {
                expect(state.lines).toHaveLength(1);
                expect(state.lines[0].m).toBe(1);
                expect(state.lines[0].c).toBe(2);
            }
        });
    });

    it('should skip items exceeding maxItemLength (2048)', () => {
        const tooLongItem = 'A:n1:0,0:' + 'A'.repeat(2100);
        const result = parseNodeString(tooLongItem);
        expect(result).toHaveLength(0);
    });
});
