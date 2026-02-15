
## 2025-05-27 - Circuit Designer DoS Vulnerability
**Vulnerability:** Client-side Denial of Service (DoS) via Prototype Pollution in `useCircuitDesigner`.
**Learning:** Checking `!COMPONENT_TYPES[type]` is insufficient because `type` can be `"constructor"`, which returns the `Object` constructor (truthy). This allowed adding a node with type `"constructor"`, causing a crash when accessing `def.evaluate` (since the constructor function doesn't have it).
**Prevention:** Always use `Object.prototype.hasOwnProperty.call(COMPONENT_TYPES, type)` when validating input against a dictionary, especially when the input comes from untrusted sources like Drag & Drop data or URL parameters.
