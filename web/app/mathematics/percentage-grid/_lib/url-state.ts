import {
    URLStateSerializer,
    serializeList,
    parseList,
    hasAnyParam,
    serializeBool,
    deserializeBool,
    deserializeString,
} from '@/lib/url-state';
import { GRID_MODES, GridMode } from '../constants';

export interface PercentageGridURLState {
    gridMode: GridMode;
    selectedIndices: number[];
    showPanel: boolean;
    showPercentage: boolean;
    showDecimal: boolean;
    showFraction: boolean;
    simplifyFraction: boolean;
    showLabels: boolean;
}

const PARAM_MODE = 'gm';
const PARAM_SELECTED = 's';
const PARAM_PANEL = 'p';
const PARAM_PERCENTAGE = 'pc';
const PARAM_DECIMAL = 'dc';
const PARAM_FRACTION = 'fr';
const PARAM_SIMPLIFY = 'sf';
const PARAM_LABELS = 'lb';

function parseSelectedIndices(value: string | null, maxItems: number): number[] {
    const parsed = parseList(value, (part) => {
        const num = Number(part);
        if (!Number.isInteger(num)) return null;
        if (num < 0 || num >= maxItems) return null;
        return num;
    }, { maxItems });

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
        params.set(PARAM_MODE, state.gridMode);
        params.set(PARAM_PANEL, serializeBool(state.showPanel));
        params.set(PARAM_PERCENTAGE, serializeBool(state.showPercentage));
        params.set(PARAM_DECIMAL, serializeBool(state.showDecimal));
        params.set(PARAM_FRACTION, serializeBool(state.showFraction));
        params.set(PARAM_SIMPLIFY, serializeBool(state.simplifyFraction));
        params.set(PARAM_LABELS, serializeBool(state.showLabels));
        return params;
    },
    deserialize(params: URLSearchParams): PercentageGridURLState | null {
        const hasAny = hasAnyParam(params, [
            PARAM_MODE,
            PARAM_SELECTED,
            PARAM_PANEL,
            PARAM_PERCENTAGE,
            PARAM_DECIMAL,
            PARAM_FRACTION,
            PARAM_SIMPLIFY,
            PARAM_LABELS,
        ]);
        if (!hasAny) return null;

        const gridModeStr = deserializeString(params.get(PARAM_MODE), '10x10');
        const gridMode = GRID_MODES.some(m => m.id === gridModeStr) ? (gridModeStr as GridMode) : '10x10';
        const config = GRID_MODES.find(m => m.id === gridMode)!;

        const selectedIndices = parseSelectedIndices(params.get(PARAM_SELECTED), config.totalCells);
        return {
            gridMode,
            selectedIndices,
            showPanel: deserializeBool(params.get(PARAM_PANEL), true),
            showPercentage: deserializeBool(params.get(PARAM_PERCENTAGE), false),
            showDecimal: deserializeBool(params.get(PARAM_DECIMAL), false),
            showFraction: deserializeBool(params.get(PARAM_FRACTION), false),
            simplifyFraction: deserializeBool(params.get(PARAM_SIMPLIFY), false),
            showLabels: deserializeBool(params.get(PARAM_LABELS), false),
        };
    }
};
