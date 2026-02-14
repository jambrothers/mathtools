export type SequenceType = 'arithmetic' | 'geometric' | 'quadratic';

/**
 * Computes the terms of a sequence.
 * @param type - The type of sequence
 * @param a - First term (T(1))
 * @param d - Common difference (arithmetic) or first difference (quadratic)
 * @param r - Common ratio (geometric)
 * @param d2 - Second difference (quadratic)
 * @param length - Number of terms to compute
 */
export function computeSequence(
    type: SequenceType,
    a: number,
    d: number,
    r: number,
    d2: number,
    length: number
): number[] {
    const terms: number[] = [];
    if (length <= 0) return terms;

    if (type === 'arithmetic') {
        for (let n = 0; n < length; n++) {
            terms.push(a + n * d);
        }
    } else if (type === 'geometric') {
        for (let n = 0; n < length; n++) {
            terms.push(a * Math.pow(r, n));
        }
    } else if (type === 'quadratic') {
        // T(n) = An^2 + Bn + C
        const A = d2 / 2;
        const B = d - (3 * A);
        const C = a - A - B;

        for (let n = 1; n <= length; n++) {
            terms.push(A * n * n + B * n + C);
        }
    }

    return terms;
}

/**
 * Generates a worded rule for the sequence.
 */
export function getWordedRule(
    type: SequenceType,
    a: number,
    d: number,
    r: number,
    _d2: number
): string {
    if (type === 'arithmetic') {
        const action = d >= 0 ? 'add' : 'subtract';
        return `Start at ${a}, ${action} ${Math.abs(d)} each term`;
    } else if (type === 'geometric') {
        return `Start at ${a}, multiply by ${r} each term`;
    } else if (type === 'quadratic') {
        return `A quadratic sequence starting at ${a}`;
    }
    return '';
}

/**
 * Formats the nth term formula for the sequence.
 */
export function getNthTermFormula(
    type: SequenceType,
    a: number,
    d: number,
    r: number,
    d2: number
): string {
    if (type === 'arithmetic') {
        if (d === 0) return `T(n) = ${a}`;

        const c = a - d;
        let formula = 'T(n) = ';

        if (d === 1) formula += 'n';
        else if (d === -1) formula += '-n';
        else formula += `${d}n`;

        if (c > 0) formula += ` + ${c}`;
        else if (c < 0) formula += ` - ${Math.abs(c)}`;

        return formula;
    } else if (type === 'geometric') {
        if (a === 1) return `T(n) = ${r}ⁿ⁻¹`;
        return `T(n) = ${a} × ${r}ⁿ⁻¹`;
    } else if (type === 'quadratic') {
        const A = d2 / 2;
        const B = d - (3 * A);
        const C = a - A - B;

        let formula = 'T(n) = ';

        // n^2 term
        if (A !== 0) {
            if (A === 1) formula += 'n²';
            else if (A === -1) formula += '-n²';
            else formula += `${A}n²`;
        }

        // n term
        if (B !== 0) {
            const sign = B > 0 ? (formula === 'T(n) = ' ? '' : ' + ') : ' - ';
            const absB = Math.abs(B);
            formula += `${sign}${absB === 1 ? '' : absB}n`;
        }

        // constant term
        if (C !== 0) {
            const sign = C > 0 ? (formula === 'T(n) = ' ? '' : ' + ') : ' - ';
            formula += `${sign}${Math.abs(C)}`;
        }

        if (formula === 'T(n) = ') formula += '0';

        return formula;
    }
    return '';
}
