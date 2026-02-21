import {
    URLStateSerializer,
    hasAnyParam,
    serializeBool,
    deserializeBool,
    deserializeString,
    deserializeNumber,
} from '@/lib/url-state';
import { SequenceType, MAX_SEQUENCE_LENGTH } from './sequences';

export interface SequencesURLState {
    sequenceType: SequenceType;
    a: number;
    d: number;
    r: number;
    d2: number;
    termCount: number;
    revealedCount: number;
    showCounters: boolean;
    showRule: boolean;
    showNthTerm: boolean;
    showConfig: boolean;
}

const PARAM_TYPE = 't';
const PARAM_A = 'a';
const PARAM_D = 'd';
const PARAM_R = 'r';
const PARAM_D2 = 'd2';
const PARAM_TERM_COUNT = 'tc';
const PARAM_REVEALED_COUNT = 'rc';
const PARAM_COUNTERS = 'sc';
const PARAM_RULE = 'sr';
const PARAM_NTH = 'sn';
const PARAM_CONFIG = 'cfg';

export const sequencesURLSerializer: URLStateSerializer<SequencesURLState> = {
    serialize(state: SequencesURLState): URLSearchParams {
        const params = new URLSearchParams();
        params.set(PARAM_TYPE, state.sequenceType);
        params.set(PARAM_A, String(state.a));
        params.set(PARAM_D, String(state.d));
        params.set(PARAM_R, String(state.r));
        params.set(PARAM_D2, String(state.d2));
        params.set(PARAM_TERM_COUNT, String(state.termCount));
        params.set(PARAM_REVEALED_COUNT, String(state.revealedCount));
        params.set(PARAM_COUNTERS, serializeBool(state.showCounters));
        params.set(PARAM_RULE, serializeBool(state.showRule));
        params.set(PARAM_NTH, serializeBool(state.showNthTerm));
        params.set(PARAM_CONFIG, serializeBool(state.showConfig));
        return params;
    },
    deserialize(params: URLSearchParams): SequencesURLState | null {
        const hasAny = hasAnyParam(params, [
            PARAM_TYPE,
            PARAM_A,
            PARAM_D,
            PARAM_R,
            PARAM_D2,
            PARAM_TERM_COUNT,
            PARAM_REVEALED_COUNT,
            PARAM_COUNTERS,
            PARAM_RULE,
            PARAM_NTH,
            PARAM_CONFIG,
        ]);
        if (!hasAny) return null;

        const typeStr = deserializeString(params.get(PARAM_TYPE), 'arithmetic');
        const sequenceType = (['arithmetic', 'geometric', 'quadratic'].includes(typeStr)
            ? typeStr
            : 'arithmetic') as SequenceType;

        return {
            sequenceType,
            a: deserializeNumber(params.get(PARAM_A), 2),
            d: deserializeNumber(params.get(PARAM_D), 3),
            r: deserializeNumber(params.get(PARAM_R), 2),
            d2: deserializeNumber(params.get(PARAM_D2), 2),
            // Security: clamp termCount to prevent DoS
            termCount: Math.min(deserializeNumber(params.get(PARAM_TERM_COUNT), 0), MAX_SEQUENCE_LENGTH),
            revealedCount: deserializeNumber(params.get(PARAM_REVEALED_COUNT), 0),
            showCounters: deserializeBool(params.get(PARAM_COUNTERS), true),
            showRule: deserializeBool(params.get(PARAM_RULE), false),
            showNthTerm: deserializeBool(params.get(PARAM_NTH), false),
            showConfig: deserializeBool(params.get(PARAM_CONFIG), false),
        };
    }
};
