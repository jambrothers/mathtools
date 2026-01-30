export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Draggable {
    id: string;
    position: Position;
    isDragging?: boolean;
    isSelected?: boolean;
}

export interface HistoryState<T> {
    data: T;
    timestamp: number;
    description?: string; // e.g. "Move Tile", "Add Tile"
}

export interface SelectionState {
    selectedIds: Set<string>;
    dragStart?: Position;
}
