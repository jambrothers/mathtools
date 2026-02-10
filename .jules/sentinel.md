## 2025-02-14 - Custom URL State Serialization Injection
**Vulnerability:** Parameter injection in `Circuit Designer` tool due to unescaped delimiters (`:` and `;`) in user-controlled labels within the custom URL state string format.
**Learning:** The application uses custom compact string formats (e.g. `type:id:x,y:label`) to minimize URL length, but failed to sanitize user inputs that could contain the format's delimiters.
**Prevention:** Always use `encodeURIComponent` when embedding user input into delimited strings, even for "internal" serialization formats.

## 2025-02-14 - Unbounded URL State Deserialization (DoS)
**Vulnerability:** The custom URL state deserialization functions (e.g., `parseCounterString`, `parseTileString`) did not limit the number of items parsed, allowing an attacker to craft a URL with thousands of items, causing a Denial of Service (browser freeze/crash).
**Learning:** Custom serialization logic must include limits on the number of deserialized objects to prevent resource exhaustion attacks.
**Prevention:** Implement explicit limits (e.g., `MAX_ITEMS`) in loops that instantiate objects from user-controlled input.

## 2025-02-26 - Allocation Before Validation in String Splitting
**Vulnerability:** Using `string.split(delimiter)` on potentially large user-controlled inputs creates a massive array of strings before any validation or limiting can occur, leading to immediate memory exhaustion (DoS).
**Learning:** Even with a loop limit, the initial `split()` call is a vulnerability if the input size isn't capped first.
**Prevention:** Use iterative parsing (e.g., `indexOf` loop) with a counter to process the string lazily, stopping once the limit is reached, or cap the input string length before processing.
