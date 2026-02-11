# Shared Components

This directory contains reusable UI components and providers that are used across the entire application.

## Directory Structure

- **`tool-ui/`**: Specialized components for interactive tools (e.g., Toolbars, Canvases). See [Tool UI Documentation](./tool-ui/README.md).
- **`icons/`**: Custom SVG icons or icon wrappers.
- **`./` (Root)**: General purpose layout components and context providers.

## Key Components

### Global Providers

#### `PageTitleProvider` (`page-title-context.tsx`)
Manages the global state for the application header.
- **State**:
  - `title`: The current page title displayed in the navbar.
  - `isNavbarVisible`: Boolean to toggle the navbar visibility (useful for maximizing canvas space).
- **Usage**: Wrap your application root with this provider.

#### `SetPageTitle` (`set-page-title.tsx`)
A utility component to declaratively set the page title from within a child component.
```tsx
<SetPageTitle title="My Tool Name" />
```

#### `ThemeProvider` (`theme-provider.tsx`)
Wraps `next-themes` to provide light/dark mode support.
- **Theme**: Defaults to `system`, but can be toggled to `light` or `dark`.
- **CSS**: Handles the `dark` class on the `<html>` element for Tailwind CSS.

### Layout Components

#### `Navbar` (`navbar.tsx`)
The main top navigation bar.
- Displays the logo and current page title (from `PageTitleContext`).
- Contains the theme toggle and GitHub link.
- Responsive: Adapts to mobile/desktop screens.

#### `Footer` (`footer.tsx`)
The application footer containing copyright info and links.

#### `MainContentWrapper` (`main-content-wrapper.tsx`)
A semantic `<main>` wrapper that ensures proper spacing and layout for page content.
