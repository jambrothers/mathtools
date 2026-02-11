# TeachMaths.net

TeachMaths.net (formerly MathTools) is a suite of interactive digital manipulatives designed for mathematics education. It provides teachers and students with virtual tools to explore mathematical concepts visually and kinetically.

## Project Purpose

The goal of this project is to create high-quality, web-based educational tools that are:
- **Intuitive**: Easy for students to pick up and use immediately.
- **Visual**: Leveraging the power of digital mediums to visualize abstract concepts.
- **Accessible**: Available on any device with a web browser.
- **Warm & Academic**: Following our [Design System](DESIGN.md) to create a welcoming learning environment.

## Available Tools

### 1. Algebra Tiles
A comprehensive environment for modeling algebraic concepts such as:
- Solving linear equations
- Factorizing quadratics
- Exploring integer arithmetic

*Status: Architecture finalized (Hooks + Components).*
[Documentation](./web/app/mathematics/algebra-tiles/HELP.md)

### 2. Double Sided Counters
A tool for teaching integer operations using positive (yellow) and negative (red) counters. Features include:
- **Algebraic Variables**: Support for symbolic variables (x, y, z...) alongside integer counters.
- Zero pair cancellation animations
- Automated number line tracking
- Sorting and grouping animations
- **Shareable URLs**: Generate links to share exact counter configurations

*Status: Architecture aligned with project standards. URL state sharing implemented.*
[Documentation](./web/app/mathematics/double-sided-counters/HELP.md)

### 3. Bar Model
A visualization tool for problem-solving using proportional bars.
- **Operations**: Split (halves, thirds, fifths), Join, Clone.
- **Features**:
    - Comparison braces (Totals).
    - Relative and custom labeling.
    - Drag-and-drop interface.

*Status: Stable. Core functionality implemented.*
[Documentation](./web/app/mathematics/bar-model/HELP.md)

### 4. Linear Equations
An interactive graph for exploring linear relationships ($y = mx + c$).
- **Interaction Modes**: Move ($c$), Rotate ($m$), and Select.
- **Visual Aids**: Slope triangles, intercepts, and equation display.
- **Export**: Save graphs as PNG or SVG.

*Status: Stable. Export and interaction modes available.*
[Documentation](./web/app/mathematics/linear-equations/HELP.md)

### 5. Circuit Designer
A logic gate simulator for Computer Science students.
- **Components**: Switches, Bulbs, AND, OR, NOT, XOR gates.
- **Features**:
    - Real-time signal propagation.
    - Truth Table generation and validation.
    - Multi-selection and Drag-to-Delete.
    - Quick Demo presets.

*Status: Stable. Recently updated with multi-select and enhanced UI.*
[Documentation](./web/app/computing/circuit-designer/HELP.md)

## Key Features

