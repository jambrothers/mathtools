
import { render, screen } from '@testing-library/react'
import { ToolbarButton } from '@/components/tool-ui/toolbar'

describe('ToolbarButton', () => {
    it('renders with an aria-label', () => {
        render(<ToolbarButton label="Test Button" onClick={() => {}} />)
        const button = screen.getByRole('button', { name: /test button/i })
        expect(button).toBeInTheDocument()
    })

    it('has visible focus styles', () => {
        render(<ToolbarButton label="Focus Me" onClick={() => {}} />)
        const button = screen.getByRole('button', { name: /focus me/i })

        // These are the classes we expect to add for accessibility
        expect(button).toHaveClass('focus-visible:ring-2')
        expect(button).toHaveClass('focus-visible:ring-indigo-500')
        expect(button).toHaveClass('focus-visible:outline-none')
        expect(button).toHaveClass('focus-visible:ring-offset-2')
    })
})
