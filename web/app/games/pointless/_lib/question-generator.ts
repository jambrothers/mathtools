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

export function generateQuestion(category: QuestionCategory): Question {
    switch (category) {
        case "factors":
            return generateFactorsQuestion();
        case "multiples-in-range":
            return generateMultiplesQuestion();
        case "primes-in-range":
            return generatePrimesQuestion();
        case "squares-in-range":
            return generateSquaresQuestion();
        case "cubes-in-range":
            return generateCubesQuestion();
        case "powers-of-2":
            return generatePowersOf2Question();
        case "triangular-numbers":
            return generateTriangularNumbersQuestion();
        default:
            throw new Error(`Unknown category: ${category}`);
    }
}

function generateFactorsQuestion(): Question {
    const options = [48, 60, 72, 84, 90, 96, 120, 144, 180, 240];
    const n = options[Math.floor(Math.random() * options.length)];
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

function generateMultiplesQuestion(): Question {
    const multiplier = Math.floor(Math.random() * 9) + 2; // 2-10
    const min = Math.floor(Math.random() * 50);
    const max = min + 100 + Math.floor(Math.random() * 100);

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

function generatePrimesQuestion(): Question {
    const max = 50 + Math.floor(Math.random() * 150); // 50-200
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

function generateSquaresQuestion(): Question {
    const max = 100 + Math.floor(Math.random() * 900); // 100-1000
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

function generateCubesQuestion(): Question {
    const max = 200 + Math.floor(Math.random() * 800); // 200-1000
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

function generatePowersOf2Question(): Question {
    const max = [128, 256, 512, 1024, 2048][Math.floor(Math.random() * 5)];
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

function generateTriangularNumbersQuestion(): Question {
    const max = 50 + Math.floor(Math.random() * 150); // 50-200
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
