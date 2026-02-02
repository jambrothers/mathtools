export const DEFAULT_M = 0.5
export const DEFAULT_C = 1
export const M_MIN = -5
export const M_MAX = 5
export const C_MIN = -5
export const C_MAX = 5
export const GRAPH_WIDTH = 800
export const GRAPH_HEIGHT = 800
export const MAX_LINES = 5
export const LINE_COLORS = ['#2563EB', '#DC2626', '#059669', '#D97706', '#8B5CF6'] // Primary, danger, success, warning, violet

export interface Point {
    x: number
    y: number
}

export interface LineConfig {
    id: string
    m: number
    c: number
    color: string
    visible: boolean
}
