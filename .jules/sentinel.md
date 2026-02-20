
## 2025-02-17 - [Client-Side DoS in Fraction Wall]
**Vulnerability:** The `Fraction Wall` tool allowed deserializing arbitrary denominators from the URL, which could cause the browser to crash (DoS) by rendering millions of SVG elements if a malicious user shared a crafted link (e.g., `?v=1000000`).
**Learning:** Even client-side tools need input validation when restoring state from URLs, as these URLs can be shared and used as attack vectors against other users (e.g., "Check out this math problem...").
**Prevention:** Always enforce reasonable upper bounds (like `MAX_DENOMINATOR = 20`) on numeric inputs derived from URL parameters, especially when they control loop iterations or DOM element creation.

## 2025-05-20 - [Client-Side DoS in Sequences]
**Vulnerability:** The `Sequences` tool allowed generating arbitrary length sequences via the `tc` (termCount) URL parameter, which could cause the browser to freeze/crash (DoS) by allocating massive arrays or running unbounded loops in `computeSequence`.
**Learning:** Client-side loop limits must be enforced in *both* the deserialization layer (to prevent invalid state) AND the core logic layer (defense in depth), especially when state can be restored from untrusted sources like URLs.
**Prevention:** Introduce `MAX_SEQUENCE_LENGTH` constants and clamp inputs in `url-state.ts` deserializers and core logic functions.
