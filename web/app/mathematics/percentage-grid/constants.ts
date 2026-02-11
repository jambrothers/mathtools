

export type GridMode = '10x10' | '10x1' | '10x2' | '10x5' | '20x10';

export interface GridModeConfig {
    id: GridMode;
    label: string;
    cols: number;
    rows: number;
    totalCells: number;
    cellValue: number;
}

export const GRID_MODES: GridModeConfig[] = [
    { id: '10x10', label: '10 × 10 (100 cells)', cols: 10, rows: 10, totalCells: 100, cellValue: 1 },
    { id: '10x1', label: '10 × 1 (10 cells)', cols: 10, rows: 1, totalCells: 10, cellValue: 10 },
    { id: '10x2', label: '10 × 2 (20 cells)', cols: 10, rows: 2, totalCells: 20, cellValue: 5 },
    { id: '10x5', label: '10 × 5 (50 cells)', cols: 10, rows: 5, totalCells: 50, cellValue: 2 },
    { id: '20x10', label: '20 × 10 (200 cells)', cols: 20, rows: 10, totalCells: 200, cellValue: 0.5 },
];

export const GRID_SIZE = 10;
export const TOTAL_SQUARES = 100;

export const getColumnMajorOrder = (cols: number, rows: number): number[] => {
    const indices: number[] = [];
    for (let col = 0; col < cols; col += 1) {
        for (let row = 0; row < rows; row += 1) {
            indices.push(row * cols + col);
        }
    }
    return indices;
};

export const COLUMN_MAJOR_ORDER: number[] = getColumnMajorOrder(GRID_SIZE, GRID_SIZE);
