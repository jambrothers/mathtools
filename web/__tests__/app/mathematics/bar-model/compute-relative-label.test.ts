
import { computeRelativeLabel } from '@/app/mathematics/bar-model/_lib/compute-relative-label';

describe('computeRelativeLabel', () => {
    // User Example 1: 100 units total, 20 units part
    // Ratio = 1/5

    test('Number label: "100" -> "20"', () => {
        expect(computeRelativeLabel(20, 100, "100")).toBe("20");
    });

    test('Number label: "1" -> "1/5"', () => {
        // User explicitly asked for this:
        // "Total label, Other label"
        // "1, 1/5"
        expect(computeRelativeLabel(20, 100, "1")).toBe("1/5");
    });

    test('Variable label: "x" -> "x/5"', () => {
        expect(computeRelativeLabel(20, 100, "x")).toBe("x/5");
    });

    test('Variable coeff label: "20x" -> "4x"', () => {
        expect(computeRelativeLabel(20, 100, "20x")).toBe("4x");
    });

    test('Percentage label: "100%" -> "20%"', () => {
        expect(computeRelativeLabel(20, 100, "100%")).toBe("20%");
    });

    // Additional robust tests
    test('Variable complex fraction: "x" with 2/5 ratio -> "2x/5"', () => {
        // 40 / 100 = 2/5
        expect(computeRelativeLabel(40, 100, "x")).toBe("2x/5");
    });

    test('Unknown label handling', () => {
        expect(computeRelativeLabel(20, 100, "Total")).toBe("Total/5");
    });
});
