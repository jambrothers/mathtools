import { render, screen } from '@testing-library/react'
import { ToolCard } from '@/components/tool-card'

describe('ToolCard', () => {
    const defaultProps = {
        title: 'Test Tool',
        description: 'Test Description',
        href: '/test-tool',
        gradient: 'from-blue-500 to-cyan-500',
        icon: <span data-testid="test-icon">Icon</span>
    }

    it('renders title and description', () => {
        render(<ToolCard {...defaultProps} />)
        expect(screen.getByText('Test Tool')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders icon', () => {
        render(<ToolCard {...defaultProps} />)
        expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('has correct link', () => {
        render(<ToolCard {...defaultProps} />)
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/test-tool')
    })
})
