## 2026-02-09 - Missing Focus Indicators on Custom Buttons
**Learning:** The project uses Tailwind CSS (v4) which resets default button styles, including focus rings. Custom components like `ToolbarButton` and `HelpButton` lacked explicit focus styles, making them inaccessible to keyboard users.
**Action:** Always verify keyboard accessibility (tab navigation) on interactive components. Use `focus-visible` utilities (`ring-2`, `ring-offset-2`) to provide clear visual feedback without affecting mouse users.
