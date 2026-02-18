import { render, screen, fireEvent, act } from '@testing-library/react'
import { CopyLinkButton } from '../copy-link-button'
import React from 'react'

describe('CopyLinkButton', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => { jest.useRealTimers(); jest.clearAllMocks() })

    it('renders correctly and handles copy interaction with timeout', async () => {
        const onCopyLink = jest.fn()
        render(<CopyLinkButton onCopyLink={onCopyLink} />)

        const button = screen.getByRole('button', { name: /copy shareable link/i })
        expect(button).toHaveTextContent('Link')

        await act(async () => fireEvent.click(button))

        expect(onCopyLink).toHaveBeenCalled()
        expect(button).toHaveTextContent('Copied!')
        expect(screen.getByText('Link copied to clipboard')).toBeInTheDocument()
        expect(button).toHaveClass('bg-green-100') // Success style

        act(() => jest.advanceTimersByTime(3000))

        expect(button).toHaveTextContent('Link')
        expect(screen.queryByText('Link copied to clipboard')).not.toBeInTheDocument()
    })

    it('supports custom label and className', () => {
        render(<CopyLinkButton onCopyLink={jest.fn()} label="Share" className="custom-cls" />)
        const btn = screen.getByRole('button', { name: /share/i })
        expect(btn).toHaveTextContent('Share')
        expect(btn).toHaveClass('custom-cls')
    })
})
