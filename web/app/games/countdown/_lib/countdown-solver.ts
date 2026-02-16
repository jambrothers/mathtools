export type Operation = '+' | '-' | '*' | '/' | '^';

export interface Step {
    a: number;
    b: number;
    op: Operation;
    result: number;
}

export interface Solution {
    steps: Step[];
    result: number;
    target: number;
    isExact: boolean;
}

export interface Puzzle {
    sources: number[];
    target: number;
    solution: Solution | null;
}

export interface GameConfig {
    allowedOperations: Operation[];
    largeNumbersCount: number | 'random';
    targetRange: [number, number];
}

const LARGE_NUMBERS = [25, 50, 75, 100];
const SMALL_NUMBERS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];

/**
 * Solve a Countdown puzzle using a recursive depth-first search.
 */
export function solve(
    sources: number[],
    target: number,
    allowedOperations: Operation[]
): Solution | null {
    let bestSolution: Solution | null = null;
    let closestDiff = Infinity;

    function search(currentNumbers: number[], steps: Step[]) {
        for (let i = 0; i < currentNumbers.length; i++) {
            const num = currentNumbers[i];
            const diff = Math.abs(target - num);

            if (diff < closestDiff) {
                closestDiff = diff;
                bestSolution = {
                    steps: [...steps],
                    result: num,
                    target,
                    isExact: diff === 0
                };
                if (diff === 0) return true;
            }
        }

        if (currentNumbers.length === 1) return false;

        for (let i = 0; i < currentNumbers.length; i++) {
            for (let j = 0; j < currentNumbers.length; j++) {
                if (i === j) continue;

                const a = currentNumbers[i];
                const b = currentNumbers[j];
                const remaining = currentNumbers.filter((_, idx) => idx !== i && idx !== j);

                for (const op of allowedOperations) {
                    let result: number | null = null;

                    switch (op) {
                        case '+':
                            result = a + b;
                            break;
                        case '-':
                            if (a - b > 0) result = a - b;
                            break;
                        case '*':
                            result = a * b;
                            break;
                        case '/':
                            if (b !== 0 && a % b === 0) result = a / b;
                            break;
                        case '^':
                            if (b >= 0 && b <= 10 && a >= 0 && a <= 20) {
                                const pow = Math.pow(a, b);
                                if (Number.isInteger(pow) && pow <= 1000000) result = pow;
                            }
                            break;
                    }

                    if (result !== null) {
                        if (search([...remaining, result], [...steps, { a, b, op, result }])) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    search(sources, []);
    return bestSolution;
}

/**
 * Generate a new Countdown puzzle based on the provided configuration.
 */
export function generatePuzzle(config: GameConfig): Puzzle {
    const { largeNumbersCount, targetRange, allowedOperations } = config;

    // Draw numbers
    const count = typeof largeNumbersCount === 'number' ? largeNumbersCount : Math.floor(Math.random() * 5);

    const shuffledLarge = [...LARGE_NUMBERS].sort(() => Math.random() - 0.5);
    const shuffledSmall = [...SMALL_NUMBERS].sort(() => Math.random() - 0.5);

    const sources = [
        ...shuffledLarge.slice(0, count),
        ...shuffledSmall.slice(0, 6 - count)
    ].sort((a, b) => b - a);

    // Generate target
    const target = Math.floor(Math.random() * (targetRange[1] - targetRange[0] + 1)) + targetRange[0];

    const solution = solve(sources, target, allowedOperations);

    return {
        sources,
        target,
        solution
    };
}

/**
 * Format a solution step-by-step for display.
 */
export function formatSolution(solution: Solution | null): string[] {
    if (!solution) return ["No solution found."];

    const steps = solution.steps.map(step => {
        const opSymbol = step.op === '*' ? '×' : step.op === '/' ? '÷' : step.op;
        return `${step.a} ${opSymbol} ${step.b} = ${step.result}`;
    });

    if (!solution.isExact) {
        steps.push(`Closest result: ${solution.result}`);
    }

    return steps;
}
