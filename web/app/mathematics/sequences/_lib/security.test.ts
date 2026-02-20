import { computeSequence, MAX_SEQUENCE_LENGTH } from "./sequences";
import { sequencesURLSerializer } from "./url-state";

describe("Sequences Security", () => {
  it("should limit sequence length to prevent DoS", () => {
    // Attempt to generate 1,000,000 items
    const largeLength = 1000000;

    // This should complete instantly and not hang
    const terms = computeSequence("arithmetic", 1, 1, 0, 0, largeLength);

    // Should be clamped to the safe maximum
    expect(terms.length).toBeLessThanOrEqual(MAX_SEQUENCE_LENGTH);
    expect(terms.length).toBe(MAX_SEQUENCE_LENGTH); // Since 1,000,000 > MAX
  });

  it("should clamp termCount in deserialization", () => {
    const params = new URLSearchParams();
    params.set("tc", "1000000");

    const state = sequencesURLSerializer.deserialize(params);

    // Should be clamped to the safe maximum
    expect(state?.termCount).toBe(MAX_SEQUENCE_LENGTH);
  });
});