### Documentation & Help System
Each tool includes a built-in help system accessible via the toolbar. Documentation is written in Markdown (e.g., `HELP.md` in each tool's directory) and rendered dynamically using `react-markdown`.

### Design System
We follow a strict [Design System](DESIGN.md) to ensure consistency and accessibility.
- **Philosophy**: "Warm and Approachable" yet "Academic".
- **Typography**: Merriweather for headings, Inter for body text.
- **Theming**: Full Dark Mode support.

## Built With

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Content**: [react-markdown](https://github.com/remarkjs/react-markdown)
- **State Management**: React Context + Hooks
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for Dark Mode support
- **Testing**: [Jest](https://jestjs.io/) (unit), [Playwright](https://playwright.dev/) (E2E)

## Project Structure

This project uses a **monorepo structure** to support both the frontend (Next.js) and future backend (Python/FastAPI on Cloudflare Workers).

### Directory Overview

```
mathtools/
├── web/                    # Next.js frontend (Cloudflare Pages)
│   ├── app/               # Route segments and pages
│   ├── components/        # Shared UI components
│   ├── lib/               # Utilities and hooks
│   ├── public/            # Static assets
│   └── ...
└── README.md
```

- **`web/app/`**: Contains the route segments and page definitions.
  - **`mathematics/`**: Dedicated section for interactive mathematics tools (e.g., Algebra Tiles).
  - **`computing/`**: Dedicated section for computing tools (e.g., Circuit Designer).
    - **`[tool-name]/`**: Each tool (e.g., `algebra-tiles`) has its own subdirectory containing its page, `HELP.md`, and tool-specific local components.
- **`web/components/`**: Shared reusable components. [Documentation](./web/components/README.md)
  - **`tool-ui/`**: Components shared across multiple tools (e.g., `Canvas`, `TileBase`, `Toolbar`, `HelpModal`).
- **`lib/`**: Utility functions and custom hooks.
  - **`url-state.ts`**: Generic URL state serialization utilities for shareable tool configurations.

### Key Architectural Concepts

#### Page Title Context
We use a global `PageTitleContext` to manage the application header state. This allows individual tools deep in the hierarchy to:
1. Set the global page title dynamically.
2. Control the visibility of the main navigation bar (e.g., hiding it to maximize screen real estate for a canvas).

#### Tool Architecture
Most tools follow a similar pattern:
- **Page**: The entry point that sets up the layout.
- **Canvas**: An interactive area that handles global events (selection, clearing).
- **Items**: Individual interactive elements (Tiles) that handle their own drag/drop logic.
- **Toolbar**: A control panel for modifying tool state.

## Getting Started

First, install the dependencies:

```bash
cd web
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is deployed to **Cloudflare Pages** as a static site.

### Build for Production

```bash
cd web
npm run build
```

This generates a static export in `web/out/` which is deployed to Cloudflare Pages.

## Development Guidelines

### Documentation
- **JSDoc**: All exported functions, interfaces, and components must have JSDoc comments explaining their purpose and parameters.
- **Inline Comments**: Complex logic (e.g., event propagation, math calculations) should be explained with inline comments.

### Styling
- Use Tailwind CSS utility classes for styling.
- Support Dark Mode for all components using the `dark:` prefix.
- Refer to `DESIGN.md` for color tokens and typography rules.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Testing

We use [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) to ensure the reliability of our application.

### Running Tests

To run the full test suite:
```bash
npm run test
```

To run tests in watch mode (re-runs on file save):
```bash
npm run test:watch
```

### Test Structure

- **Framework**: Jest serves as the test runner and assertion library.
- **Environment**: `jsdom` is used to simulate a browser environment.
- **Library**: `react-testing-library` is used to render components and query the DOM in a way that resembles how users find elements.

Tests are located in the `web/__tests__` directory, mirroring the `app/` and `components/` structure:
- **Component Tests**: Unit tests for individual components (e.g., `web/__tests__/components/footer.test.tsx`).
- **Page Tests**: Snapshot tests to ensure pages render correctly (e.g., `web/__tests__/app/page.test.tsx`).
- **Logic Tests**: Integration tests for complex interactions (e.g., `web/__tests__/app/mathematics/double-sided-counters/page.test.tsx`).

### Adding New Tests

1.  **Identify the Target**: Decide if you are testing a reusable component or a page.
2.  **Create the File**: Create a new file in the appropriate subdirectory of `__tests__`.
    - Naming convention: `[filename].test.tsx`
3.  **Write the Test**:
    - Import `render` and `screen` from `@testing-library/react`.
    - Use `describe` to group tests and `it` for individual test cases.
    - **Snapshots**: Use `expect(container).toMatchSnapshot()` for static pages.
    - **Interactions**: Use `fireEvent` to simulate user actions (clicks, inputs).

Example:
```tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
    it('renders correctly', () => {
        render(<MyComponent />)
        expect(screen.getByText('Expected Text')).toBeInTheDocument()
    })
})
```

## End-to-End Testing

We use [Playwright](https://playwright.dev/) for browser-based end-to-end testing to verify complete user workflows.

### Running E2E Tests

To run all E2E tests:
```bash
npm run test:e2e
```

### E2E Test Structure

- **Location**: Tests are in the `web/e2e/` directory.
- **Configuration**: `web/playwright.config.ts` defines browser settings and dev server startup.
- **Browsers**: Tests run in Chromium by default.

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('should add counters and generate shareable URL', async ({ page }) => {
    await page.goto('/mathematics/double-sided-counters');
    await page.click('text=Add +1');
    await page.click('button:has-text("Link")');
    // URL is copied to clipboard
});
```
