# Tool UI Components

This directory contains shared UI components designed specifically for building interactive educational tools.
These components enforce a consistent layout, responsiveness, and user experience across all tools in the application.

## Core Architecture

Most tools follow a **Scaffolded Layout** pattern:
1.  **Page**: The Next.js page component that handles data fetching and metadata.
2.  **ToolScaffold**: The top-level wrapper that provides structure (Sidebar, Toolbar, Footer).
3.  **Canvas/Workspace**: The interactive area where the main activity happens.

## Key Components

### 1. ToolScaffold
`tool-scaffold.tsx`

The primary entry point for any tool layout. It handles:
- **Responsive Layout**: Adapts between desktop and mobile views.
- **Help Modal**: Automatically wires up the help button if `helpContent` is provided.
- **Resolution Guard**: Warnings for small screens.

**Usage:**
```tsx
import { ToolScaffold } from "@/components/tool-ui/tool-scaffold"

export default function MyToolPage() {
    return (
        <ToolScaffold
            useInteractiveLayout={true}
            sidebar={<MySidebar />}
            toolbarOverlay={<MyToolbar />}
            helpContent={helpMarkdown}
        >
            <MyCanvas />
        </ToolScaffold>
    )
}
```

### 2. InteractiveToolLayout
`interactive-tool-layout.tsx`

An advanced layout engine used by `ToolScaffold` when `useInteractiveLayout={true}`.
It provides:
- **Collapsible Sidebar**: A sidebar that can be toggled and automatically collapses on smaller screens (<1024px).
- **Absolute Positioning**: Allows the canvas to take up the full remaining viewport height without scrolling the page.
- **Overlay System**: `toolbarOverlay` and `footerOverlay` are placed absolutely over the canvas, preventing layout shifts.

### 3. ResolutionGuard
`resolution-guard.tsx`

A safety component that detects if the user is on a phone (<768px) and displays a modal suggesting a larger device.
- The user can dismiss it ("Continue Anyway").
- The dismissal is remembered for the session via `sessionStorage`.

## Other Components

- **`toolbar.tsx`**: Standardized button groups for the top overlay.
- **`sidebar.tsx`**: Container for sidebar items.
- **`tile-base.tsx`**: A primitive for creating draggable/interactive items (like tiles or counters).
- **`help-modal.tsx`**: Renders Markdown content in a dialog.

## Creating a New Tool

1.  **Create the Page**: `app/mathematics/my-tool/page.tsx`
2.  **Define Help Content**: Create a `HELP.md` file and import it.
3.  **Wrap with Scaffold**: Use `ToolScaffold` as the root element.
4.  **Add Components**: Pass your Sidebar and Toolbar components to the scaffold.
