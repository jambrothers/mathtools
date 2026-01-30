import { render, screen, fireEvent } from '@testing-library/react'
import { ResolutionGuard } from '../resolution-guard'

// Mock resize observer or window matchMedia if needed
// For this test we might need to mock window.innerWidth
const setViewportWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    })
    window.dispatchEvent(new Event('resize'))
}

describe('ResolutionGuard', () => {
    beforeEach(() => {
        // Default to desktop
        setViewportWidth(1024)
        sessionStorage.clear()
    })

    it('renders children on desktop', () => {
        render(
            <ResolutionGuard>
                <div data-testid="child">Child Content</div>
            </ResolutionGuard>
        )
        expect(screen.getByTestId('child')).toBeInTheDocument()
        expect(screen.queryByText(/designed for larger screens/i)).not.toBeInTheDocument()
    })

    it('renders children on tablet', () => {
        setViewportWidth(768)
        render(
            <ResolutionGuard>
                <div data-testid="child">Child Content</div>
            </ResolutionGuard>
        )
        expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('shows banner and hides children on mobile (< 768px)', () => {
        setViewportWidth(375)
        render(
            <ResolutionGuard>
                <div data-testid="child">Child Content</div>
            </ResolutionGuard>
        )

        // Should show banner
        expect(screen.getByText(/designed for larger screens/i)).toBeInTheDocument()
        // Should NOT show children initially
        expect(screen.queryByTestId('child')).not.toBeInTheDocument()
    })

    it('shows children when "Continue" is clicked', () => {
        setViewportWidth(375)
        render(
            <ResolutionGuard>
                <div data-testid="child">Child Content</div>
            </ResolutionGuard>
        )

        const button = screen.getByText(/continue/i) // Adjust text match based on actual implementation
        fireEvent.click(button)

        expect(screen.getByTestId('child')).toBeInTheDocument()
        expect(screen.queryByText(/designed for larger screens/i)).not.toBeInTheDocument()
    })

    it('remembers dismissal in session', () => {
        setViewportWidth(375)
        const { unmount } = render(
            <ResolutionGuard>
                <div data-testid="child">Child Content</div>
            </ResolutionGuard>
        )

        fireEvent.click(screen.getByText(/continue/i))
        unmount()

        // Remount
        render(
            <ResolutionGuard>
                <div data-testid="child">Child Content</div>
            </ResolutionGuard>
        )

        // Should go straight to children
        expect(screen.getByTestId('child')).toBeInTheDocument()
    })
})
