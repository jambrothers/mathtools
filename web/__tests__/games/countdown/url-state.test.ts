import { countdownURLSerializer, CountdownURLState } from "@/app/games/countdown/_lib/url-state";
import { GameConfig } from "@/app/games/countdown/_lib/countdown-solver";

describe("Countdown URL State", () => {
    const config: GameConfig = {
        allowedOperations: ['+', '-', '*'],
        largeNumbersCount: 2,
        targetRange: [100, 500]
    };

    const state: CountdownURLState = {
        config,
        sources: [75, 50, 2, 3, 8, 7],
        target: 812
    };

    test("round-trips serialization and deserialization", () => {
        const params = countdownURLSerializer.serialize(state);
        const deserialized = countdownURLSerializer.deserialize(params);

        expect(deserialized).not.toBeNull();
        expect(deserialized?.target).toBe(state.target);
        expect(deserialized?.sources).toEqual(state.sources);
        expect(deserialized?.config.allowedOperations).toEqual(state.config.allowedOperations);
        expect(deserialized?.config.largeNumbersCount).toBe(state.config.largeNumbersCount);
        expect(deserialized?.config.targetRange).toEqual(state.config.targetRange);
    });

    test("handles 'random' large number count", () => {
        const randomState = {
            ...state,
            config: { ...config, largeNumbersCount: 'random' as const }
        };
        const params = countdownURLSerializer.serialize(randomState);
        const deserialized = countdownURLSerializer.deserialize(params);
        expect(deserialized?.config.largeNumbersCount).toBe('random');
    });

    test("returns null for missing required params", () => {
        const params = new URLSearchParams();
        params.set('tgt', '812');
        // Missing 'src'
        expect(countdownURLSerializer.deserialize(params)).toBeNull();
    });

    test("uses defaults for missing optional config params", () => {
        const params = new URLSearchParams();
        params.set('src', '10,5');
        params.set('tgt', '15');
        // Missing ops, rng, lrg

        const deserialized = countdownURLSerializer.deserialize(params);
        expect(deserialized).not.toBeNull();
        expect(deserialized?.config.allowedOperations).toEqual(['+', '-', '*', '/']);
        expect(deserialized?.config.targetRange).toEqual([100, 999]);
        expect(deserialized?.config.largeNumbersCount).toBe(1);
    });
});
