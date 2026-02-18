import { render, screen, fireEvent } from '@testing-library/react'
import { HelpModal } from '@/components/tool-ui/help-modal'

describe('HelpModal Accessibility', () => {
    const sampleMarkdown = '# Test Help'
    const onClose = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should close when Escape key is pressed', () => {
        render(<HelpModal content={sampleMarkdown} onClose={onClose} />)

        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should have proper ARIA roles', () => {
        render(<HelpModal content={sampleMarkdown} onClose={onClose} />)

        // The modal content container should have role="dialog"
        // Note: Currently it fails because it's just a div
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('should be labelled by the title', () => {
        render(<HelpModal content={sampleMarkdown} onClose={onClose} />)

        const dialog = screen.getByRole('dialog')
        const title = screen.getByRole('heading', { level: 2, name: /help guide/i })

        expect(dialog).toHaveAttribute('aria-labelledby', title.id)
        expect(title.id).toBeTruthy()
    })

    it('should focus the close button on mount', () => {
        render(<HelpModal content={sampleMarkdown} onClose={onClose} />)

        const closeButton = screen.getByRole('button', { name: /close/i })
        expect(closeButton).toHaveFocus()
    })
})
