"use client"

import { render, screen, fireEvent } from '@testing-library/react'
import { HelpModal } from '@/components/tool-ui/help-modal'

describe('HelpModal', () => {
    const sampleMarkdown = `# Test Help
    
This is a **test** help document.

## Features

- Feature 1
- Feature 2

### Code Example

\`\`\`
const x = 1;
\`\`\`
`

    it('renders the modal with help content', () => {
        render(<HelpModal content={sampleMarkdown} onClose={() => { }} />)
        expect(screen.getByText('Test Help')).toBeInTheDocument()
    })

    it('renders markdown headings correctly', () => {
        render(<HelpModal content={sampleMarkdown} onClose={() => { }} />)
        expect(screen.getByRole('heading', { name: 'Test Help' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Features' })).toBeInTheDocument()
    })

    it('renders markdown bold text', () => {
        render(<HelpModal content={sampleMarkdown} onClose={() => { }} />)
        const boldText = screen.getByText('test')
        expect(boldText.tagName.toLowerCase()).toBe('strong')
    })

    it('renders markdown lists', () => {
        render(<HelpModal content={sampleMarkdown} onClose={() => { }} />)
        expect(screen.getByText('Feature 1')).toBeInTheDocument()
        expect(screen.getByText('Feature 2')).toBeInTheDocument()
    })

    it('has a close button', () => {
        render(<HelpModal content={sampleMarkdown} onClose={() => { }} />)
        const closeButton = screen.getByRole('button', { name: /close/i })
        expect(closeButton).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
        const mockOnClose = jest.fn()
        render(<HelpModal content={sampleMarkdown} onClose={mockOnClose} />)
        const closeButton = screen.getByRole('button', { name: /close/i })
        fireEvent.click(closeButton)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop is clicked', () => {
        const mockOnClose = jest.fn()
        render(<HelpModal content={sampleMarkdown} onClose={mockOnClose} />)
        const backdrop = screen.getByTestId('help-modal-backdrop')
        fireEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when modal content is clicked', () => {
        const mockOnClose = jest.fn()
        render(<HelpModal content={sampleMarkdown} onClose={mockOnClose} />)
        const modalContent = screen.getByTestId('help-modal-content')
        fireEvent.click(modalContent)
        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('renders images in markdown', () => {
        const markdownWithImage = `# Help

![Example image](/help/example.png)
`
        render(<HelpModal content={markdownWithImage} onClose={() => { }} />)
        const image = screen.getByAltText('Example image')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', '/help/example.png')
    })
})
