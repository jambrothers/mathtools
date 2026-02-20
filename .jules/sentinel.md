
## 2025-02-17 - [Client-Side DoS in Fraction Wall]
**Vulnerability:** The `Fraction Wall` tool allowed deserializing arbitrary denominators from the URL, which could cause the browser to crash (DoS) by rendering millions of SVG elements if a malicious user shared a crafted link (e.g., `?v=1000000`).
**Learning:** Even client-side tools need input validation when restoring state from URLs, as these URLs can be shared and used as attack vectors against other users (e.g., "Check out this math problem...").
**Prevention:** Always enforce reasonable upper bounds (like `MAX_DENOMINATOR = 20`) on numeric inputs derived from URL parameters, especially when they control loop iterations or DOM element creation.
