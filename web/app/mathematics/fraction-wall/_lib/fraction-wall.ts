/**
 * Logic for Fraction Wall tool.
 */

export interface Fraction {
    n: number;
    d: number;
}

/**
 * Simplifies a fraction.
 */
export function simplifyFraction(n: number, d: number): Fraction {
    const common = gcd(n, d);
    return { n: n / common, d: d / common };
}

/**
 * Calculates the greatest common divisor.
 */
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

/**
 * Checks if two fractions are equivalent.
 */
export function areEquivalent(f1: Fraction, f2: Fraction): boolean {
    const s1 = simplifyFraction(f1.n, f1.d);
    const s2 = simplifyFraction(f2.n, f2.d);
    return s1.n === s2.n && s1.d === s2.d;
}

/**
 * Compares two fractions.
 */
export function compareFractions(f1: Fraction, f2: Fraction): 'greater' | 'less' | 'equal' {
    const v1 = f1.n / f1.d;
    const v2 = f2.n / f2.d;

    // Using a tiny epsilon for float comparison safety, 
    // though for these small integers it should be fine.
    if (Math.abs(v1 - v2) < 0.0000001) return 'equal';
    return v1 > v2 ? 'greater' : 'less';
}

/**
 * Returns a list of equivalent fractions within a range of denominators.
 */
export function getEquivalentFractions(n: number, d: number, maxDenominator: number = 12): Fraction[] {
    const simple = simplifyFraction(n, d);
    const results: Fraction[] = [];

    for (let currentD = 1; currentD <= maxDenominator; currentD++) {
        // If currentD is a multiple of simple.d, we have an equivalent fraction
        if (currentD % simple.d === 0) {
            const factor = currentD / simple.d;
            results.push({ n: simple.n * factor, d: currentD });
        }
    }

    return results;
}

/**
 * Formats a fraction to a decimal string.
 */
export function fractionToDecimal(n: number, d: number, precision: number = 3): string {
    return (n / d).toFixed(precision).replace(/\.?0+$/, '');
}

/**
 * Formats a fraction to a percentage string.
 */
export function fractionToPercent(n: number, d: number): string {
    return Math.round((n / d) * 100) + '%';
}

/**
 * Counts the number of shaded segments for a given denominator.
 */
export function getShadedCount(denominator: number, shadedSegments: { d: number, i: number }[]): number {
    return shadedSegments.filter(s => s.d === denominator).length;
}
