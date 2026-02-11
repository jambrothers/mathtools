import {
    URLStateSerializer,
    serializeList,
    parseList,
    hasAnyParam
} from '@/lib/url-state';
import { TOTAL_SQUARES } from '../constants';

export interface PercentageGridURLState {
    selectedIndices: number[];
}

const PARAM_SELECTED = 's';
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
        return params;
    },
    deserialize(params: URLSearchParams): PercentageGridURLState | null {
        const hasAny = hasAnyParam(params, [PARAM_SELECTED]);
        if (!hasAny) return null;
        const selectedIndices = parseSelectedIndices(params.get(PARAM_SELECTED));
        return { selectedIndices };
    }
};
