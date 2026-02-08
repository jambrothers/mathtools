export function snapToGrid(value: number, gridSize: number): number {
    if (!gridSize || gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
}
