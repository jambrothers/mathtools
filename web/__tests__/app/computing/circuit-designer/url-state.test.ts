import {
    serializeNodes,
    parseNodeString,
    serializeConnections,
    parseConnectionString,
    circuitURLSerializer,
    CircuitURLState
} from '@/app/computing/circuit-designer/_lib/url-state';
import { CircuitNode, Connection } from '@/app/computing/circuit-designer/constants';

describe('Circuit Designer URL State', () => {
    describe('serializeNodes', () => {
        it('returns empty string for empty array', () => {
            expect(serializeNodes([])).toBe('');
        });

        it('serializes input switch with state', () => {
            const nodes: CircuitNode[] = [
                { id: 's1', type: 'INPUT', x: 100, y: 100, label: 'A', state: true }
            ];
            expect(serializeNodes(nodes)).toBe('I:s1:100,100:A:1');
        });

        it('serializes inactive input switch', () => {
            const nodes: CircuitNode[] = [
                { id: 's2', type: 'INPUT', x: 100, y: 100, label: 'B', state: false }
            ];
            expect(serializeNodes(nodes)).toBe('I:s2:100,100:B:0');
        });

        it('serializes output bulb (no state needed)', () => {
            const nodes: CircuitNode[] = [
                { id: 'o1', type: 'OUTPUT', x: 200, y: 100, label: 'Out' }
            ];
            expect(serializeNodes(nodes)).toBe('O:o1:200,100:Out');
        });

        it('serializes logic gates', () => {
            const nodes: CircuitNode[] = [
                { id: 'g1', type: 'AND', x: 150, y: 150, label: 'AND' },
                { id: 'g2', type: 'OR', x: 200, y: 200, label: 'OR' },
            ];
            // Order usually doesn't matter, but let's check exact string
            const result = serializeNodes(nodes);
            expect(result).toBe('A:g1:150,150:AND;R:g2:200,200:OR');
        });

        it('rounds floating point coordinates', () => {
            const nodes: CircuitNode[] = [
                { id: 'n1', type: 'NOT', x: 100.4, y: 100.6, label: 'NOT' }
            ];
            expect(serializeNodes(nodes)).toBe('N:n1:100,101:NOT');
        });
    });

    describe('parseNodeString', () => {
        it('returns empty array for empty string', () => {
            expect(parseNodeString('')).toEqual([]);
        });

        it('parses minimal input node', () => {
            const result = parseNodeString('I:s1:10,20:A:1');
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: 's1',
                type: 'INPUT',
                x: 10,
                y: 20,
                label: 'A',
                state: true
            });
        });

        it('parses gate node', () => {
            const result = parseNodeString('X:x1:50,60:XOR');
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: 'x1',
                type: 'XOR',
                x: 50,
                y: 60,
                label: 'XOR'
            });
        });

        it('parses multiple nodes', () => {
            const str = 'I:s1:0,0:A:0;O:o1:100,100:Out';
            const result = parseNodeString(str);
            expect(result).toHaveLength(2);
            expect(result[0].type).toBe('INPUT');
            expect(result[1].type).toBe('OUTPUT');
        });

        it('ignores invalid node string', () => {
            const result = parseNodeString('invalid;I:s1:0,0:A:0');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('s1');
        });
    });

    describe('serializeConnections', () => {
        it('returns empty string for empty array', () => {
            expect(serializeConnections([])).toBe('');
        });

        it('serializes single connection', () => {
            const conns: Connection[] = [
                { id: 'c1', from: 'n1', to: 'n2', inputIndex: 0 }
            ];
            expect(serializeConnections(conns)).toBe('n1>n2:0');
        });

        it('serializes multiple connections', () => {
            const conns: Connection[] = [
                { id: 'c1', from: 'a', to: 'b', inputIndex: 0 },
                { id: 'c2', from: 'b', to: 'c', inputIndex: 1 }
            ];
            expect(serializeConnections(conns)).toBe('a>b:0;b>c:1');
        });
    });

    describe('parseConnectionString', () => {
        it('returns empty array for empty string', () => {
            expect(parseConnectionString('')).toEqual([]);
        });

        it('parses single connection', () => {
            const result = parseConnectionString('a>b:0');
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expect.objectContaining({
                from: 'a',
                to: 'b',
                inputIndex: 0
            }));
            // IDs should be auto-generated or handled, checking existence
            expect(result[0].id).toBeDefined();
        });

        it('parses multiple connections', () => {
            const result = parseConnectionString('node1>node2:0;node2>node3:1');
            expect(result).toHaveLength(2);
            expect(result[0].from).toBe('node1');
            expect(result[1].inputIndex).toBe(1);
        });

        it('ignores invalid connection string', () => {
            const result = parseConnectionString('invalid;a>b:0');
            expect(result).toHaveLength(1);
            expect(result[0].from).toBe('a');
        });
    });

    describe('circuitURLSerializer', () => {
        const defaultState: CircuitURLState = {
            nodes: [],
            connections: []
        };

        describe('serialize', () => {
            it('returns empty params for empty state', () => {
                const params = circuitURLSerializer.serialize(defaultState);
                expect(params.toString()).toBe('');
            });

            it('serializes full state', () => {
                const state: CircuitURLState = {
                    nodes: [{ id: 's1', type: 'INPUT', x: 0, y: 0, label: 'S', state: true }],
                    connections: [{ id: 'c1', from: 's1', to: 'o1', inputIndex: 0 }]
                };
                const params = circuitURLSerializer.serialize(state);
                expect(params.get('n')).toBe('I:s1:0,0:S:1');
                expect(params.get('w')).toBe('s1>o1:0');
            });
        });

        describe('deserialize', () => {
            it('returns null if no params', () => {
                const params = new URLSearchParams();
                expect(circuitURLSerializer.deserialize(params)).toBeNull();
            });

            it('deserializes complete state', () => {
                const params = new URLSearchParams();
                params.set('n', 'I:s1:0,0:S:1');
                params.set('w', 's1>o1:0');

                const result = circuitURLSerializer.deserialize(params);
                expect(result).not.toBeNull();
                expect(result!.nodes).toHaveLength(1);
                expect(result!.connections).toHaveLength(1);
            });
        });
    });
});
