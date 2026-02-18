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
    gridCount?: number;
}

export function calculateGridDimensions(
    availableWidth: number,
    availableHeight: number,
    padding: number = 48,
    maxWidth: number = 1000,
    gridCount: number = 1
): GridDimensions {
    // Calculate max available dimensions for the GRID itself (subtracting card padding)
    // padding represents the chrome around the grid squares (e.g. p-6 = 24px * 2 = 48px)
    // If we have multiple grids, we have multiple sets of chrome.

    const gap = padding / 2;
    const totalGapWidth = (gridCount > 1 ? (gridCount - 1) * gap : 0);
    const totalChromeWidth = padding * gridCount;

    // Width available for ALL grid SQUARES combined
    // We cap the *single grid* width at maxWidth, so for total we use maxWidth * gridCount
    // But we must check against available width minus all gaps and chrome
    const maxSquareWidthAllowed = maxWidth * gridCount;
    const availableForSquares = Math.max(0, availableWidth - totalGapWidth - totalChromeWidth);

    const maxAvailableTotalSquaresWidth = Math.min(availableForSquares, maxSquareWidthAllowed);

    // Width per grid squares
    const widthPerGridSquares = maxAvailableTotalSquaresWidth / gridCount;

    const maxAvailableGridHeight = availableHeight - padding;

    // Always use a square footprint so the card size is consistent
    const gridSize = Math.min(widthPerGridSquares, maxAvailableGridHeight);

    return {
        width: gridSize + padding, // This includes padding back into the returned "card" size
        height: gridSize + padding
    };
}

export function useGridLayout({
    containerRef,
    rows,
    cols,
    padding = 48,
    maxWidth = 1000,
    gridCount = 1
}: UseGridLayoutProps) {
    const [dimensions, setDimensions] = useState<GridDimensions | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            const { width, height } = entry.contentRect;
            const newDimensions = calculateGridDimensions(width, height, padding, maxWidth, gridCount);
            setDimensions(newDimensions);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef, rows, cols, padding, maxWidth, gridCount]);

    return dimensions;
}
