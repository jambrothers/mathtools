# Tool UI Components

This directory contains shared UI components designed specifically for building interactive educational tools.
These components enforce a consistent layout, responsiveness, and user experience across all tools in the application.

## Core Architecture

Most tools follow a **Scaffolded Layout** pattern:
1.  **Page**: The Next.js page component that handles data fetching and metadata.
2.  **ToolScaffold**: The top-level wrapper that provides structure (Sidebar, Toolbar, Footer).
3.  **Canvas/Workspace**: The interactive area where the main activity happens.

## Layout Components

### ToolScaffold
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

### InteractiveToolLayout
`interactive-tool-layout.tsx`

An advanced layout engine used by `ToolScaffold` when `useInteractiveLayout={true}`.
It provides:
- **Collapsible Sidebar**: A sidebar that can be toggled and automatically collapses on smaller screens (<1024px).
- **Absolute Positioning**: Allows the canvas to take up the full remaining viewport height without scrolling the page.
- **Overlay System**: `toolbarOverlay` and `footerOverlay` are placed absolutely over the canvas, preventing layout shifts.

## Workspace Components

### Canvas
`canvas.tsx`

The interactive surface where manipulatives are placed.
- **Marquee Selection**: Built-in support for rectangular selection (drag on empty space).
- **Grid Background**: Optional dot/line grid pattern.
- **Touch Support**: Handles pointer events for reliable interaction on touch devices.

### TileBase
`tile-base.tsx`

A base component for draggable manipulative tiles.
- **Positioning**: Absolute positioning based on x/y coordinates.
- **Interaction**: Handles dragging states (cursor, z-index) and selection rings.
- **Styling**: Standardized shadow, border, and background.

### TrashZone
`trash-zone.tsx`

A drop target for deleting items.
- **Visual Feedback**: Expands and turns red when an item is dragged over it.
- **Positioning**: Fixed to the bottom-right corner of the canvas.

### FloatingPanel
`floating-panel.tsx`

A primitive for creating overlay panels (like the Fraction/Decimal/Percentage panel).
- **Styling**: Glassmorphism effect (backdrop blur) with shadows.
- **Animation**: Entrance animations (fade-in, zoom-in).

## Control Components

### ControlPanel
`control-panel.tsx`

A set of components for building configuration sidebars.
- **`ControlSection`**: A collapsible accordion section.
- **`ControlSlider`**: A range input with increment/decrement buttons.
- **`ControlToggle`**: A switch for boolean states.
- **`ControlPresetButton`**: A rich button for selecting modes or presets.

### SpeedControl
`speed-control.tsx`

A floating panel for adjusting animation speeds.
- **Mapping**: Converts a linear slider (0-100) to a duration in milliseconds.
- **UI**: Includes Rabbit/Turtle icons for intuitive speed control.

### Toolbar
`toolbar.tsx`

Standardized button groups for the top overlay.
- **`ToolbarGroup`**: Container for related buttons.
- **`ToolbarButton`**: The main action button with support for icons and labels.
- **`ToolbarSeparator`**: Vertical divider.

### Sidebar
`sidebar.tsx`

Container for sidebar items, often used with `DraggableSidebarItem` to spawn new manipulatives.

### DraggableSidebarItem
`draggable-sidebar-item.tsx`

A specialized button for spawning new items from the sidebar.
- **Hybrid Drag**: Supports both HTML5 Drag & Drop (desktop) and custom pointer events (touch).
- **Ghost Element**: Renders a visual preview during drag operations.
- **Data Transfer**: Encapsulates item data in the drag payload.

## Utilities

### ResolutionGuard
`resolution-guard.tsx`

A safety component that detects if the user is on a phone (<768px) and displays a modal suggesting a larger device.
- The user can dismiss it ("Continue Anyway").
- The dismissal is remembered for the session via `sessionStorage`.

### CopyLinkButton
`copy-link-button.tsx`

A specialized button that handles URL state sharing.
- **Feedback**: Changes state to "Copied!" temporarily.
- **Async**: Handles the promise returned by the clipboard API.

### HelpModal
`help-modal.tsx`

Renders Markdown content in a accessible dialog. Automatically used by `ToolScaffold`.

### ExportModal
`export-modal.tsx`

A dialog for exporting the canvas content.
- **Formats**: Supports PNG (raster) and SVG (vector) export.
- **Accessibility**: Focus management and keyboard support.

## Creating a New Tool

1.  **Create the Page**: `app/mathematics/my-tool/page.tsx`
2.  **Define Help Content**: Create a `HELP.md` file and import it.
3.  **Wrap with Scaffold**: Use `ToolScaffold` as the root element.
4.  **Add Components**: Pass your Sidebar and Toolbar components to the scaffold.
