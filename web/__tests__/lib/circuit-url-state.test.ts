import {
    serializeNodes,
    parseNodeString
} from '@/app/computing/circuit-designer/_lib/url-state';
import { CircuitNode } from '@/app/computing/circuit-designer/constants';

describe('Circuit Designer URL State Security', () => {
    it('should correctly encode/decode special characters to prevent injection', () => {
        // A node with a label containing ";" which is the node separator
        // and content that looks like another node
        const maliciousNode: CircuitNode = {
            id: 'n1',
            type: 'AND',
            x: 100,
            y: 100,
            label: 'Normal;I:fake:200,200:Injected'
        };

        const serialized = serializeNodes([maliciousNode]);

        // It should be encoded now, so ";" is "%3B"
        // And it should not produce multiple parts in the split

        const parsed = parseNodeString(serialized);

        // It should parse as exactly 1 node
        expect(parsed.length).toBe(1);
        expect(parsed[0].id).toBe('n1');
        // The label should be preserved exactly as is
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
});
