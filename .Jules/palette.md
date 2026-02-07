## 2026-02-06 - Responsive Toolbar Buttons
**Learning:** Toolbar buttons with `label` props often hide the text on mobile (`hidden lg:inline`). Without explicit `aria-label` or `title`, these become inaccessible "mystery meat" navigation on small screens.
**Action:** Always verify icon-only buttons (responsive or not) have `aria-label` derived from the label if not provided explicitly.
