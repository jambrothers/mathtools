import { render, screen, fireEvent, act } from '@testing-library/react'
import { CopyLinkButton } from '@/components/tool-ui/copy-link-button'

// Mock ToolbarButton to capture props
jest.mock('@/components/tool-ui/toolbar', () => ({
    ToolbarButton: ({ label, onClick, className }: any) => (
        <button onClick={onClick} className={className}>{label}</button>
    )
}))

// Mock Toast to capture props
jest.mock('@/components/tool-ui/toast', () => ({
    Toast: ({ message, isVisible }: any) => (
        isVisible ? <div role="status">{message}</div> : null
    )
}))

describe('CopyLinkButton', () => {
    it('renders with initial state', () => {
        render(<CopyLinkButton onCopyLink={() => {}} />)
        expect(screen.getByText('Link')).toBeInTheDocument()
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('shows feedback on click', async () => {
        jest.useFakeTimers()
        const onCopyLink = jest.fn()
        render(<CopyLinkButton onCopyLink={onCopyLink} />)

        await act(async () => {
            fireEvent.click(screen.getByText('Link'))
        })

        expect(onCopyLink).toHaveBeenCalled()
        expect(screen.getByText('Copied!')).toBeInTheDocument()
        expect(screen.getByRole('status')).toHaveTextContent('Link copied to clipboard')

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        expect(screen.getByText('Link')).toBeInTheDocument()
        expect(screen.queryByRole('status')).not.toBeInTheDocument()

        jest.useRealTimers()
    })

    it('passes className to ToolbarButton', () => {
        render(<CopyLinkButton onCopyLink={() => {}} className="custom-class" />)
        expect(screen.getByText('Link')).toHaveClass('custom-class')
    })
})
