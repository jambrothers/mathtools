export type QuestionCategory =
    | "factors"
    | "multiples-in-range"
    | "primes-in-range"
    | "squares-in-range"
    | "cubes-in-range"
    | "powers-of-2"
    | "triangular-numbers";

export interface Question {
    category: QuestionCategory;
    text: string;
    answers: number[];
    parameters: Record<string, number | string>;
}

export function generateQuestion(
    category: QuestionCategory,
    manualParams?: Record<string, number | string>
): Question {
    switch (category) {
        case "factors":
            return generateFactorsQuestion(manualParams);
        case "multiples-in-range":
            return generateMultiplesQuestion(manualParams);
        case "primes-in-range":
            return generatePrimesQuestion(manualParams);
        case "squares-in-range":
            return generateSquaresQuestion(manualParams);
        case "cubes-in-range":
            return generateCubesQuestion(manualParams);
        case "powers-of-2":
            return generatePowersOf2Question(manualParams);
        case "triangular-numbers":
            return generateTriangularNumbersQuestion(manualParams);
        default:
            throw new Error(`Unknown category: ${category}`);
    }
}

function generateFactorsQuestion(params?: Record<string, number | string>): Question {
    const options = [48, 60, 72, 84, 90, 96, 120, 144, 180, 240];
    const n = (params?.n as number) ?? options[Math.floor(Math.random() * options.length)];
    const answers: number[] = [];
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) answers.push(i);
    }
    return {
        category: "factors",
        text: `Factors of ${n}`,
        answers,
        parameters: { n }
    };
}

function generateMultiplesQuestion(params?: Record<string, number | string>): Question {
    const multiplier = (params?.multiplier as number) ?? (Math.floor(Math.random() * 9) + 2); // 2-10
    const min = (params?.min as number) ?? Math.floor(Math.random() * 50);
    const max = (params?.max as number) ?? (min + 100 + Math.floor(Math.random() * 100));

    const answers: number[] = [];
    for (let i = Math.ceil(min / multiplier) * multiplier; i <= max; i += multiplier) {
        if (i >= min) answers.push(i);
    }

    return {
        category: "multiples-in-range",
        text: `Multiples of ${multiplier} between ${min} and ${max}`,
        answers,
        parameters: { multiplier, min, max }
    };
}

function generatePrimesQuestion(params?: Record<string, number | string>): Question {
    const max = (params?.max as number) ?? (50 + Math.floor(Math.random() * 150)); // 50-200
    const answers: number[] = [];
    for (let i = 2; i <= max; i++) {
        if (isPrime(i)) answers.push(i);
    }
    return {
        category: "primes-in-range",
        text: `Prime numbers less than ${max}`,
        answers,
        parameters: { max }
    };
}

function generateSquaresQuestion(params?: Record<string, number | string>): Question {
    const max = (params?.max as number) ?? (100 + Math.floor(Math.random() * 900)); // 100-1000
    const answers: number[] = [];
    for (let i = 1; i * i <= max; i++) {
        answers.push(i * i);
    }
    return {
        category: "squares-in-range",
        text: `Square numbers less than or equal to ${max}`,
        answers,
        parameters: { max }
    };
}

function generateCubesQuestion(params?: Record<string, number | string>): Question {
    const max = (params?.max as number) ?? (200 + Math.floor(Math.random() * 800)); // 200-1000
    const answers: number[] = [];
    for (let i = 1; i * i * i <= max; i++) {
        answers.push(i * i * i);
    }
    return {
        category: "cubes-in-range",
        text: `Cube numbers less than or equal to ${max}`,
        answers,
        parameters: { max }
    };
}

function generatePowersOf2Question(params?: Record<string, number | string>): Question {
    const options = [128, 256, 512, 1024, 2048];
    const max = (params?.max as number) ?? options[Math.floor(Math.random() * options.length)];
    const answers: number[] = [];
    for (let i = 1; i <= max; i *= 2) {
        answers.push(i);
    }
    return {
        category: "powers-of-2",
        text: `Powers of 2 up to ${max}`,
        answers,
        parameters: { max }
    };
}

function generateTriangularNumbersQuestion(params?: Record<string, number | string>): Question {
    const max = (params?.max as number) ?? (50 + Math.floor(Math.random() * 150)); // 50-200
    const answers: number[] = [];
    let n = 1;
    while (true) {
        const tri = (n * (n + 1)) / 2;
        if (tri > max) break;
        answers.push(tri);
        n++;
    }
    return {
        category: "triangular-numbers",
        text: `Triangular numbers less than or equal to ${max}`,
        answers,
        parameters: { max }
    };
}

// Helpers
function isPrime(n: number): boolean {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}
