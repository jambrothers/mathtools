# MathTools

MathTools is a suite of interactive digital manipulatives designed for mathematics education. It provides teachers and students with virtual tools to explore mathematical concepts visually and kinetically.

## Project Purpose

The goal of this project is to create high-quality, web-based educational tools that are:
- **Intuitive**: Easy for students to pick up and use immediately.
- **Visual**: Leveraging the power of digital mediums to visualize abstract concepts.
- **Accessible**: Available on any device with a web browser.

## Built With

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context + Hooks
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for Dark Mode support

## Project Structure

This project follows a standard Next.js App Router structure with a separation of concerns between pages (`app/`) and reusable UI components (`components/`).

### Directory Overview

- **`app/`**: Contains the route segments and page definitions.
  - **`manipulatives/`**: Dedicated section for the interactive manipulative tools.
    - **`[tool-name]/`**: Each tool (e.g., `algebra-tiles`) has its own subdirectory containing its page and tool-specific local components (in `_components/`).
- **`components/`**: Shared reusable components.
  - **`manipulatives/`**: Components shared across multiple manipulatives (e.g., `Canvas`, `TileBase`, `Toolbar`).
  - **`ui/`**: General UI components (coming soon).
- **`lib/`**: Utility functions and custom hooks.

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
