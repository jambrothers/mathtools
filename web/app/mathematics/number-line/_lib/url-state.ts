import {
    URLStateSerializer,
    serializeBool,
    deserializeBool,
    parseList
} from '@/lib/url-state';
import { DEFAULT_VIEWPORT, POINT_COLORS } from '../constants';

export interface PointMarker {
    id: string;
    value: number;
    label?: string;
    color: string;
    hidden?: boolean;
}

export interface JumpArc {
    fromId: string;
    toId: string;
    label?: string;
}

export interface NumberLineState {
    min: number;
    max: number;
    points: PointMarker[];
    arcs: JumpArc[];
    showLabels: boolean;
    hideValues: boolean;
    snapToTicks: boolean;
    showNegativeRegion?: boolean;
}

const MAX_POINTS = 20;
const MAX_ARCS = 40;

/**
 * Serializes point markers to a string
 * Format: value,label,color|...
 */
function serializePoints(points: PointMarker[]): string {
    return points.map(p => {
        const label = p.label || '';
        const hidden = p.hidden ? '1' : '';
        return `${p.value},${label},${p.color},${hidden}`;
    }).join('|');
}

/**
 * Deserializes point markers from a string
 */
function deserializePoints(value: string | null): PointMarker[] {
    let index = 0;
    return parseList(value, (part) => {
        const [valStr, label, color, hiddenStr] = part.split(',');
        const val = parseFloat(valStr);
        if (isNaN(val)) return null;

        index++;
        return {
            id: `p-${index}`,
            value: val,
            label: label || undefined,
            color: color || POINT_COLORS[(index - 1) % POINT_COLORS.length],
            hidden: hiddenStr === '1'
        };
    }, { delimiter: '|', maxItems: MAX_POINTS });
}

/**
 * Serializes jump arcs to a string
 * Format: fromId,toId,label|...
 */
function serializeArcs(arcs: JumpArc[]): string {
    return arcs.map(a => `${a.fromId},${a.toId},${a.label || ''}`).join('|');
}

/**
 * Deserializes jump arcs from a string
 */
function deserializeArcs(value: string | null): JumpArc[] {
    return parseList(value, (part) => {
        const [fromId, toId, label] = part.split(',');
        if (!fromId || !toId) return null;

        return {
            fromId,
            toId,
            label: label || undefined
        };
    }, { delimiter: '|', maxItems: MAX_ARCS });
}

export const numberLineSerializer: URLStateSerializer<NumberLineState> = {
    serialize: (state) => {
        const params = new URLSearchParams();

        params.set('min', state.min.toString());
        params.set('max', state.max.toString());

        if (state.points.length > 0) {
            params.set('points', serializePoints(state.points));
        }

        if (state.arcs.length > 0) {
            params.set('arcs', serializeArcs(state.arcs));
        }

        params.set('labels', serializeBool(state.showLabels));
        params.set('hide', serializeBool(state.hideValues));
        params.set('snap', serializeBool(state.snapToTicks));

        return params;
    },
    deserialize: (params) => {
        const min = parseFloat(params.get('min') || '');
        const max = parseFloat(params.get('max') || '');

        const restoredPoints = deserializePoints(params.get('points'));

        return {
            min: isNaN(min) ? DEFAULT_VIEWPORT.min : min,
            max: isNaN(max) ? DEFAULT_VIEWPORT.max : max,
            points: restoredPoints,
            arcs: deserializeArcs(params.get('arcs')),
            showLabels: deserializeBool(params.get('labels'), true),
            hideValues: deserializeBool(params.get('hide'), false),
            snapToTicks: deserializeBool(params.get('snap'), true)
        };
    }
};
