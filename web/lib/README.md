# Core Utilities & Hooks

This directory contains the foundational logic and shared utilities that power the interactive tools.
These utilities are framework-agnostic where possible, focusing on pure logic and data manipulation.

## URL State Serialization (`url-state.ts`)

A robust system for persisting complex tool states in the URL query string. This enables users to share specific configurations (e.g., a specific arrangement of Algebra Tiles) via a simple link.

### Key Concepts

- **Compact String Format**: Uses delimiters (`;`, `,`, `:`) instead of JSON to minimize URL length.
- **Security**: Includes built-in protection against Denial of Service (DoS) attacks:
    - `MAX_PARSE_ITERATIONS`: Limits loop execution during parsing.
    - `MAX_INPUT_LENGTH`: Rejects overly long input strings.
    - `encodeURIComponent`: Should be used for user-generated text to prevent delimiter injection.

### Usage Example

```typescript
import { URLStateSerializer, generateShareableURL, parseList } from '@/lib/url-state';

interface MyToolState {
    count: number;
    items: string[];
}

const mySerializer: URLStateSerializer<MyToolState> = {
    serialize: (state) => {
        const params = new URLSearchParams();
        params.set('c', state.count.toString());
        params.set('i', state.items.join(','));
        return params;
    },
    deserialize: (params) => {
        const count = parseInt(params.get('c') || '0', 10);
        const items = parseList(params.get('i'), (item) => item, { delimiter: ',' });
        return { count, items };
    }
};

// Generate a link
const url = generateShareableURL(mySerializer, currentState);
```

## Geometry & Selection (`selection.ts`, `snap.ts`)

Utilities for handling spatial interactions on the canvas.

### `snap.ts`
- **`snapToGrid(value, gridSize)`**: Rounds a coordinate to the nearest multiple of the grid size.
  - Useful for aligning tiles to a grid (e.g., 50px).
  - Returns the original value if `gridSize` is <= 0.

### `selection.ts`
- **`rectsIntersect(a, b)`**: Boolean check if two rectangles overlap.
- **`selectIdsByRect(items, rect, getBounds, getId)`**: Efficiently finds all items within a selection marquee.
  - Used by the `Canvas` component for drag-selection.

## ID Generation (`id.ts`)

- **`createId(prefix?)`**: Generates a unique identifier.
  - Uses `crypto.randomUUID()` when available (modern browsers).
  - Falls back to a timestamp + random string for older environments.
  - Optional `prefix` for readability (e.g., `tile-123...`).

## Custom Hooks (`hooks/`)

Reusable React hooks for complex interactive behaviors.

### `useClickStack`
Manages a stack of click handlers to determine precedence. Useful when multiple overlapping elements (e.g., a tile on top of the canvas) both listen for clicks.

### `useDraggable`
Provides drag-and-drop functionality for elements.
- Handles mouse and touch events.
- Supports "ghost" elements during drag.
- integrated with `snapToGrid`.

### `useHistory`
Implements Undo/Redo functionality for tool state.
- Manages a stack of past states.
- Exposes `undo()`, `redo()`, `canUndo`, and `canRedo`.

### `useUrlState`
Syncs the tool's internal state with the browser's URL.
- Automatically updates the URL when state changes (debounced).
- Parses the URL on initial load to restore state.

### `useCanvasDrop`
Handles drop events on the main canvas area.
- Used to detect when a new item is dropped from the sidebar.
