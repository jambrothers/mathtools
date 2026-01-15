import {
    URLStateSerializer,
    serializeBool,
    deserializeBool,
    generateShareableURL
} from '@/lib/url-state';
import { CircuitNode, Connection, ComponentTypeName, generateId } from '../constants';

export interface CircuitURLState {
    nodes: CircuitNode[];
    connections: Connection[];
}

// URL Params
const PARAM_NODES = 'n';
const PARAM_WIRES = 'w';

/**
 * Serialize nodes to compact string.
 * Format: {type}:{id}:{x},{y}:{label}:{state};...
 * Types: I=INPUT, O=OUTPUT, A=AND, R=OR, N=NOT, X=XOR
 */
export function serializeNodes(nodes: CircuitNode[]): string {
    if (!nodes.length) return '';

    return nodes.map(node => {
        const typeCode = getTypeCode(node.type);
        const x = Math.round(node.x);
        const y = Math.round(node.y);
        const stateVal = node.type === 'INPUT' ? (node.state ? '1' : '0') : '';

        // Compact format: type:id:x,y:label(:state)
        let part = `${typeCode}:${node.id}:${x},${y}:${node.label}`;
        if (stateVal) part += `:${stateVal}`;
        return part;
    }).join(';');
}

/**
 * Parse compact node string to CircuitNode array.
 */
export function parseNodeString(str: string): CircuitNode[] {
    if (!str) return [];

    const nodes: CircuitNode[] = [];
    const parts = str.split(';');

    for (const part of parts) {
        // Try parsing: T:id:x,y:Label(:state)
        // Regex: T:id:x,y:Label(:state)?
        const sections = part.split(':');
        if (sections.length < 4) continue;

        const typeCode = sections[0];
        const id = sections[1];
        const pos = sections[2].split(',');
        const label = sections[3];
        const stateStr = sections[4]; // optional

        const x = parseInt(pos[0] || '0');
        const y = parseInt(pos[1] || '0');
        const type = getTypeFromCode(typeCode);

        if (!type) continue;

        if (type) {
            const node: CircuitNode = {
                id,
                type,
                x,
                y,
                label
            };
            if (stateStr !== undefined && stateStr !== '') {
                node.state = stateStr === '1';
            }
            nodes.push(node);
        }
    }
    return nodes;
}

/**
 * Serialize connections to compact string.
 * Format: from>to:inputIndex;...
 */
export function serializeConnections(connections: Connection[]): string {
    if (!connections.length) return '';
    return connections.map(c => `${c.from}>${c.to}:${c.inputIndex}`).join(';');
}

/**
 * Parse compact connection string.
 */
export function parseConnectionString(str: string): Connection[] {
    if (!str) return [];

    const connections: Connection[] = [];
    const parts = str.split(';');

    for (const part of parts) {
        // from>to:idx
        const arrowSplit = part.split('>');
        if (arrowSplit.length !== 2) continue;

        const from = arrowSplit[0];
        const remaining = arrowSplit[1];
        const colonSplit = remaining.split(':');

        if (colonSplit.length !== 2) continue;

        const to = colonSplit[0];
        const idx = parseInt(colonSplit[1]);

        connections.push({
            id: generateId(), // Generate new ID for connection
            from,
            to,
            inputIndex: isNaN(idx) ? 0 : idx
        });
    }
    return connections;
}

// Helpers for type codes
function getTypeCode(type: ComponentTypeName): string {
    switch (type) {
        case 'INPUT': return 'I';
        case 'OUTPUT': return 'O';
        case 'AND': return 'A';
        case 'OR': return 'R'; // O is taken by Output
        case 'NOT': return 'N';
        case 'XOR': return 'X';
    }
}

function getTypeFromCode(code: string): ComponentTypeName | null {
    switch (code) {
        case 'I': return 'INPUT';
        case 'O': return 'OUTPUT';
        case 'A': return 'AND';
        case 'R': return 'OR';
        case 'N': return 'NOT';
        case 'X': return 'XOR';
        default: return null;
    }
}

export const circuitURLSerializer: URLStateSerializer<CircuitURLState> = {
    serialize(state: CircuitURLState): URLSearchParams {
        const params = new URLSearchParams();
        const nStr = serializeNodes(state.nodes);
        const wStr = serializeConnections(state.connections);

        if (nStr) params.set(PARAM_NODES, nStr);
        if (wStr) params.set(PARAM_WIRES, wStr);

        return params;
    },

    deserialize(params: URLSearchParams): CircuitURLState | null {
        if (!params.has(PARAM_NODES) && !params.has(PARAM_WIRES)) return null;

        return {
            nodes: parseNodeString(params.get(PARAM_NODES) || ''),
            connections: parseConnectionString(params.get(PARAM_WIRES) || '')
        };
    }
};
