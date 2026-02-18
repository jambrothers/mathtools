
import { countdownURLSerializer } from '../../app/games/countdown/_lib/url-state';

describe('Countdown URL Security', () => {
    it('should limit sources to 6 items to prevent DoS', () => {
        const params = new URLSearchParams();
        // Provide 10 numbers
        params.set('src', '1,2,3,4,5,6,7,8,9,10');
        params.set('tgt', '100');

        const state = countdownURLSerializer.deserialize(params);

        expect(state).not.toBeNull();
        if (state) {
            expect(state.sources.length).toBe(6);
            expect(state.sources).toEqual([1, 2, 3, 4, 5, 6]);
        }
    });

    it('should filter invalid operations', () => {
        const params = new URLSearchParams();
        params.set('src', '1,2,3,4,5,6');
        params.set('tgt', '100');
        // valid ops mixed with invalid ones
        params.set('ops', '+,-,invalid,*,/,foo,^');

        const state = countdownURLSerializer.deserialize(params);

        expect(state).not.toBeNull();
        if (state) {
            expect(state.config.allowedOperations).toContain('+');
            expect(state.config.allowedOperations).toContain('-');
            expect(state.config.allowedOperations).toContain('*');
            expect(state.config.allowedOperations).toContain('/');
            expect(state.config.allowedOperations).toContain('^');
            expect(state.config.allowedOperations).not.toContain('invalid');
            expect(state.config.allowedOperations).not.toContain('foo');
            expect(state.config.allowedOperations.length).toBe(5);
        }
    });

    it('should handle missing operations gracefully (default)', () => {
        const params = new URLSearchParams();
        params.set('src', '1,2,3');
        params.set('tgt', '100');

        const state = countdownURLSerializer.deserialize(params);

        expect(state).not.toBeNull();
        if (state) {
            expect(state.config.allowedOperations).toEqual(['+', '-', '*', '/']);
        }
    });
});
