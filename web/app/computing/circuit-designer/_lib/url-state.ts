import {
    URLStateSerializer,
    serializeList,
    parseList
} from '@/lib/url-state';
import { CircuitNode, Connection, ComponentTypeName, generateId } from '../constants';

export interface CircuitURLState {
    nodes: CircuitNode[];
    connections: Connection[];
}

// URL Params
const PARAM_NODES = 'n';
const PARAM_WIRES = 'w';

// Split Limits for DoS Protection
// Justification: These limits provide headroom for future fields (e.g. z-index, rotation)
// while preventing attackers from allocating massive arrays via excessive delimiters.
const MAX_NODE_PARTS = 8; // type:id:coords:label:state + 3 future fields
const MAX_POS_PARTS = 4; // x,y + 2 future dimensions (e.g. z, w)
const MAX_CONNECTION_ARROW_PARTS = 4; // from>to:idx + future metadata
const MAX_CONNECTION_COLON_PARTS = 4; // to:idx + future metadata

/**
 * Serialize nodes to compact string.
 *
 * Format: `type:id:x,y:label:state;...`
 *
 * - Delimiter: `;` for nodes.
 * - `type`: Single char code (I=Input, O=Output, A=AND, R=OR, N=NOT, X=XOR).
 * - `id`: Node ID string.
 * - `x,y`: Integer coordinates.
 * - `label`: User defined label (URL encoded).
 * - `state`: Optional boolean state (0/1), mainly for Input nodes.
 */
export function serializeNodes(nodes: CircuitNode[]): string {
    return serializeList(nodes, (node) => {
        const typeCode = getTypeCode(node.type);
        const x = Math.round(node.x);
        const y = Math.round(node.y);
        const stateVal = node.type === 'INPUT' ? (node.state ? '1' : '0') : '';

        // Compact format: type:id:x,y:label(:state)
        // Encode label to prevent delimiter injection
        const encodedLabel = encodeURIComponent(node.label);
        let part = `${typeCode}:${node.id}:${x},${y}:${encodedLabel}`;
        if (stateVal) part += `:${stateVal}`;
        return part;
    });
}

/**
 * Parse compact node string to CircuitNode array.
 */
export function parseNodeString(str: string): CircuitNode[] {
    return parseList(str, (part) => {
        // Try parsing: T:id:x,y:Label(:state)
        // Regex: T:id:x,y:Label(:state)?
        const sections = part.split(':', MAX_NODE_PARTS);
        if (sections.length < 4) return null;

        const typeCode = sections[0];
        const id = sections[1];
        const pos = sections[2].split(',', MAX_POS_PARTS);
        const encodedLabel = sections[3];
        const stateStr = sections[4]; // optional

        const x = parseInt(pos[0] || '0');
        const y = parseInt(pos[1] || '0');
        const type = getTypeFromCode(typeCode);

        if (!type) return null;

        let label = encodedLabel;
        try {
            label = decodeURIComponent(encodedLabel);
        } catch {
            // Fallback for legacy URLs or malformed encoding
            label = encodedLabel;
        }

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
        return node;
    });
}

/**
 * Serialize connections to compact string.
 *
 * Format: `fromID>toID:inputIndex;...`
 *
 * - Delimiters:
 *   - `;` separates connections.
 *   - `>` indicates direction (source to target).
 *   - `:` separates target ID from input index (for multi-input gates like AND/OR).
 */
export function serializeConnections(connections: Connection[]): string {
    return serializeList(connections, (c) => `${c.from}>${c.to}:${c.inputIndex}`);
}

/**
 * Parse compact connection string.
 */
export function parseConnectionString(str: string): Connection[] {
    return parseList(str, (part) => {
        // from>to:idx
        const arrowSplit = part.split('>', MAX_CONNECTION_ARROW_PARTS);
        if (arrowSplit.length < 2) return null;

        const from = arrowSplit[0];
        const remaining = arrowSplit[1];
        const colonSplit = remaining.split(':', MAX_CONNECTION_COLON_PARTS);

        if (colonSplit.length < 2) return null;

        const to = colonSplit[0];
        const idx = parseInt(colonSplit[1]);

        return {
            id: generateId(), // Generate new ID for connection
            from,
            to,
            inputIndex: isNaN(idx) ? 0 : idx
        };
    });
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
