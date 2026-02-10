"use client"

import { render, screen, fireEvent } from '@testing-library/react'
import { HelpButton } from '@/components/tool-ui/help-button'

describe('HelpButton', () => {
    it('renders the info icon button', () => {
        render(<HelpButton onClick={() => { }} />)
        const button = screen.getByRole('button', { name: /help/i })
        expect(button).toBeInTheDocument()
    })

    it('applies the correct positioning classes', () => {
        render(<HelpButton onClick={() => { }} data-testid="help-button" />)
        const button = screen.getByTestId('help-button')
        expect(button).toHaveClass('absolute')
        expect(button).toHaveClass('bottom-4')
        expect(button).toHaveClass('left-4')
    })

    it('has rounded-full styling like TrashZone', () => {
        render(<HelpButton onClick={() => { }} data-testid="help-button" />)
        const button = screen.getByTestId('help-button')
        expect(button).toHaveClass('rounded-full')
        expect(button).toHaveClass('p-4')
    })

    it('calls onClick when clicked', () => {
        const mockOnClick = jest.fn()
        render(<HelpButton onClick={mockOnClick} />)
        const button = screen.getByRole('button', { name: /help/i })
        fireEvent.click(button)
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('applies custom className when provided', () => {
        render(<HelpButton onClick={() => { }} className="custom-class" data-testid="help-button" />)
        const button = screen.getByTestId('help-button')
        expect(button).toHaveClass('custom-class')
    })

    it('has visible focus styles', () => {
        render(<HelpButton onClick={() => { }} />)
        const button = screen.getByRole('button', { name: /help/i })
        expect(button).toHaveClass('focus-visible:ring-2')
        expect(button).toHaveClass('focus-visible:ring-indigo-500')
    })
})
