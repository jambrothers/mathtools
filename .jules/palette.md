## 2026-02-09 - Missing Focus Indicators on Custom Buttons
**Learning:** The project uses Tailwind CSS (v4) which resets default button styles, including focus rings. Custom components like `ToolbarButton` and `HelpButton` lacked explicit focus styles, making them inaccessible to keyboard users.
**Action:** Always verify keyboard accessibility (tab navigation) on interactive components. Use `focus-visible` utilities (`ring-2`, `ring-offset-2`) to provide clear visual feedback without affecting mouse users.

## 2026-02-10 - Copy to Clipboard Feedback
**Learning:** Copy to clipboard actions often fail to provide immediate visual confirmation. Simple text "Copied" toast is good, but changing the button state (Icon + Label) provides stronger feedback.
**Action:** For clipboard actions, always change the button state (e.g. "Link" -> "Copied!") for immediate visual feedback, in addition to a `role="status"` toast for screen readers.

## 2026-02-11 - Accessible Collapsible Sections
**Learning:** Collapsible sections (`ControlSection`) require `aria-expanded` on the trigger and `aria-controls` pointing to the content ID to be fully accessible to screen readers.
**Action:** When building collapsibles, always generate a unique ID (via `useId`) for the content and link it to the trigger button using ARIA attributes.

## 2026-02-13 - Accessible Names for Graphical Tiles
**Learning:** Draggable graphical items (like algebra tiles) often lack text labels, making them inaccessible to screen readers. Relying solely on `title` attributes is insufficient.
**Action:** Always provide explicit `aria-label` or visible text for graphical buttons. Use descriptive names like 'Add vertical +x tile' instead of generic labels.

## 2026-02-14 - Modal Accessibility Essentials
**Learning:** Modals (like `HelpModal`) must manage keyboard focus and ARIA roles to be accessible. Critical missing features were: Escape key support, `role="dialog"`, `aria-modal="true"`, and initial focus management.
**Action:** When building modals, always implement:
1. `useEffect` for Escape key listener.
2. `role="dialog"` and `aria-modal="true"` on the container.
3. `aria-labelledby` pointing to the title ID.
4. Focus a key interactive element (like Close button) on mount.

## 2026-02-15 - Toggle Button State Feedback
**Learning:** Standard `<button>` elements used for toggling features (like visibility or mode selection) often rely only on visual cues (background color), making their state invisible to screen readers.
**Action:** Always use `aria-pressed={isActive}` for toggle buttons and mode selectors to explicitly communicate state changes. Pair this with `aria-label` when the button text (e.g., "1") lacks context.

## 2026-02-16 - Input Labels in Game Configurations
**Learning:** Game configuration sidebars often group inputs visually (e.g., "Min/Max" under a "Range" label) but fail to programmatically associate labels with inputs using `htmlFor`.
**Action:** When visual labels are implicit or grouped, always provide explicit `aria-label` attributes on the inputs (e.g., "Minimum target value") to ensure screen readers can identify them.
