import {
  computeSequence,
  getWordedRule,
  getNthTermFormula,
  SequenceType,
  generateRandomParams,
} from "./sequences";

describe("sequences logic", () => {
  describe("computeSequence", () => {
    it("computes arithmetic sequences", () => {
      expect(computeSequence("arithmetic", 2, 3, 0, 0, 5)).toEqual([
        2, 5, 8, 11, 14,
      ]);
      expect(computeSequence("arithmetic", 10, -2, 0, 0, 4)).toEqual([
        10, 8, 6, 4,
      ]);
      expect(computeSequence("arithmetic", 0, 0, 0, 0, 3)).toEqual([0, 0, 0]);
    });

    it("computes geometric sequences", () => {
      expect(computeSequence("geometric", 3, 0, 2, 0, 4)).toEqual([
        3, 6, 12, 24,
      ]);
      expect(computeSequence("geometric", 100, 0, 0.5, 0, 3)).toEqual([
        100, 50, 25,
      ]);
      expect(computeSequence("geometric", 5, 0, -1, 0, 3)).toEqual([5, -5, 5]);
    });

    it("handles floating point precision in geometric sequences", () => {
      // Case reported by user: a=2, r=0.1
      const seq = computeSequence("geometric", 2, 0, 0.1, 0, 5);
      // Without fix, this might contain 0.20000000000000004 etc.
      expect(seq).toEqual([2, 0.2, 0.02, 0.002, 0.0002]);

      // Another case: a=1, r=0.3
      const seq2 = computeSequence("geometric", 1, 0, 0.3, 0, 3);
      expect(seq2).toEqual([1, 0.3, 0.09]);
    });

    it("computes quadratic sequences", () => {
      expect(computeSequence("quadratic", 1, 3, 0, 2, 5)).toEqual([
        1, 4, 9, 16, 25,
      ]);
      expect(computeSequence("quadratic", 4, 7, 0, 4, 4)).toEqual([
        4, 11, 22, 37,
      ]);
    });
  });

  describe("getWordedRule", () => {
    it("formats arithmetic rules", () => {
      expect(getWordedRule("arithmetic", 3, 2, 0, 0)).toBe(
        "Start at 3, add 2 each term",
      );
      expect(getWordedRule("arithmetic", 5, -1, 0, 0)).toBe(
        "Start at 5, subtract 1 each term",
      );
      expect(getWordedRule("arithmetic", 2, 0, 0, 0)).toBe(
        "Start at 2, add 0 each term",
      );
    });

    it("formats geometric rules", () => {
      expect(getWordedRule("geometric", 2, 0, 3, 0)).toBe(
        "Start at 2, multiply by 3 each term",
      );
      expect(getWordedRule("geometric", 10, 0, 0.5, 0)).toBe(
        "Start at 10, multiply by 0.5 each term",
      );
    });

    it("formats quadratic rules", () => {
      expect(getWordedRule("quadratic", 1, 3, 0, 2)).toBe(
        "A quadratic sequence starting at 1",
      );
    });
  });

  describe("getNthTermFormula", () => {
    it("formats arithmetic nth term", () => {
      expect(getNthTermFormula("arithmetic", 3, 2, 0, 0)).toBe("T(n) = 2n + 1");
      expect(getNthTermFormula("arithmetic", 5, -1, 0, 0)).toBe(
        "T(n) = -n + 6",
      );
      expect(getNthTermFormula("arithmetic", 4, 0, 0, 0)).toBe("T(n) = 4");
    });

    it("formats geometric nth term", () => {
      expect(getNthTermFormula("geometric", 2, 0, 3, 0)).toBe(
        "T(n) = 2 × 3ⁿ⁻¹",
      );
      expect(getNthTermFormula("geometric", 1, 0, 2, 0)).toBe("T(n) = 2ⁿ⁻¹");
    });

    it("formats quadratic nth term", () => {
      expect(getNthTermFormula("quadratic", 1, 3, 0, 2)).toBe("T(n) = n²");
      expect(getNthTermFormula("quadratic", 4, 7, 0, 4)).toBe(
        "T(n) = 2n² + n + 1",
      );
    });
  });

  describe("generateRandomParams", () => {
    it("generates valid params without allowedTypes", () => {
      const params = generateRandomParams();
      expect(["arithmetic", "geometric", "quadratic"]).toContain(
        params.sequenceType,
      );
      expect(params.termCount).toBeGreaterThanOrEqual(4);
      expect(params.termCount).toBeLessThanOrEqual(8);

      const terms = computeSequence(
        params.sequenceType,
        params.a,
        params.d,
        params.r,
        params.d2,
        params.termCount,
      );
      expect(terms.length).toBe(params.termCount);
    });

    it("respects allowedTypes filter", () => {
      const params = generateRandomParams(["geometric"]);
      expect(params.sequenceType).toBe("geometric");

      const params2 = generateRandomParams(["arithmetic", "quadratic"]);
      expect(["arithmetic", "quadratic"]).toContain(params2.sequenceType);
    });
  });
});
