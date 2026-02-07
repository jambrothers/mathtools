import {
    serializeNodes,
    parseNodeString
} from '@/app/computing/circuit-designer/_lib/url-state';
import { CircuitNode } from '@/app/computing/circuit-designer/constants';

describe('Circuit Designer URL State Security', () => {
    it('should correctly encode/decode special characters to prevent injection', () => {
        const maliciousNode: CircuitNode = {
            id: 'n1',
            type: 'AND',
            x: 100,
            y: 100,
            label: 'Normal;I:fake:200,200:Injected'
        };

        const serialized = serializeNodes([maliciousNode]);
        const parsed = parseNodeString(serialized);

        expect(parsed.length).toBe(1);
        expect(parsed[0].id).toBe('n1');
        expect(parsed[0].label).toBe('Normal;I:fake:200,200:Injected');
    });

    it('should handle colons in labels correctly', () => {
         const nodeWithColon: CircuitNode = {
            id: 'n2',
            type: 'AND',
            x: 100,
            y: 100,
            label: 'Hello:World'
        };

        const serialized = serializeNodes([nodeWithColon]);
        const parsed = parseNodeString(serialized);

        expect(parsed.length).toBe(1);
        expect(parsed[0].label).toBe('Hello:World');
    });

    it('should gracefully handle legacy URLs with unencoded %', () => {
        // A label "50%" in the old format would be stored directly.
        // The parser receives "50%" and tries to decode it.
        // decodeURIComponent("50%") throws URIError.
        // It should catch this and return "50%".

        // Construct a legacy serialized string manually
        const legacyString = "I:n3:100,100:50%";

        const parsed = parseNodeString(legacyString);

        expect(parsed.length).toBe(1);
        expect(parsed[0].label).toBe('50%');
    });
});
