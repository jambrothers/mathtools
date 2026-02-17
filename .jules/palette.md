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

## 2026-02-17 - Timer Completion Feedback
**Learning:** Timer components are inherently visual and often fail to communicate completion to screen readers unless explicitly managed. Simply updating text isn't enough; a `role="status"` live region is required to announce "Timer finished". Also, `role="timer"` on the display helps semantics.
**Action:** When implementing timers, always pair the visual countdown with a visually hidden live region that announces key state changes (Start, Stop, Finished), and use `role="timer"` on the clock display.
