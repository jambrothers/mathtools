import { solve, generatePuzzle, formatSolution, Operation, GameConfig } from "@/app/games/countdown/_lib/countdown-solver";

describe("Countdown Solver", () => {
    test("finds an exact solution for a simple puzzle", () => {
        const sources = [10, 5, 2];
        const target = 17;
        const allowedOperations: Operation[] = ['+', '-'];

        const solution = solve(sources, target, allowedOperations);

        expect(solution).not.toBeNull();
        expect(solution?.isExact).toBe(true);
        expect(solution?.result).toBe(17);
    });

    test("finds an exact solution for a classic puzzle", () => {
        const sources = [75, 50, 2, 3, 8, 7];
        const target = 812;
        const allowedOperations: Operation[] = ['+', '-', '*', '/'];

        const solution = solve(sources, target, allowedOperations);

        expect(solution).not.toBeNull();
        expect(solution?.isExact).toBe(true);
        expect(solution?.result).toBe(812);
    });

    test("respects allowed operations", () => {
        const sources = [10, 5];
        const target = 50;

        // Impossible with only + and -
        const solutionNoMult = solve(sources, target, ['+', '-']);
        expect(solutionNoMult?.isExact).toBe(false);
        expect(solutionNoMult?.result).toBe(15); // Best is 10 + 5

        // Possible with *
        const solutionWithMult = solve(sources, target, ['+', '-', '*']);
        expect(solutionWithMult?.isExact).toBe(true);
        expect(solutionWithMult?.result).toBe(50);
    });

    test("finds closest result when exact is impossible", () => {
        const sources = [10, 10];
        const target = 25;
        const solution = solve(sources, target, ['+', '-', '*', '/']);

        expect(solution?.isExact).toBe(false);
        expect(solution?.result).toBe(20); // 10 + 10
    });

    test("handles division only for integers", () => {
        const sources = [10, 4];
        const target = 2; // Not possible with these sources using only /
        const solution = solve(sources, target, ['/']);

        expect(solution?.isExact).toBe(false);
    });

    test("handles indices (^) correctly in advanced mode", () => {
        const sources = [2, 5, 10];
        const target = 100; // possible via base 10
        const solution = solve(sources, target, ['^', '+', '-', '*', '/']);

        expect(solution?.isExact).toBe(true);
    });

    test("solver caps indices results and parameters", () => {
        const sources = [21, 2]; // base > 20 not allowed for ^ in our solver
        const target = 441;
        const solution = solve(sources, target, ['^']);
        expect(solution?.isExact).toBe(false); // Should not use ^ for base 21 even if 21^2 = 441
    });
});

describe("Puzzle Generation", () => {
    const config: GameConfig = {
        allowedOperations: ['+', '-', '*', '/'],
        largeNumbersCount: 2,
        targetRange: [100, 999]
    };

    test("generates a valid puzzle with correct number count", () => {
        const puzzle = generatePuzzle(config);
        expect(puzzle.sources).toHaveLength(6);
        expect(puzzle.target).toBeGreaterThanOrEqual(100);
        expect(puzzle.target).toBeLessThanOrEqual(999);

        const largeCount = puzzle.sources.filter(n => [25, 50, 75, 100].includes(n)).length;
        expect(largeCount).toBe(2);
    });

    test("generates target in foundation range", () => {
        const foundationConfig: GameConfig = {
            allowedOperations: ['+', '-'],
            largeNumbersCount: 0,
            targetRange: [10, 50]
        };
        const puzzle = generatePuzzle(foundationConfig);
        expect(puzzle.target).toBeGreaterThanOrEqual(10);
        expect(puzzle.target).toBeLessThanOrEqual(50);
    });
});

describe("Solution Formatting", () => {
    test("formats a simple solution correctly", () => {
        const solution = {
            steps: [{ a: 10, b: 5, op: '+' as Operation, result: 15 }],
            result: 15,
            target: 15,
            isExact: true
        };
        const formatted = formatSolution(solution);
        expect(formatted).toContain("10 + 5 = 15");
    });

    test("indicates when no solution is found", () => {
        expect(formatSolution(null)).toContain("No solution found.");
    });
});
