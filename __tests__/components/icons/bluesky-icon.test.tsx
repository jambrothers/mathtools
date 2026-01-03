import { render, screen } from '@testing-library/react'
import { BlueskyIcon } from '@/components/icons/bluesky-icon'

describe('BlueskyIcon', () => {
    it('renders an svg', () => {
        render(<BlueskyIcon />)
        // Lucide icons usually spread props to svg
        const svg = document.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('applies custom size', () => {
        render(<BlueskyIcon size={48} />)
        const svg = document.querySelector('svg')
        expect(svg).toHaveAttribute('width', '48')
        expect(svg).toHaveAttribute('height', '48')
    })

    it('applies custom class', () => {
        render(<BlueskyIcon className="test-class" />)
        const svg = document.querySelector('svg')
        expect(svg).toHaveClass('test-class')
    })
})
