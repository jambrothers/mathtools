
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

export function computeRelativeLabel(
    barWidth: number,
    totalBarWidth: number,
    totalLabel: string
): string {
    if (!totalLabel || totalBarWidth === 0) return "?";

    // 1. Calculate ratio fraction (barWidth / totalBarWidth)
    const ratio = simplifyFraction(barWidth, totalBarWidth);

    // If ratio is 0, return 0
    if (ratio.n === 0) return "0";

    // 2. Parse total label
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
