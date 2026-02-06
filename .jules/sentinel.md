## 2025-02-14 - Custom URL State Serialization Injection
**Vulnerability:** Parameter injection in `Circuit Designer` tool due to unescaped delimiters (`:` and `;`) in user-controlled labels within the custom URL state string format.
**Learning:** The application uses custom compact string formats (e.g. `type:id:x,y:label`) to minimize URL length, but failed to sanitize user inputs that could contain the format's delimiters.
**Prevention:** Always use `encodeURIComponent` when embedding user input into delimited strings, even for "internal" serialization formats.
