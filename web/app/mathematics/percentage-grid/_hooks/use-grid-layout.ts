import { useState, useEffect, RefObject } from 'react';

interface GridDimensions {
    width: number;
    height: number;
}

interface UseGridLayoutProps {
    containerRef: RefObject<any>;
    rows: number;
    cols: number;
    padding?: number;
    maxWidth?: number;
}

export function calculateGridDimensions(
    availableWidth: number,
    availableHeight: number,
    rows: number,
    cols: number,
    padding: number = 48,
    maxWidth: number = 1000
): GridDimensions {
    const targetAspectRatio = cols / rows;

    // Calculate max available dimensions for the GRID itself (subtracting card padding)
    const maxAvailableGridWidth = Math.min(availableWidth - padding, maxWidth);
    const maxAvailableGridHeight = availableHeight - padding;

    // Start with max width
    let gridWidth = maxAvailableGridWidth;
    let gridHeight = gridWidth / targetAspectRatio;

    // If height overflows, scale down based on height
    if (gridHeight > maxAvailableGridHeight) {
        gridHeight = maxAvailableGridHeight;
        gridWidth = gridHeight * targetAspectRatio;
    }

    return {
        width: gridWidth + padding,
        height: gridHeight + padding
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
            const newDimensions = calculateGridDimensions(width, height, rows, cols, padding, maxWidth);
            setDimensions(newDimensions);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef, rows, cols, padding, maxWidth]);

    return dimensions;
}
