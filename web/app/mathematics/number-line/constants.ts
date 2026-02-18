export const NUMBER_LINE_CANVAS_WIDTH = 1000;
export const NUMBER_LINE_CANVAS_HEIGHT = 400;

export const DEFAULT_VIEWPORT = {
    min: -10,
    max: 10
};

export const MIN_VIEWPORT_RANGE = 0.01;
export const MAX_VIEWPORT_RANGE = 1000000;

export const ZOOM_FACTOR = 1.2;

export const POINT_COLORS = [
    '#3b82f6', // blue-500
    '#ef4444', // red-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
];

export const MAX_POINTS = 20;

export interface Point {
    x: number;
    y: number;
}
