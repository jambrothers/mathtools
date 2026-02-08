"use client"

import { useCallback, useEffect } from "react"

interface CanvasDropOptions<T> {
    canvasRef: React.RefObject<HTMLElement>
    onDropData: (data: T, position: { x: number; y: number }) => void
    /** Optional grid size to snap drop coordinates. */
    gridSize?: number
    /** Optional drag effect for HTML5 DnD. */
    dropEffect?: DataTransfer['dropEffect']
}

function snap(value: number, gridSize?: number): number {
    if (!gridSize || gridSize <= 0) return value
    return Math.round(value / gridSize) * gridSize
}

export function useCanvasDrop<T extends object>({
    canvasRef,
    onDropData,
    gridSize,
    dropEffect = 'copy'
}: CanvasDropOptions<T>) {
    const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()

        // Try getting JSON data first, fall back to text if needed (though usually JSON stringified)
        const data = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain')

        if (!data) return
        if (!canvasRef.current) return

        try {
            const parsed = JSON.parse(data) as T
            const rect = canvasRef.current.getBoundingClientRect()
            const x = snap(e.clientX - rect.left, gridSize)
            const y = snap(e.clientY - rect.top, gridSize)
            onDropData(parsed, { x, y })
        } catch (err) {
            console.error('Drop parse error:', err)
        }
    }, [canvasRef, gridSize, onDropData])

    const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = dropEffect
        }
    }, [dropEffect])

    const handleTouchDrop = useCallback((e: Event) => {
        const customEvent = e as CustomEvent<{ dragData: T; clientX: number; clientY: number }>
        const { dragData, clientX, clientY } = customEvent.detail
        if (!canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = snap(clientX - rect.left, gridSize)
        const y = snap(clientY - rect.top, gridSize)
        onDropData(dragData, { x, y })
    }, [canvasRef, gridSize, onDropData])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.addEventListener('touchdrop', handleTouchDrop)
        return () => canvas.removeEventListener('touchdrop', handleTouchDrop)
    }, [canvasRef, handleTouchDrop])

    return {
        handleDrop,
        handleDragOver
    }
}
