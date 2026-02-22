export interface Term {
    coefficient: number;
    variable?: string;
    exponent?: number;
}

export interface AreaModel {
    rowTerms: Term[];
    colTerms: Term[];
}

export interface PartialProduct {
    row: number;
    col: number;
    label: string;
    numericValue?: number;
}

/**
 * Parses a single factor input. 
 * Accepts integers, comma-separated partitions, and algebraic expressions.
 */
export function parseFactor(input: string): Term[] {
    if (!input || !input.trim()) return [];

    // Security: only allow inputs that look like math
    // Starts with number, or (, or variable. Contains numbers, variables, +, -, *, /, x, comma, ^, space
    if (!/^[0-9a-z\s,\+\-\*\/\(\)\^²³]+$/i.test(input)) return [];

    // Handle explicit comma-separated partitions
    if (input.includes(',')) {
        return input.split(',').map(s => s.trim()).filter(Boolean).map(s => {
            const parsed = parseSingleExpression(s);
            return parsed[0] || { coefficient: 0 };
        });
    }

    return parseSingleExpression(input);
}

function parseSingleExpression(expr: string): Term[] {
    const cleanExpr = expr.replace(/\s+/g, '').replace(/--/g, '+').replace(/\+\+/g, '+').replace(/\+-/g, '-').replace(/-\+/g, '-');
    // Match terms: coefficient followed by optional variable and exponent
    // Pattern: ([+-]?\d*)(variable part)?
    // Variable part: ([a-z](\^?\d+)?)
    const termRegex = /([+-]?\d*)([a-z](\^?\d+)?)?/g;
    const terms: Term[] = [];

    let match;
    while ((match = termRegex.exec(cleanExpr)) !== null) {
        if (match.index === termRegex.lastIndex) termRegex.lastIndex++;
        if (!match[0]) continue;

        // If it's strictly letters but not a known single-letter variable or multi-char term, 
        // and it doesn't have a coefficient, it's likely garbage.
        const coeffStr = match[1];
        const varPart = match[2];

        if (!coeffStr && !varPart) continue;

        // For this tool, we only really want to support single-char variables or standard exponents.
        // If it's a multi-char varPart without an exponent, it's likely garbage/words.
        if (varPart && varPart.length > 1 && !varPart.includes('^') && !varPart.includes('²') && !varPart.includes('³')) {
            continue;
        }

        // Secondary check: only allow 'typical' math variables if no coefficient
        if (!coeffStr && varPart && !/^[xyzabn]$/i.test(varPart.charAt(0))) {
            continue;
        }

        let coefficient = 1;
        if (coeffStr === '-') coefficient = -1;
        else if (coeffStr === '+' || coeffStr === '') coefficient = 1;
        else coefficient = parseInt(coeffStr, 10);

        if (isNaN(coefficient)) coefficient = 1;

        if (varPart) {
            const varMatch = varPart.match(/([a-z])(\^?(\d+))?/i);
            if (varMatch) {
                const variable = varMatch[1].toLowerCase();
                const exponentStr = varMatch[3];
                let exponent = 1;
                if (exponentStr) exponent = parseInt(exponentStr, 10);

                terms.push({ coefficient, variable, exponent });
            }
        } else if (coeffStr) {
            terms.push({ coefficient });
        }
    }

    return terms;
}

/**
 * Splits an integer by place value for the grid method.
 * e.g. 23 -> [20, 3]
 */
export function autoPartition(n: number): number[] {
    const s = Math.abs(n).toString();
    const result: number[] = [];

    for (let i = 0; i < s.length; i++) {
        const digit = parseInt(s[i], 10);
        if (digit !== 0) {
            result.push(digit * Math.pow(10, s.length - 1 - i));
        }
    }

    if (result.length === 0) return [0];

    const sign = Math.sign(n);
    return result.map(v => v * sign);
}

/**
 * Combines parsing + optional auto-partition.
 */
export function buildModel(rowInput: string, colInput: string, autoPartitionEnabled: boolean): AreaModel {
    let rowTerms = parseFactor(rowInput);
    let colTerms = parseFactor(colInput);

    // Auto-partition if enabled, only if input was a single simple integer
    if (autoPartitionEnabled) {
        if (rowTerms.length === 1 && !rowTerms[0].variable) {
            rowTerms = autoPartition(rowTerms[0].coefficient).map(c => ({ coefficient: c }));
        }
        if (colTerms.length === 1 && !colTerms[0].variable) {
            colTerms = autoPartition(colTerms[0].coefficient).map(c => ({ coefficient: c }));
        }
    }

    return { rowTerms, colTerms };
}

/**
 * Core helper: product of two individual terms.
 */
function multiplyTerms(a: Term, b: Term): Term {
    const coefficient = a.coefficient * b.coefficient;

    if (!a.variable && !b.variable) {
        return { coefficient };
    }

    if (a.variable && b.variable && a.variable === b.variable) {
        return {
            coefficient,
            variable: a.variable,
            exponent: (a.exponent || 1) + (b.exponent || 1)
        };
    }

    // Mixed variables or one numeric
    // Simple area model usually deals with same variable or one side numeric
    // For multi-variable (e.g. x and y), we'll just return first variable found for simplicity in this tool context
    // or we could support 'xy'. The NCETM doc mostly shows single variable.
    const variable = a.variable || b.variable;
    const exponent = (a.variable ? a.exponent || 1 : 0) + (b.variable ? b.exponent || 1 : 0);

    return { coefficient, variable, exponent };
}

