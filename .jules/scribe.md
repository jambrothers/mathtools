# Scribe's Journal

## 2024-05-22 - Tool Documentation Pattern
**Learning:** Tool-specific documentation is located in `web/app/mathematics/[tool-name]/HELP.md` (and `computing/`), separate from the main documentation.
**Action:** When updating tool features, always verify if the corresponding `HELP.md` needs updates or new screenshots.

## 2024-05-22 - Test Location Misconception
**Learning:** The project root README incorrectly stated tests were at the root. All tests (unit and E2E) reside within the `web/` directory.
**Action:** Always verify directory paths in documentation against the actual file system before publishing.

## 2026-02-10 - Tool UI Documentation Gap
**Learning:** Shared UI components in `web/components/tool-ui/` were undocumented, making it hard to understand the "Scaffolded Layout" pattern.
**Action:** Created `web/components/tool-ui/README.md` and added JSDoc to core layout components. Future shared libraries must have a README explanation.
