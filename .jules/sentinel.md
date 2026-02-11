## 2025-02-14 - Custom URL State Serialization Injection
**Vulnerability:** Parameter injection in `Circuit Designer` tool due to unescaped delimiters (`:` and `;`) in user-controlled labels within the custom URL state string format.
**Learning:** The application uses custom compact string formats (e.g. `type:id:x,y:label`) to minimize URL length, but failed to sanitize user inputs that could contain the format's delimiters.
**Prevention:** Always use `encodeURIComponent` when embedding user input into delimited strings, even for "internal" serialization formats.

## 2025-02-14 - Unbounded URL State Deserialization (DoS)
**Vulnerability:** The custom URL state deserialization functions (e.g., `parseCounterString`, `parseTileString`) did not limit the number of items parsed, allowing an attacker to trigger a Denial of Service (browser freeze/crash).
**Learning:** Custom serialization logic must include limits on the number of deserialized objects to prevent resource exhaustion attacks.
**Prevention:** Implement explicit limits (e.g., `MAX_ITEMS`) in loops that instantiate objects from user-controlled input.

## 2025-02-26 - Allocation Before Validation in String Splitting
**Vulnerability:** Using `string.split(delimiter)` on potentially large user-controlled inputs creates a massive array of strings before any validation or limiting can occur, leading to immediate memory exhaustion (DoS).
**Learning:** Even with a loop limit, the initial `split()` call is a vulnerability if the input size isn't capped first.
**Prevention:** Use iterative parsing (e.g., `indexOf` loop) with a counter to process the string lazily, stopping once the limit is reached, or cap the input string length before processing.

## 2026-02-09 - Allocation-Based DoS in URL State Parsing
**Vulnerability:** Found a potential Denial of Service (DoS) vulnerability in `linear-equations` URL state deserialization where `value.split('|').slice(0, MAX_LINES)` would attempt to allocate memory for all items in the input string before limiting them, allowing an attacker to trigger OOM/CPU exhaustion with a crafted URL containing millions of delimiters.
**Learning:** Even when logically limiting items (via `.slice()`), the underlying string processing method (like `.split()`) may allocate memory proportional to the input size *before* the limit is applied.
**Prevention:** Use iterative parsing approaches (like `parseList`) that process the input string incrementally and stop processing once the item limit (`maxItems`) is reached, avoiding unnecessary allocation.

## 2026-02-28 - Nested Unbounded Splitting in Item Parsers
**Vulnerability:** While `parseList` uses iterative parsing to limit the number of items, the individual item parsers (e.g., `parseNodeString`) used unbounded `split()` on item properties, allowing DoS via a single massive item with many delimiters.
**Learning:** Iterative parsing at the top level is insufficient if the inner parsing logic for each item is vulnerable to allocation attacks.
**Prevention:** Apply `limit` to `split()` calls even within individual item parsing logic, or validate length before splitting.
