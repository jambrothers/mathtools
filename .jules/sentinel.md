
## 2024-05-25 - [Client-Side DoS via Recursive Solver]
**Vulnerability:** A recursive solver for the Countdown game (factorial complexity) was exposed to user-controlled input via URL parameters without length limits. A user could supply >6 numbers, causing the browser to freeze for minutes or crash.
**Learning:** Performance issues in client-side code can become security vulnerabilities (DoS) if inputs are controlled by the user (e.g., shareable URLs) and lack strict bounds.
**Prevention:** Always enforce strict upper bounds on array lengths and recursion depth for computationally expensive algorithms exposed to user input. Use `maxItems` in parsing utilities and validate input size before processing.
