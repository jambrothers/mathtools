import {
    generateQuestion,
    QuestionCategory
} from "@/app/games/pointless/_lib/question-generator";

describe("Question Generator", () => {
    const categories: QuestionCategory[] = [
        "factors",
        "multiples-in-range",
        "primes-in-range",
        "squares-in-range",
        "cubes-in-range",
        "powers-of-2",
        "triangular-numbers"
    ];

    categories.forEach((category) => {
        test(`generates a valid question for category: ${category}`, () => {
            const question = generateQuestion(category);

            expect(question.category).toBe(category);
            expect(typeof question.text).toBe("string");
            expect(question.text.length).toBeGreaterThan(0);
            expect(Array.isArray(question.answers)).toBe(true);
            expect(question.answers.length).toBeGreaterThan(1); // Pointless needs several options
        });
    });

    describe("Factors", () => {
        test("correctly calculates factors of 144", () => {
            // We'll expose a specific generator or allow passing params for testing if needed, 
            // but for now let's test a few random ones for mathematical correctness
            for (let i = 0; i < 5; i++) {
                const q = generateQuestion("factors");
                const n = q.parameters.n as number;
                q.answers.forEach(ans => {
                    expect(n % ans).toBe(0);
                });
                // Check we have all factors (simplistic check)
                const expectedCount = countFactors(n);
                expect(q.answers.length).toBe(expectedCount);
            }
        });

        test("edge case: factor of 1", () => {
            // Technically 1 only has [1], but game logic might want to avoid such simple cases.
            // Let's see how implementation handles it.
        });
    });

    describe("Multiples in range", () => {
        test("all answers are within range and are multiples", () => {
            for (let i = 0; i < 5; i++) {
                const q = generateQuestion("multiples-in-range");
                const multiplier = q.parameters.multiplier as number;
                const min = q.parameters.min as number;
                const max = q.parameters.max as number;
                q.answers.forEach(ans => {
                    expect(ans % multiplier).toBe(0);
                    expect(ans).toBeGreaterThanOrEqual(min);
                    expect(ans).toBeLessThanOrEqual(max);
                });
            }
        });
    });

    describe("Primes in range", () => {
        test("all answers are prime", () => {
            const q = generateQuestion("primes-in-range");
            q.answers.forEach(ans => {
                expect(isPrime(ans)).toBe(true);
            });
        });
    });

    describe("Squares and Cubes", () => {
        test("all squares are valid", () => {
            const q = generateQuestion("squares-in-range");
            q.answers.forEach(ans => {
                const root = Math.sqrt(ans);
                expect(Number.isInteger(root)).toBe(true);
            });
        });

        test("all cubes are valid", () => {
            const q = generateQuestion("cubes-in-range");
            q.answers.forEach(ans => {
                const root = Math.cbrt(ans);
                expect(Number.isInteger(root)).toBe(true);
            });
        });
    });
});

// Helper for tests
function countFactors(n: number): number {
    let count = 0;
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) count++;
    }
    return count;
}

function isPrime(n: number): boolean {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}
