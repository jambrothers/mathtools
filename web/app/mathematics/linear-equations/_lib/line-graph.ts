import { Point, GRAPH_WIDTH, GRAPH_HEIGHT } from "../constants"

// Viewport definition (graph coordinate system)
export interface Viewport {
    xMin: number
    xMax: number
    yMin: number
    yMax: number
}

// Default standard -10 to 10 grid
export const DEFAULT_VIEWPORT: Viewport = {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10
}

export const VIEWPORT = DEFAULT_VIEWPORT // Keep for backward compatibility

/**
 * Maps a graph coordinate to an SVG pixel coordinate
 */
export function toPixel(point: Point, viewport: Viewport = VIEWPORT, canvasWidth: number = GRAPH_WIDTH, canvasHeight: number = GRAPH_HEIGHT): Point {
    const xRange = viewport.xMax - viewport.xMin
    const yRange = viewport.yMax - viewport.yMin

    return {
        x: ((point.x - viewport.xMin) / xRange) * canvasWidth,
        y: canvasHeight - ((point.y - viewport.yMin) / yRange) * canvasHeight // Invert Y for SVG
    }
}

/**
 * Maps an SVG pixel coordinate to a graph coordinate
 */
export function toGraph(pixel: Point, viewport: Viewport = VIEWPORT, canvasWidth: number = GRAPH_WIDTH, canvasHeight: number = GRAPH_HEIGHT): Point {
    const xRange = viewport.xMax - viewport.xMin
    const yRange = viewport.yMax - viewport.yMin

    return {
        x: viewport.xMin + (pixel.x / canvasWidth) * xRange,
        y: viewport.yMin + ((canvasHeight - pixel.y) / canvasHeight) * yRange
    }
}

/**
 * Calculates the start and end points of the line within the viewport
 */
export function calculateLineEndpoints(m: number, c: number, viewport: Viewport = VIEWPORT): [Point, Point] {
    // We need to find the intersections with the viewport boundaries
    const points: Point[] = []

    // y = mx + c

    // Check intersection with x = xMin
    const yAtXMin = m * viewport.xMin + c
    if (yAtXMin >= viewport.yMin && yAtXMin <= viewport.yMax) {
        points.push({ x: viewport.xMin, y: yAtXMin })
    }

    // Check intersection with x = xMax
    const yAtXMax = m * viewport.xMax + c
    if (yAtXMax >= viewport.yMin && yAtXMax <= viewport.yMax) {
        points.push({ x: viewport.xMax, y: yAtXMax })
    }

    // Check intersection with y = yMin  =>  yMin = mx + c  =>  x = (yMin - c) / m
    if (m !== 0) { // Avoid division by zero
        const xAtYMin = (viewport.yMin - c) / m
        if (xAtYMin > viewport.xMin && xAtYMin < viewport.xMax) { // Strict inequality to avoid duplicates with corners handled above
            points.push({ x: xAtYMin, y: viewport.yMin })
        }

        // Check intersection with y = yMax
        const xAtYMax = (viewport.yMax - c) / m
        if (xAtYMax > viewport.xMin && xAtYMax < viewport.xMax) {
            points.push({ x: xAtYMax, y: viewport.yMax })
        }
    } else {
        // Horizontal line y = c. 
        if (c >= viewport.yMin && c <= viewport.yMax) {
            // Already handled by xMin/xMax
        }
    }

    // Return first two unique points (should be exactly 2 for a line crossing the box)
    // Fallback for edge cases (shouldn't happen with valid math)
    if (points.length < 2) {
        return [{ x: viewport.xMin, y: m * viewport.xMin + c }, { x: viewport.xMax, y: m * viewport.xMax + c }]
    }

    return [points[0], points[1]]
}

/**
 * Calculates the X-intercept point (y=0)
 */
export function calculateXIntercept(m: number, c: number): Point | null {
    if (m === 0) return null // Horizontal lines don't intersect X axis (unless y=0, which is the axis itself)
    return { x: -c / m, y: 0 }
}

/**
 * Calculates the slope triangle vertices
 * We'll center it around the y-intercept or a convenient integer point
 */
export function calculateSlopeTriangle(m: number, c: number): { runStart: Point, runEnd: Point, riseEnd: Point } | null {
    // Start at Y-intercept (0, c)
    const p1 = { x: 0, y: c }

    // Move right by 1 unit (run = 1)
    // If that goes out of viewport, maybe move left? Let's keep it simple for now: always right 1
    const p2 = { x: 1, y: c }

    // Move up/down by m (rise = m)
    const p3 = { x: 1, y: c + m }

    return {
        runStart: p1,
        runEnd: p2,
        riseEnd: p3
    }
}

export function formatEquation(m: number, c: number): string {
    // y = mx + c
    let eq = "y = "

    const mStr = Math.abs(m) === 1 ? "" : Math.abs(m).toString()
    const xPart = m === 0 ? "" : (m < 0 ? "-" : "") + mStr + "x"

    eq += xPart

    if (c !== 0) {
        if (xPart) {
            eq += c > 0 ? " + " + c : " - " + Math.abs(c)
        } else {
            eq += c
        }
    } else if (!xPart) {
        eq += "0"
    }

    return eq
}
