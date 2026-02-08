
/**
 * Calculates Greatest Common Divisor
 * Re-implementing here to keep this file pure/independent.
 */
function getGcd(a: number, b: number): number {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b > 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

/**
 * Simplifies a fraction n/d
 */
function simplifyFraction(n: number, d: number): { n: number, d: number } {
    if (d === 0) return { n: 0, d: 0 };
    const divisor = getGcd(n, d);
    return { n: Math.round(n / divisor), d: Math.round(d / divisor) };
}

import { RelativeDisplayFormat } from "../constants";

export function computeRelativeLabel(
    barWidth: number,
    totalBarWidth: number,
    totalLabel: string,
    displayFormat?: RelativeDisplayFormat
): string {
    if (!totalLabel || totalBarWidth === 0) return "?";

    // 1. Calculate ratio fraction (barWidth / totalBarWidth)
    // Always use simplified fraction for storage/computation (this rounds to integers)
    const ratio = simplifyFraction(barWidth, totalBarWidth);

    // For non-fraction formats, we might want the exact value
    const rawRatio = barWidth / totalBarWidth;

    // 2. Handle Explicit Display Formats (if specified)
    if (displayFormat && displayFormat !== 'total') {
        // Handle zero specially
        if (Math.abs(rawRatio) < 0.001) {
            if (displayFormat === 'percentage') return "0%";
            return "0";
        }

        if (displayFormat === 'fraction') {
            if (ratio.n === 0) return "0";
            return ratio.d === 1 ? String(ratio.n) : `${ratio.n}/${ratio.d}`;
        }
        if (displayFormat === 'decimal') {
            // Remove trailing extra zeros if possible but keep up to 2 decimal places if needed
            // For integers, return integer string
            if (Math.abs(rawRatio % 1) < 0.001) return String(Math.round(rawRatio));
            return String(Number(rawRatio.toFixed(2)));
        }
        if (displayFormat === 'percentage') {
            const val = rawRatio * 100;
            // If it's an integer percentage (e.g. 50%), show integer
            if (val % 1 === 0) return `${val}%`;
            return `${Number(val.toFixed(1))}%`;
        }
    }

    // If ratio is 0 (and we are in 'total' mode), return 0
    if (ratio.n === 0) return "0";


    // 3. Fallback to "Match Total" (Default Behavior)
    // Parse total label to decide format
    const label = totalLabel.trim();

    // CASE: Percentage "100%"
    if (label.endsWith('%')) {
        const numPart = parseFloat(label.replace('%', ''));
        if (!isNaN(numPart)) {
            // Treat as number but append %
            // (num * ratio.n) / ratio.d
            // For percentages, we typically expect numbers. 
            // example 100% * 1/5 = 20%. 
            // example 33% * 1/5 = 6.6%.
            // Stick to decimal for percentages unless integer.
            const newVal = (numPart * ratio.n) / ratio.d;
            return `${Number(newVal.toFixed(2))}%`;
        }
    }

    // CASE: Pure Number "100", "1"
    const numberVal = parseFloat(label);
    if (!isNaN(numberVal) && String(numberVal) === label) {
        // Calculate as fraction: (numberVal * ratio.n) / ratio.d
        // If integer result, return string.
        // If fraction, return fraction.

        // We need to work with fractions here to support "1" -> "1/5".
        // numberVal might be decimal though (e.g. "2.5").
        // If numberVal is integer, we can try to simplify.
        if (Number.isInteger(numberVal)) {
            const top = numberVal * ratio.n;
            const bottom = ratio.d;
            const sim = simplifyFraction(top, bottom);
            if (sim.d === 1) return String(sim.n);
            return `${sim.n}/${sim.d}`;
        } else {
            // Decimal input, return decimal output
            const newVal = (numberVal * ratio.n) / ratio.d;
            return String(Number(newVal.toFixed(2)));
        }
    }

    // CASE: Variable or Term "x", "20x", "Total"
    // Regex matches "x", "20x", "Total"
    const termMatch = label.match(/^(\d+(?:\.\d+)?)?([a-zA-Z]+)$/);
    if (termMatch) {
        const coeffStr = termMatch[1];
        const variable = termMatch[2];
        const coeff = coeffStr ? parseFloat(coeffStr) : 1;

        // New coefficient = coeff * ratio
        // We will try to keep it fractional if possible, for style "x/5"

        const newTop = coeff * ratio.n;
        const newBottom = ratio.d;

        // If coeff is decimal, fallback to decimal coeff 
        // e.g. 0.5x * 1/2 = 0.25x
        if (!Number.isInteger(coeff)) {
            const newCoeff = (coeff * ratio.n) / ratio.d;
            return `${Number(newCoeff.toFixed(2))}${variable}`;
        }

        // Simplify fraction
        const sim = simplifyFraction(newTop, newBottom);

        if (sim.d === 1) {
            // Integer coefficient: 1x -> x, 4x -> 4x
            return sim.n === 1 ? variable : `${sim.n}${variable}`;
        } else {
            // Fraction: x/5, 2x/5, Total/5
            const numPrefix = sim.n === 1 ? '' : String(sim.n);
            return `${numPrefix}${variable}/${sim.d}`;
        }
    }

    // Fallback: Just append fraction of label?
    if (ratio.d === 1) {
        return ratio.n === 1 ? label : `${ratio.n}(${label})`;
    }
    return `${ratio.n}/${ratio.d}(${label})`;
}
