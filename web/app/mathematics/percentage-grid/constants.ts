export const GRID_SIZE = 10;
export const TOTAL_SQUARES = GRID_SIZE * GRID_SIZE;

export const COLUMN_MAJOR_ORDER: number[] = (() => {
    const indices: number[] = [];
    for (let col = 0; col < GRID_SIZE; col += 1) {
        for (let row = 0; row < GRID_SIZE; row += 1) {
            indices.push(row * GRID_SIZE + col);
        }
    }
    return indices;
})();
