import {
    URLStateSerializer,
    serializeBool,
    deserializeBool,
    serializeList,
    parseList,
    deserializeString
} from '@/lib/url-state';

export interface AreaModelState {
    factorA: string;
    factorB: string;
    autoPartition: boolean;
    showFactorLabels: boolean;
    showPartialProducts: boolean;
    showTotal: boolean;
    showGridLines: boolean;
    showArray: boolean;
    revealedCells: Set<string>;
}

export const areaModelURLSerializer: URLStateSerializer<AreaModelState> = {
    serialize: (state) => {
        const params = new URLSearchParams();
        if (state.factorA) params.set('a', state.factorA);
        if (state.factorB) params.set('b', state.factorB);

        params.set('ap', serializeBool(state.autoPartition));
        params.set('fl', serializeBool(state.showFactorLabels));
        params.set('pp', serializeBool(state.showPartialProducts));
        params.set('t', serializeBool(state.showTotal));
        params.set('gl', serializeBool(state.showGridLines));
        params.set('ar', serializeBool(state.showArray));

        if (state.revealedCells.size > 0) {
            params.set('rc', serializeList(Array.from(state.revealedCells), s => s));
        }

        return params;
    },

    deserialize: (params) => {
        const factorA = deserializeString(params.get('a'), '');
        const factorB = deserializeString(params.get('b'), '');

        const autoPartition = deserializeBool(params.get('ap'), false);
        const showFactorLabels = deserializeBool(params.get('fl'), true);
        const showPartialProducts = deserializeBool(params.get('pp'), true);
        const showTotal = deserializeBool(params.get('t'), true);
        const showGridLines = deserializeBool(params.get('gl'), true);
        const showArray = deserializeBool(params.get('ar'), false);

        const revealedCells = new Set(parseList(params.get('rc'), s => s));

        return {
            factorA,
            factorB,
            autoPartition,
            showFactorLabels,
            showPartialProducts,
            showTotal,
            showGridLines,
            showArray,
            revealedCells
        };
    }
};
