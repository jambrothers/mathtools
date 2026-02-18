import {
    URLStateSerializer,
    serializeList,
    parseList
} from '@/lib/url-state';
import { QuestionCategory } from './question-generator';

export interface PointlessURLState {
    category: QuestionCategory;
    params: Record<string, number | string>;
}

const PARAM_CATEGORY = 'c';
const PARAM_PARAMS = 'p';

export const pointlessURLSerializer: URLStateSerializer<PointlessURLState> = {
    serialize(state: PointlessURLState): URLSearchParams {
        const params = new URLSearchParams();
        params.set(PARAM_CATEGORY, state.category);

        const paramEntries = Object.entries(state.params).map(([key, value]) => `${key}:${value}`);
        const serializedParams = serializeList(paramEntries, (item) => item, { delimiter: ',' });

        if (serializedParams) {
            params.set(PARAM_PARAMS, serializedParams);
        }

        return params;
    },
    deserialize(params: URLSearchParams): PointlessURLState | null {
        const categoryStr = params.get(PARAM_CATEGORY);
        if (!categoryStr) return null;

        const category = categoryStr as QuestionCategory;
        const pValue = params.get(PARAM_PARAMS);
        const stateParams: Record<string, number | string> = {};

        if (pValue) {
            const parts = parseList(pValue, (part) => part, { delimiter: ',' });
            parts.forEach(part => {
                const [key, val] = part.split(':');
                if (key && val !== undefined) {
                    const num = Number(val);
                    stateParams[key] = isNaN(num) ? val : num;
                }
            });
        }

        return {
            category,
            params: stateParams
        };
    }
};