/**
 * Multiplies each row term by each col term.
 */
export function computePartialProducts(model: AreaModel): PartialProduct[][] {
    const products: PartialProduct[][] = [];

    for (let i = 0; i < model.rowTerms.length; i++) {
        const row: PartialProduct[] = [];
        for (let j = 0; j < model.colTerms.length; j++) {
            const term = multiplyTerms(model.rowTerms[i], model.colTerms[j]);
            const label = formatTerm(term);
            const isNumeric = !term.variable;

            row.push({
                row: i,
                col: j,
                label,
                numericValue: isNumeric ? term.coefficient : undefined
            });
        }
        products.push(row);
    }

    return products;
}

/**
 * Display formatting for terms.
 */
export function formatTerm(term: Term): string {
    const { coefficient, variable, exponent } = term;

    if (!variable) return coefficient.toString();

    let result = '';
    if (coefficient === -1) result += '-';
    else if (coefficient !== 1) result += coefficient.toString();

    result += variable;

    if (exponent && exponent > 1) {
        if (exponent === 2) result += '²';
        else if (exponent === 3) result += '³';
        else result += `^${exponent}`;
    }

    return result;
}

/**
 * Sums and simplifies all partial products.
 */
export function computeTotal(products: PartialProduct[][], model: AreaModel): string {
    return computeTotalRefined(model);
}

/**
 * Refined computeTotal that actually collects like terms properly.
 */
function computeTotalRefined(model: AreaModel): string {
    const totalTerms: Term[] = [];

    for (const rowTerm of model.rowTerms) {
        for (const colTerm of model.colTerms) {
            totalTerms.push(multiplyTerms(rowTerm, colTerm));
        }
    }

    // Group by variable and exponent
    const groups: Record<string, number> = {};
    for (const t of totalTerms) {
        const key = t.variable ? `${t.variable}^{${t.exponent || 1}}` : 'constant';
        groups[key] = (groups[key] || 0) + t.coefficient;
    }

    // Format back to string
    const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === 'constant') return 1;
        if (b === 'constant') return -1;
        return b.localeCompare(a); // x^2 before x
    });

    const formattedTerms = sortedKeys
        .map(key => {
            const coeff = groups[key];
            if (coeff === 0) return null;

            if (key === 'constant') return coeff.toString();

            const match = key.match(/(.+)\^{(.+)}/);
            if (!match) return null;
            const variable = match[1];
            const exponent = parseInt(match[2], 10);

            return formatTerm({ coefficient: coeff, variable, exponent });
        })
        .filter(Boolean);

    if (formattedTerms.length === 0) return "0";

    // Join with plus signs, handling negatives
    let result = formattedTerms[0] || "";
    for (let i = 1; i < formattedTerms.length; i++) {
        const term = formattedTerms[i]!;
        if (term.startsWith('-')) {
            result += ' - ' + term.substring(1);
        } else {
            result += ' + ' + term;
        }
    }

    return result;
}

// Update the export to use the refined one
// export const computeTotalActual = (products: PartialProduct[][], model: AreaModel): string => {
//   return computeTotalRefined(model);
// };

// Re-export for the tests
// export { computeTotalRefined as computeTotal };

/**
 * Returns true if any term has a variable.
 */
export function isAlgebraic(model: AreaModel): boolean {
    return model.rowTerms.some(t => !!t.variable) || model.colTerms.some(t => !!t.variable);
}

/**
 * The stepwise arrows adjust the last numeric value in the factor string.
 */
export function adjustLastConstant(input: string, delta: number): string {
    if (!input.trim()) return delta > 0 ? delta.toString() : "0";

    // Try to find the last numeric part, including optional sign/operator
    // We want to capture the number and the preceding operator (+ or -)
    const match = input.match(/^(.*?)(([+-])\s*(\d+))$/);

    if (match) {
        const prefix = match[1];
        const operator = match[3];
        const num = parseInt(match[4], 10);
        const signedNum = operator === '-' ? -num : num;
        const newValue = signedNum + delta;

        if (newValue === 0) return prefix.trim() + " + 0"; // Fallback for zero

        const newOperator = newValue >= 0 ? '+' : '-';
        // If prefix is empty (e.g. just "5"), don't add the operator back unless it was there
        if (!prefix.trim() && !input.startsWith('+') && !input.startsWith('-')) {
            return newValue.toString();
        }

        return `${prefix.trimEnd()} ${newOperator} ${Math.abs(newValue)}`;
    }

    // If no operator found but it ends in a number (e.g. "20, 3" or just "23")
    const simpleNumMatch = input.match(/^(.*?)(\d+)$/);
    if (simpleNumMatch) {
        const prefix = simpleNumMatch[1];
        const num = parseInt(simpleNumMatch[2], 10);
        return prefix + (num + delta).toString();
    }

    // If it ends in a variable, append a constant
    if (input.match(/[a-z]$/i)) {
        return input + (delta > 0 ? ` + ${delta}` : ` - ${Math.abs(delta)}`);
    }

    return input;
}
