import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { LineConfig, MAX_LINES, LINE_COLORS, DEFAULT_M, DEFAULT_C } from "../constants"
import { linearEquationsSerializer } from "../_lib/url-state"
import { generateShareableURL } from "@/lib/url-state"

export function useLinearEquations() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // Initialize state from URL or defaults
    const [lines, setLines] = useState<LineConfig[]>([])
    const [activeLineId, setActiveLineId] = useState<string>("")
    const [showEquation, setShowEquation] = useState(true)
    const [showIntercepts, setShowIntercepts] = useState(true)
    const [showSlopeTriangle, setShowSlopeTriangle] = useState(true)
    const [showGrid, setShowGrid] = useState(true)
    const [interactionMode, setInteractionMode] = useState<'none' | 'move' | 'rotate'>('none')
    const [isInitialized, setIsInitialized] = useState(false)

    // Load state on mount
    useEffect(() => {
        const state = linearEquationsSerializer.deserialize(searchParams)
        if (state) {
            setLines(state.lines)
            setActiveLineId(state.activeLineId)
            setShowEquation(state.showEquation)
            setShowIntercepts(state.showIntercepts)
            setShowSlopeTriangle(state.showSlopeTriangle)
            setShowGrid(state.showGrid)
        }
        setIsInitialized(true)
    }, [searchParams])

    // Update URL when state changes (debounced?)
    // For now, let's just provide a manual "getLink" or update via effect if simple.
    // Existing tools often update URL on change. 
    // But `useSearchParams` is read-only. We need to push router.

    // Helper to update URL
    const updateURL = useCallback((newState: any) => {
        const url = generateShareableURL(linearEquationsSerializer, newState, pathname)
        router.replace(url, { scroll: false })
    }, [pathname, router])

    const updateState = useCallback((updates: Partial<any>) => {
        // Construct new state
        // We need current state values. Reliance on closure here is risky if not careful.
        // Better to use functional updates where possible, but here we need to sync multiple things.

        // This pattern might be simpler:
        // When a setter is called, update local state AND trigger URL update.
        // But preventing loops with the useEffect above is key.
        // Actually, normally we might want: URL is truth -> State derives from URL.
        // But sliders need instant feedback without router roundtrip lag.
        // So: Local State -> Render. And Debounce -> URL Update.
    }, [])


    // Methods
    const addLine = useCallback(() => {
        setLines(prev => {
            if (prev.length >= MAX_LINES) return prev
            const nextIndex = prev.length
            const newLine: LineConfig = {
                id: `line-${Date.now()}`, // Simple unique ID
                m: 1,
                c: 0,
                color: LINE_COLORS[nextIndex % LINE_COLORS.length],
                visible: true
            }
            const newLines = [...prev, newLine]
            setActiveLineId(newLine.id)
            return newLines
        })
    }, [])

    const removeLine = useCallback((id: string) => {
        setLines(current => {
            if (current.length <= 1) return current
            const remaining = current.filter(l => l.id !== id)
            // Side effect: update active ID if needed
            if (id === activeLineId) {
                // We need to schedule this update to occur after render or ideally batch it.
                // Accessing `remaining` here is safe.
                const nextId = remaining[remaining.length - 1].id
                // Use a timeout to update state "after" the current update is processed? 
                // Or just fire it. React 18 batches these usually.
                setTimeout(() => setActiveLineId(nextId), 0)
            }
            return remaining
        })
    }, [activeLineId])


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
        setLines(prev => {
            if (prev.length >= MAX_LINES) return prev
            const nextIndex = prev.length
            const newLine: LineConfig = {
                id: `line-${Date.now()}`,
                m: newM,
                c: newC,
                color: LINE_COLORS[nextIndex % LINE_COLORS.length],
                visible: true
            }
            setActiveLineId(newLine.id)
            return [...prev, newLine]
        })

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
        setShowEquation(true)
        setShowIntercepts(true)
        setShowSlopeTriangle(true)
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
            lines, activeLineId, showEquation, showIntercepts, showSlopeTriangle, showGrid
        }, pathname)
    }
}
