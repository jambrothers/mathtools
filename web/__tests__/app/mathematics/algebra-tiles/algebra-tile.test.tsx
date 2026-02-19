import { render } from '@testing-library/react'
import { AlgebraTile } from '@/app/mathematics/algebra-tiles/_components/algebra-tile'
import { TileBase } from '@/components/tool-ui/tile-base'
import React from 'react'

// Mock TileBase to capture props
jest.mock('@/components/tool-ui/tile-base', () => ({
    TileBase: jest.fn(({ children }) => <div>{children}</div>)
}))

describe('AlgebraTile Performance', () => {
    beforeEach(() => {
        (TileBase as jest.Mock).mockClear()
    })

    it('should have stable event handlers across re-renders', () => {
        const defaultProps = {
            id: 'tile-1',
            type: '1',
            value: 1,
            x: 100,
            y: 100,
            onSelect: jest.fn(),
            onDragStart: jest.fn(),
            onDragMove: jest.fn(),
            onDragEnd: jest.fn(),
        }

        const { rerender } = render(<AlgebraTile {...defaultProps} />)

        // Capture initial calls
        // Note: TileBase might be called multiple times if child re-renders happen, but here we expect one render.
        const initialProps = (TileBase as jest.Mock).mock.calls[0][0];

        // Rerender with different position (simulating drag)
        rerender(<AlgebraTile {...defaultProps} x={101} />)

        // Capture new calls (last call)
        const calls = (TileBase as jest.Mock).mock.calls;
        const newProps = calls[calls.length - 1][0];

        // Optimized behavior: Handlers are stable across re-renders
        expect(newProps.onPointerDown).toBe(initialProps.onPointerDown);
        expect(newProps.onClick).toBe(initialProps.onClick);
        expect(newProps.onDoubleClick).toBe(initialProps.onDoubleClick);
    })
})
