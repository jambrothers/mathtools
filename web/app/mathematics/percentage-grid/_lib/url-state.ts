import {
    URLStateSerializer,
    serializeList,
    parseList,
    hasAnyParam,
    serializeBool,
    deserializeBool,
} from '@/lib/url-state';
import { TOTAL_SQUARES } from '../constants';

export interface PercentageGridURLState {
    selectedIndices: number[];
    showPanel: boolean;
    showPercentage: boolean;
    showDecimal: boolean;
    showFraction: boolean;
    simplifyFraction: boolean;
}

const PARAM_SELECTED = 's';
const PARAM_PANEL = 'p';
const PARAM_PERCENTAGE = 'pc';
const PARAM_DECIMAL = 'dc';
const PARAM_FRACTION = 'fr';
const PARAM_SIMPLIFY = 'sf';
const MAX_SELECTED = TOTAL_SQUARES;

function parseSelectedIndices(value: string | null): number[] {
    const parsed = parseList(value, (part) => {
        const num = Number(part);
        if (!Number.isInteger(num)) return null;
        if (num < 0 || num >= TOTAL_SQUARES) return null;
        return num;
    }, { maxItems: MAX_SELECTED });

    return parsed.sort((a, b) => a - b);
}

export const percentageGridURLSerializer: URLStateSerializer<PercentageGridURLState> = {
    serialize(state: PercentageGridURLState): URLSearchParams {
        const params = new URLSearchParams();
        const sorted = [...state.selectedIndices].sort((a, b) => a - b);
        const serialized = serializeList(sorted, (index) => String(index));
        if (serialized) {
            params.set(PARAM_SELECTED, serialized);
        }
        params.set(PARAM_PANEL, serializeBool(state.showPanel));
        params.set(PARAM_PERCENTAGE, serializeBool(state.showPercentage));
        params.set(PARAM_DECIMAL, serializeBool(state.showDecimal));
        params.set(PARAM_FRACTION, serializeBool(state.showFraction));
        params.set(PARAM_SIMPLIFY, serializeBool(state.simplifyFraction));
        return params;
    },
    deserialize(params: URLSearchParams): PercentageGridURLState | null {
        const hasAny = hasAnyParam(params, [
            PARAM_SELECTED,
            PARAM_PANEL,
            PARAM_PERCENTAGE,
            PARAM_DECIMAL,
            PARAM_FRACTION,
            PARAM_SIMPLIFY,
        ]);
        if (!hasAny) return null;
        const selectedIndices = parseSelectedIndices(params.get(PARAM_SELECTED));
        return {
            selectedIndices,
            showPanel: deserializeBool(params.get(PARAM_PANEL), true),
            showPercentage: deserializeBool(params.get(PARAM_PERCENTAGE), false),
            showDecimal: deserializeBool(params.get(PARAM_DECIMAL), false),
            showFraction: deserializeBool(params.get(PARAM_FRACTION), false),
            simplifyFraction: deserializeBool(params.get(PARAM_SIMPLIFY), false),
        };
    }
};
