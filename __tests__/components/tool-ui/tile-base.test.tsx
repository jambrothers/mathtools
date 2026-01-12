import { render, screen } from '@testing-library/react'
import { TileBase } from '@/components/tool-ui/tile-base'

describe('TileBase', () => {
    const defaultProps = {
        position: { x: 100, y: 50 },
        rotation: 0
    }

    it('renders with correct position transform', () => {
        render(<TileBase {...defaultProps} data-testid="tile" />)
        const tile = screen.getByTestId('tile')
        expect(tile).toHaveStyle('transform: translate(100px, 50px) rotate(0deg)')
    })

    it('applies rotation', () => {
        render(<TileBase {...defaultProps} rotation={90} data-testid="tile" />)
        const tile = screen.getByTestId('tile')
        expect(tile).toHaveStyle('transform: translate(100px, 50px) rotate(90deg)')
    })

    it('applies selected style', () => {
        render(<TileBase {...defaultProps} isSelected={true} data-testid="tile" />)
        const tile = screen.getByTestId('tile')
        expect(tile).toHaveClass('ring-2')
    })

    it('applies dragging style', () => {
        render(<TileBase {...defaultProps} isDragging={true} data-testid="tile" />)
        const tile = screen.getByTestId('tile')
        expect(tile).toHaveClass('z-50')
        expect(tile).toHaveClass('cursor-grabbing')
    })
})
