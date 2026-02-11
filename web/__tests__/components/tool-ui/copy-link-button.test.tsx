import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CopyLinkButton } from '@/components/tool-ui/copy-link-button'
import React from 'react'

describe('CopyLinkButton', () => {
    it('renders correctly with initial state', () => {
        render(<CopyLinkButton onCopyLink={() => {}} />)
        const button = screen.getByRole('button', { name: /copy shareable link/i })
        expect(button).toBeInTheDocument()
        expect(screen.getByText('Link')).toBeInTheDocument()
    })

    it('handles click and shows feedback', async () => {
        const onCopyLink = jest.fn()
        render(<CopyLinkButton onCopyLink={onCopyLink} />)
        const button = screen.getByRole('button', { name: /copy shareable link/i })

        fireEvent.click(button)

        expect(onCopyLink).toHaveBeenCalled()

        // Wait for button state change
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /link copied/i })).toBeInTheDocument()
        })

        // Check visual label change
        expect(screen.getByText('Copied!')).toBeInTheDocument()

        // Check toast feedback
        const toast = screen.getByRole('status')
        expect(toast).toHaveTextContent('Link copied')
    })
})
