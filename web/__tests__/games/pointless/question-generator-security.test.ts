
import { generateQuestion } from "@/app/games/pointless/_lib/question-generator";

describe("Question Generator Security", () => {
    describe("DoS Prevention via Input Validation", () => {

        test("clamps huge 'n' for factors", () => {
            // 1 billion would be too slow if processed, but we just check the parameter clamp.
            // If it processes 1 billion, it might timeout, which is also a failure.
            // We use a large number that is definitely unsafe if not clamped.
            const unsafeN = 1000000000;
            const q = generateQuestion("factors", { n: unsafeN });

            // Should be clamped to a reasonable limit (e.g. 10,000)
            expect((q.parameters.n as number)).toBeLessThanOrEqual(10000);
        });

        test("clamps huge 'max' for primes", () => {
            const unsafeMax = 1000000000;
            // Primes calculation is expensive. This should be clamped.
            const q = generateQuestion("primes-in-range", { max: unsafeMax });

            expect((q.parameters.max as number)).toBeLessThanOrEqual(10000);
        });

        test("clamps small 'multiplier' to prevent infinite loop", () => {
            const unsafeMultiplier = 0.0000001;
            const q = generateQuestion("multiples-in-range", { multiplier: unsafeMultiplier, min: 0, max: 100 });

            // Multiplier should be at least 1 (or sensible integer)
            expect((q.parameters.multiplier as number)).toBeGreaterThanOrEqual(1);
        });

        test("clamps huge range for multiples", () => {
            const unsafeMax = 1000000000;
            const q = generateQuestion("multiples-in-range", { multiplier: 1, min: 0, max: unsafeMax });

            expect((q.parameters.max as number)).toBeLessThanOrEqual(10000);
        });

        test("clamps huge 'max' for squares", () => {
            const unsafeMax = 1000000000;
            const q = generateQuestion("squares-in-range", { max: unsafeMax });

            expect((q.parameters.max as number)).toBeLessThanOrEqual(100000);
        });

        test("clamps huge 'max' for cubes", () => {
            const unsafeMax = 1000000000;
            const q = generateQuestion("cubes-in-range", { max: unsafeMax });

            expect((q.parameters.max as number)).toBeLessThanOrEqual(100000);
        });

        test("clamps huge 'max' for triangular numbers", () => {
            const unsafeMax = 1000000000;
            const q = generateQuestion("triangular-numbers", { max: unsafeMax });

            expect((q.parameters.max as number)).toBeLessThanOrEqual(100000);
        });
    });
});
