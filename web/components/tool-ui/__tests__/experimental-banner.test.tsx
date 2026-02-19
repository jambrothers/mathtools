
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ExperimentalBanner } from '../experimental-banner'

describe('ExperimentalBanner', () => {
    beforeEach(() => {
        sessionStorage.clear()
    })

    it('renders experimental banner with title and description', () => {
        render(
            <ExperimentalBanner pageId="test-page">
                <div data-testid="child">Child</div>
            </ExperimentalBanner>
        )
        expect(screen.getByText('Experimental Feature')).toBeInTheDocument()
        expect(screen.getByText(/features could change/i)).toBeInTheDocument()
    })

    it('children always rendered alongside banner', () => {
        render(
            <ExperimentalBanner pageId="test-page">
                <div data-testid="child">Child</div>
            </ExperimentalBanner>
        )
        expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('dismiss hides banner', () => {
        render(
            <ExperimentalBanner pageId="test-page">
                <div data-testid="child">Child</div>
            </ExperimentalBanner>
        )

        fireEvent.click(screen.getByText(/continue/i))
        expect(screen.queryByText(/experimental/i)).not.toBeInTheDocument()
        expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('dismissal persists across remounts (sessionStorage)', () => {
        const { unmount } = render(
            <ExperimentalBanner pageId="test-page">
                <div data-testid="child">Child</div>
            </ExperimentalBanner>
        )

        fireEvent.click(screen.getByText(/continue/i))
        unmount()

        // Remount
        render(
            <ExperimentalBanner pageId="test-page">
                <div data-testid="child">Child</div>
            </ExperimentalBanner>
        )

        expect(screen.queryByText('Experimental Feature')).not.toBeInTheDocument()
    })

    it('different pageId values use different storage keys', () => {
        // Dismiss on page A
        const { unmount: unmountA } = render(
            <ExperimentalBanner pageId="page-a">
                <div data-testid="child">Child</div>
            </ExperimentalBanner>
        )
        fireEvent.click(screen.getByText(/continue/i))
        unmountA()

        // Render Page B - should still show banner
        render(
            <ExperimentalBanner pageId="page-b">
                <div data-testid="child">Child</div>
            </ExperimentalBanner>
        )
        expect(screen.getByText('Experimental Feature')).toBeInTheDocument()
    })
})
