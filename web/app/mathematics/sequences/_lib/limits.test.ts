import { computeSequence } from './sequences';
import { sequencesURLSerializer } from './url-state';

describe('sequences limits (DoS prevention)', () => {
    // Current behavior (fixed): clamping
    it('should clamp sequence length to MAX_SEQUENCE_LENGTH in computeSequence', () => {
        const hugeLength = 10000;
        // After fix: should clamp to 100
        const result = computeSequence('arithmetic', 1, 1, 0, 0, hugeLength);
        expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should clamp termCount in deserializer', () => {
        const params = new URLSearchParams();
        params.set('tc', '10000');

        // After fix: should clamp to 100
        const state = sequencesURLSerializer.deserialize(params);
        expect(state?.termCount).toBeLessThanOrEqual(100);
    });
});
