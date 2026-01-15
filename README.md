# MathTools

MathTools is a suite of interactive digital manipulatives designed for mathematics education. It provides teachers and students with virtual tools to explore mathematical concepts visually and kinetically.

## Project Purpose

The goal of this project is to create high-quality, web-based educational tools that are:
- **Intuitive**: Easy for students to pick up and use immediately.
- **Visual**: Leveraging the power of digital mediums to visualize abstract concepts.
- **Accessible**: Available on any device with a web browser.

## Available Tools

### 1. Algebra Tiles
A comprehensive environment for modeling algebraic concepts such as:
- Solving linear equations
- Factorizing quadratics
- Exploring integer arithmetic
*Status: Architecture finalized (Hooks + Components).*

### 2. Double Sided Counters
A tool for teaching integer operations using positive (yellow) and negative (red) counters. Features include:
- Zero pair cancellation animations
- Automated number line tracking
- Sorting and grouping animations
- **Shareable URLs**: Generate links to share exact counter configurations
*Status: Architecture aligned with project standards. URL state sharing implemented.*

### 3. Circuit Designer
A logic gate simulator for Computer Science students.
- **Components**: Switches, Bulbs, AND, OR, NOT, XOR gates.
- **Features**:
    - Real-time signal propagation.
    - Truth Table generation.
    - Group selection (Marquee) and Drag-to-Delete.
    - Quick Demo presets.
*Status: Active development. Recently updated with multi-select and enhanced UI.*

## Built With

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context + Hooks
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for Dark Mode support
- **Testing**: [Jest](https://jestjs.io/) (unit), [Playwright](https://playwright.dev/) (E2E)

## Project Structure

This project follows a standard Next.js App Router structure with a separation of concerns between pages (`app/`) and reusable UI components (`components/`).

### Directory Overview

- **`app/`**: Contains the route segments and page definitions.
  - **`mathematics/`**: Dedicated section for the interactive mathematics tools.
    - **`[tool-name]/`**: Each tool (e.g., `algebra-tiles`) has its own subdirectory containing its page and tool-specific local components (in `_components/`).
- **`components/`**: Shared reusable components.
  - **`tool-ui/`**: Components shared across multiple tools (e.g., `Canvas`, `TileBase`, `Toolbar`).
  - **`ui/`**: General UI components (coming soon).
- **`lib/`**: Utility functions and custom hooks.
  - **`url-state.ts`**: Generic URL state serialization utilities for shareable tool configurations.

### key Architectural Concepts

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
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Guidelines

### Documentation
- **JSDoc**: All exported functions, interfaces, and components must have JSDoc comments explaining their purpose and parameters.
- **Inline Comments**: Complex logic (e.g., event propagation, math calculations) should be explained with inline comments.

### Styling
- Use Tailwind CSS utility classes for styling.
- Support Dark Mode for all components using the `dark:` prefix.

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

Tests are located in the `__tests__` directory at the project root, mirroring the `app/` and `components/` structure:
- **Component Tests**: Unit tests for individual components (e.g., `__tests__/components/footer.test.tsx`).
- **Page Tests**: Snapshot tests to ensure pages render correctly (e.g., `__tests__/app/page.test.tsx`).
- **Logic Tests**: Integration tests for complex interactions (e.g., `__tests__/app/mathematics/double-sided-counters/page.test.tsx`).

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

- **Location**: Tests are in the `e2e/` directory at the project root.
- **Configuration**: `playwright.config.ts` defines browser settings and dev server startup.
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
