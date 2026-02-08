## 2026-02-06 - Responsive Toolbar Buttons
**Learning:** Toolbar buttons with `label` props often hide the text on mobile (`hidden lg:inline`). Without explicit `aria-label` or `title`, these become inaccessible "mystery meat" navigation on small screens.
**Action:** Always verify icon-only buttons (responsive or not) have `aria-label` derived from the label if not provided explicitly.

## 2026-02-06 - Toolbar Input Accessibility
**Learning:** Compact toolbars frequently omit visible labels for inputs and selects to save space, relying solely on placeholders which are insufficient for screen readers.
**Action:** When adding inputs or selects to toolbars, ensure `aria-label` is always provided if a visible `<label>` is not present. Update reusable components (like `CounterTypeSelect`) to accept `aria-label` props.
