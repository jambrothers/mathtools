# Contributing to TeachMaths.net

Thank you for your interest in contributing to TeachMaths.net! We are building a suite of high-quality, interactive digital manipulatives for mathematics education.

This guide will help you set up your development environment and understand how to add new tools or improve existing ones.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v18+ recommended).
- **npm**: We use npm for package management.

### Installation

1.  Clone the repository.
2.  Navigate to the `web` directory (where the frontend lives):
    ```bash
    cd web
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The transformative hot-reloading feature will automatically update the page as you edit files.

## Project Structure

This project is a monorepo with the frontend located in the `web/` directory.

```
mathtools/
├── web/
│   ├── app/               # Next.js App Router (pages and layouts)
│   │   ├── mathematics/   # Math tools (e.g., algebra-tiles)
│   │   ├── computing/     # Computing tools (e.g., circuit-designer)
│   │   └── tools/         # Tools gallery page
│   ├── components/        # Shared UI components
│   │   └── tool-ui/       # Tool-specific components (Toolbar, Canvas, etc.)
│   ├── lib/               # Utilities and hooks (url-state, dragging)
│   ├── public/            # Static assets
│   └── ...
├── .jules/                # Project documentation and agent memory
└── README.md              # Main project documentation
```

For more details on UI components, see [`web/components/tool-ui/README.md`](./web/components/tool-ui/README.md).

## Development Workflow

### Adding a New Tool

To add a new interactive tool (e.g., "My New Tool"), follow these steps:

1.  **Create the Directory**:
    Create a new folder in `web/app/mathematics/` (or `computing/`):
    ```bash
    mkdir web/app/mathematics/my-new-tool
    ```

2.  **Create the Page**:
    Create `page.tsx` inside your new folder. Use the `ToolScaffold` component to structure your layout.
    ```tsx
    import { ToolScaffold } from "@/components/tool-ui/tool-scaffold"
    // Import your help content and other components

    export default function MyNewToolPage() {
        return (
            <ToolScaffold
                title="My New Tool"
                // ... props
            >
                <MyCanvasComponent />
            </ToolScaffold>
        )
    }
    ```

3.  **Add Documentation**:
    Create a `HELP.md` file in the same directory. This file provides the content for the in-tool help modal.
    - Use clear headers.
    - Explain features and interactions.
    - See existing tools for examples (e.g., `web/app/mathematics/algebra-tiles/HELP.md`).

4.  **Register the Tool**:
    - Update `web/app/tools/page.tsx` to include your new tool in the gallery.
    - Update the root `README.md` to list your tool under "Available Tools".

### Testing

We use Jest for unit testing and Playwright for end-to-end (E2E) testing.

- **Unit Tests**:
  Run all unit tests:
  ```bash
  npm run test
  ```
  Run tests in watch mode:
  ```bash
  npm run test:watch
  ```

- **E2E Tests**:
  Run end-to-end tests (requires the dev server to be running or built):
  ```bash
  npm run test:e2e
  ```

### Style Guide

We follow a strict Design System to ensure consistency.

- **Design System**: Read [`web/DESIGN.md`](./web/DESIGN.md) for color palettes, typography, and component guidelines.
- **Tailwind CSS**: Use utility classes for styling.
- **Dark Mode**: Support dark mode using `dark:` variants.

### Coding Conventions

- **JSDoc**: Document all exported functions and components.
- **Hooks**: Place custom hooks in `web/lib/hooks/`.
- **State**: Use `web/lib/url-state.ts` for shareable URL state management.

## Pull Request Process

1.  Create a new branch for your feature or fix.
2.  Ensure all tests pass.
3.  Submit a Pull Request with a clear title and description.
4.  Reference any relevant issues.

Thank you for contributing!
