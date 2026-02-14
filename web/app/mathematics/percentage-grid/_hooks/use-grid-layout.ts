import { useState, useEffect, RefObject } from 'react';

interface GridDimensions {
    width: number;
    height: number;
}

interface UseGridLayoutProps {
    containerRef: RefObject<HTMLDivElement | null>;
    rows: number;
    cols: number;
    padding?: number;
    maxWidth?: number;
}

export function calculateGridDimensions(
    availableWidth: number,
    availableHeight: number,

    padding: number = 48,
    maxWidth: number = 1000
): GridDimensions {
    // Calculate max available dimensions for the GRID itself (subtracting card padding)
    const maxAvailableGridWidth = Math.min(availableWidth - padding, maxWidth);
    const maxAvailableGridHeight = availableHeight - padding;

    // Always use a square footprint so the card size is consistent
    // across all grid modes (10x10, 10x5, 10x2, 10x1)
    const gridSize = Math.min(maxAvailableGridWidth, maxAvailableGridHeight);

    return {
        width: gridSize + padding,
        height: gridSize + padding
    };
}

export function useGridLayout({
    containerRef,
    rows,
    cols,
    padding = 48,
    maxWidth = 1000
}: UseGridLayoutProps) {
    const [dimensions, setDimensions] = useState<GridDimensions | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            const { width, height } = entry.contentRect;
            const newDimensions = calculateGridDimensions(width, height, padding, maxWidth);
            setDimensions(newDimensions);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef, rows, cols, padding, maxWidth]);

    return dimensions;
}
