import { useState, useCallback, useEffect } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { LineConfig, MAX_LINES, LINE_COLORS, DEFAULT_M, DEFAULT_C } from "../constants"
import { linearEquationsSerializer } from "../_lib/url-state"
import { generateShareableURL } from "@/lib/url-state"

export function useLinearEquations() {
    const searchParams = useSearchParams()
    const pathname = usePathname()

    // Initialize state from URL or defaults
    const [lines, setLines] = useState<LineConfig[]>([])
    const [activeLineId, setActiveLineId] = useState<string>("")
    const [showEquation, setShowEquation] = useState(false)
    const [showIntercepts, setShowIntercepts] = useState(false)
    const [showSlopeTriangle, setShowSlopeTriangle] = useState(false)
    const [slopeTriangleSize, setSlopeTriangleSize] = useState(1)
    const [showGradientCalculation, setShowGradientCalculation] = useState(false)
    const [showGrid, setShowGrid] = useState(true)
    const [interactionMode, setInteractionMode] = useState<'none' | 'move' | 'rotate'>('none')
    const [isInitialized, setIsInitialized] = useState(false)

    // Load state on mount
    useEffect(() => {
        const state = linearEquationsSerializer.deserialize(searchParams)
        if (state) {
            // Defer updates to avoid synchronous render warning
            setTimeout(() => {
                setLines(state.lines)
                setActiveLineId(state.activeLineId)
                setShowEquation(state.showEquation)
                setShowIntercepts(state.showIntercepts)
                setShowSlopeTriangle(state.showSlopeTriangle)
                setSlopeTriangleSize(state.slopeTriangleSize)
                setShowGradientCalculation(state.showGradientCalculation)
                setShowGrid(state.showGrid)
            }, 0)
        } else {
            // Initialize with default line if no state in URL
            const defaultLine: LineConfig = {
                id: 'line-1',
                m: DEFAULT_M,
                c: DEFAULT_C,
                color: LINE_COLORS[0],
                visible: true
            }
            // Defer updates
            setTimeout(() => {
                setLines([defaultLine])
                setActiveLineId(defaultLine.id)
            }, 0)
        }
        setTimeout(() => setIsInitialized(true), 0)
    }, [searchParams])

    // Update URL when state changes (debounced?)
    // For now, let's just provide a manual "getLink" or update via effect if simple.
    // Existing tools often update URL on change. 
    // But `useSearchParams` is read-only. We need to push router.

    // Helper to update URL
    // URL updates are handled by the page component or effects if needed, 
    // but here we are using local state for immediate feedback.



    // Methods
    const addLine = useCallback(() => {
        if (lines.length >= MAX_LINES) return
        const nextIndex = lines.length
        const newLine: LineConfig = {
            id: `line-${Date.now()}`, // Simple unique ID
            m: 1,
            c: 0,
            color: LINE_COLORS[nextIndex % LINE_COLORS.length],
            visible: true
        }
        setLines(prev => [...prev, newLine])
        setActiveLineId(newLine.id)
    }, [lines.length])

    const removeLine = useCallback((id: string) => {
        if (lines.length <= 1) return
        const remaining = lines.filter(l => l.id !== id)
        setLines(remaining)

        if (id === activeLineId) {
            const nextId = remaining[remaining.length - 1].id
            setActiveLineId(nextId)
        }
    }, [activeLineId, lines])


    const updateLine = useCallback((id: string, updates: Partial<LineConfig>) => {
        setLines(prev => prev.map(line =>
            line.id === id ? { ...line, ...updates } : line
        ))
    }, [])

    const setParameters = useCallback((m: number, c: number) => {
        if (!activeLineId) return
        updateLine(activeLineId, { m, c })
    }, [activeLineId, updateLine])

    // Presets
    const applyPreset = useCallback((type: 'parallel' | 'perpendicular' | 'proportional') => {
        const activeLine = lines.find(l => l.id === activeLineId) || lines[0]
        if (!activeLine) return

        let newM = activeLine.m
        let newC = activeLine.c

        if (type === 'parallel') {
            // Add new line with same m, different c
            // Offset c by 2 or something noticeable
            newC = activeLine.c + 2 > 5 ? activeLine.c - 2 : activeLine.c + 2
        } else if (type === 'perpendicular') {
            // m1 * m2 = -1 => m2 = -1 / m1
            // handle m=0 ? m=undefined (vertical) -> tool doesn't support vertical lines well yet (x=k)
            if (activeLine.m === 0) {
                newM = 1 // fallback
            } else {
                newM = -1 / activeLine.m
            }
            newC = 0 // pass through origin? or keep intersect?
        } else if (type === 'proportional') {
            // Proportional means y = kx, so c=0
            // Modify CURRENT line? or add new simplified one?
            // "Proportional" preset usually transforms the current graph to be proportional.
            // Let's assume it modifies the current line to c=0
            updateLine(activeLineId, { c: 0 })
            return
        }

        // For parallel/perpendicular, we add a NEW line
        if (lines.length >= MAX_LINES) return
        const nextIndex = lines.length
        const newLine: LineConfig = {
            id: `line-${Date.now()}`,
            m: newM,
            c: newC,
            color: LINE_COLORS[nextIndex % LINE_COLORS.length],
            visible: true
        }
        setLines(prev => [...prev, newLine])
        setActiveLineId(newLine.id)

    }, [activeLineId, lines, updateLine])

    const reset = useCallback(() => {
        setLines([{
            id: 'line-1',
            m: DEFAULT_M,
            c: DEFAULT_C,
            color: LINE_COLORS[0],
            visible: true
        }])
        setActiveLineId('line-1')
        setShowEquation(false)
        setShowIntercepts(false)
        setShowSlopeTriangle(false)
        setSlopeTriangleSize(1)
        setShowGradientCalculation(false)
        setShowGrid(true)
        setInteractionMode('none')
    }, [])

    return {
        lines,
        activeLineId,
        setActiveLineId,
        showEquation,
        setShowEquation,
        showIntercepts,
        setShowIntercepts,
        showSlopeTriangle,
        setShowSlopeTriangle,
        slopeTriangleSize,
        setSlopeTriangleSize,
        showGradientCalculation,
        setShowGradientCalculation,
        showGrid,
        setShowGrid,
        interactionMode,
        setInteractionMode,
        addLine,
        removeLine,
        updateLine,
        setParameters,
        applyPreset,
        reset,
        isInitialized,
        getShareableURL: () => generateShareableURL(linearEquationsSerializer, {
            lines, activeLineId, showEquation, showIntercepts, showSlopeTriangle, slopeTriangleSize, showGradientCalculation, showGrid
        }, pathname)
    }
}
