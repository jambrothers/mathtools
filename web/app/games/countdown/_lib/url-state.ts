import {
    URLStateSerializer,
    serializeList,
    parseList,
    serializeNumber,
    deserializeNumber
} from '@/lib/url-state';
import { GameConfig, Operation } from './countdown-solver';

export interface CountdownURLState {
    config: GameConfig;
    sources: number[];
    target: number;
}

const PARAM_OPS = 'ops';
const PARAM_SOURCES = 'src';
const PARAM_TARGET = 'tgt';
const PARAM_RANGE = 'rng';
const PARAM_LARGE = 'lrg';

export const countdownURLSerializer: URLStateSerializer<CountdownURLState> = {
    serialize(state: CountdownURLState): URLSearchParams {
        const params = new URLSearchParams();

        // Serialize operations
        const opsStr = serializeList(state.config.allowedOperations, (op) => op, { delimiter: ',' });
        if (opsStr) params.set(PARAM_OPS, opsStr);

        // Serialize sources
        const sourcesStr = serializeList(state.sources, (n) => String(n), { delimiter: ',' });
        if (sourcesStr) params.set(PARAM_SOURCES, sourcesStr);

        // Serialize target
        params.set(PARAM_TARGET, serializeNumber(state.target));

        // Serialize config extras
        const rangeStr = `${state.config.targetRange[0]},${state.config.targetRange[1]}`;
        params.set(PARAM_RANGE, rangeStr);

        params.set(PARAM_LARGE, String(state.config.largeNumbersCount));

        return params;
    },
    deserialize(params: URLSearchParams): CountdownURLState | null {
        const sourcesStr = params.get(PARAM_SOURCES);
        const targetStr = params.get(PARAM_TARGET);
        if (!sourcesStr || !targetStr) return null;

        // SECURITY: Limit sources to 6 to prevent DoS via factorial complexity in solver
        // We use maxItems in parseList, but also slice to be double-safe against implementation changes
        const sources = parseList(sourcesStr, (n) => Number(n), { delimiter: ',', maxItems: 6 }).slice(0, 6);
        const target = deserializeNumber(targetStr);

        const opsStr = params.get(PARAM_OPS);
        const validOps = ['+', '-', '*', '/', '^'];
        const allowedOperations = opsStr
            ? parseList(opsStr, (op) => validOps.includes(op) ? op as Operation : null, { delimiter: ',' })
            : ['+', '-', '*', '/'] as Operation[];

        const rangeStr = params.get(PARAM_RANGE);
        let targetRange: [number, number] = [100, 999];
        if (rangeStr) {
            const rangeParts = rangeStr.split(',');
            if (rangeParts.length === 2) {
                targetRange = [Number(rangeParts[0]), Number(rangeParts[1])];
            }
        }

        const largeStr = params.get(PARAM_LARGE);
        const largeNumbersCount = largeStr === 'random' ? 'random' : deserializeNumber(largeStr, 1);

        return {
            config: {
                allowedOperations,
                largeNumbersCount: largeNumbersCount as number | 'random',
                targetRange
            },
            sources,
            target
        };
    }
};
