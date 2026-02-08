/**
 * Represents a 2D coordinate point.
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Represents dimensions of an object.
 */
export interface Size {
    width: number;
    height: number;
}

/**
 * Base interface for any interactive element that can be dragged on the canvas.
 */
export interface Draggable {
    /** Unique identifier for the element. */
    id: string;
    /** Current position on the canvas. */
    position: Position;
    /** Whether the element is currently being dragged by the user. */
    isDragging?: boolean;
    /** Whether the element is currently selected. */
    isSelected?: boolean;
}

/**
 * Generic container for undo/redo history states.
 */
export interface HistoryState<T> {
    /** The snapshot of the state data. */
    data: T;
    /** The time the snapshot was taken. */
    timestamp: number;
    /** A human-readable description of the action (e.g., "Move Tile", "Add Tile"). */
    description?: string;
}

/**
 * State for managing multi-selection and drag operations.
 */
export interface SelectionState {
    /** Set of IDs of currently selected elements. */
    selectedIds: Set<string>;
    /** The position where the drag operation started (for calculating deltas). */
    dragStart?: Position;
}
