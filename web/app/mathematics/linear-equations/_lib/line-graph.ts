import { Point, GRAPH_WIDTH, GRAPH_HEIGHT } from "../constants"

// Viewport definition (graph coordinate system)
// For a standard -10 to 10 grid on 600x400 canvas
export const VIEWPORT = {
    xMin: -10,
    xMax: 10,
    yMin: -6.67, // Aspect ratio approx 3:2, so if width is 20 units, height is 13.33 units (-6.67 to 6.67)
    yMax: 6.67
}

/**
 * Maps a graph coordinate to an SVG pixel coordinate
 */
export function toPixel(point: Point): Point {
    const xRange = VIEWPORT.xMax - VIEWPORT.xMin
    const yRange = VIEWPORT.yMax - VIEWPORT.yMin

    return {
        x: ((point.x - VIEWPORT.xMin) / xRange) * GRAPH_WIDTH,
        y: GRAPH_HEIGHT - ((point.y - VIEWPORT.yMin) / yRange) * GRAPH_HEIGHT // Invert Y for SVG
    }
}

/**
 * Maps an SVG pixel coordinate to a graph coordinate
 */
export function toGraph(pixel: Point): Point {
    const xRange = VIEWPORT.xMax - VIEWPORT.xMin
    const yRange = VIEWPORT.yMax - VIEWPORT.yMin

    return {
        x: VIEWPORT.xMin + (pixel.x / GRAPH_WIDTH) * xRange,
        y: VIEWPORT.yMin + ((GRAPH_HEIGHT - pixel.y) / GRAPH_HEIGHT) * yRange
    }
}

/**
 * Calculates the start and end points of the line within the viewport
 */
export function calculateLineEndpoints(m: number, c: number): [Point, Point] {
    // We need to find the intersections with the viewport boundaries
    const points: Point[] = []

    // y = mx + c

    // Check intersection with x = xMin
    const yAtXMin = m * VIEWPORT.xMin + c
    if (yAtXMin >= VIEWPORT.yMin && yAtXMin <= VIEWPORT.yMax) {
        points.push({ x: VIEWPORT.xMin, y: yAtXMin })
    }

    // Check intersection with x = xMax
    const yAtXMax = m * VIEWPORT.xMax + c
    if (yAtXMax >= VIEWPORT.yMin && yAtXMax <= VIEWPORT.yMax) {
        points.push({ x: VIEWPORT.xMax, y: yAtXMax })
    }

    // Check intersection with y = yMin  =>  yMin = mx + c  =>  x = (yMin - c) / m
    if (m !== 0) { // Avoid division by zero
        const xAtYMin = (VIEWPORT.yMin - c) / m
        if (xAtYMin > VIEWPORT.xMin && xAtYMin < VIEWPORT.xMax) { // Strict inequality to avoid duplicates with corners handled above
            points.push({ x: xAtYMin, y: VIEWPORT.yMin })
        }

        // Check intersection with y = yMax
        const xAtYMax = (VIEWPORT.yMax - c) / m
        if (xAtYMax > VIEWPORT.xMin && xAtYMax < VIEWPORT.xMax) {
            points.push({ x: xAtYMax, y: VIEWPORT.yMax })
        }
    } else {
        // Horizontal line y = c. 
        // If c is within viewport, we essentially already covered it with xMin/xMax logic or need specific points
        if (c >= VIEWPORT.yMin && c <= VIEWPORT.yMax) {
            // Already added by xMin/xMax checks? 
            // xMin check adds (-10, c), xMax check adds (10, c)
            // So points array should have 2 items.
        }
    }

    // Return first two unique points (should be exactly 2 for a line crossing the box)
    // Fallback for edge cases (shouldn't happen with valid math)
    if (points.length < 2) {
        return [{ x: -10, y: m * -10 + c }, { x: 10, y: m * 10 + c }]
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
