import { render, screen, fireEvent, act } from '@testing-library/react'
import CountersPage from '@/app/manipulatives/double-sided-counters/page'

// Mock components that might cause issues or aren't relevant to logic tests
jest.mock('@/components/set-page-title', () => ({
    SetPageTitle: () => null
}))

describe('Double Sided Counters Page - Logic', () => {

    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('starts with an empty board', () => {
        render(<CountersPage />)
        expect(screen.getByText('The board is empty')).toBeInTheDocument()
        // Ensure no counter buttons exist. Counter buttons have specific name '+' or '−'
        // We use queryAllByRole to be safe and check length
        const plusButtons = screen.queryAllByRole('button', { name: '+' })
        const minusButtons = screen.queryAllByRole('button', { name: '−' })
        expect(plusButtons).toHaveLength(0)
        expect(minusButtons).toHaveLength(0)
    })

    it('adds positive counter', () => {
        render(<CountersPage />)
        const addPosBtn = screen.getByText('Add +1')
        fireEvent.click(addPosBtn)

        act(() => {
            jest.advanceTimersByTime(1000) // Advance for animations/timeouts
        })

        // Should find at least one "+" counter
        const plusButtons = screen.getAllByRole('button', { name: '+' })
        expect(plusButtons.length).toBeGreaterThan(0)
    })

    it('adds negative counter', () => {
        render(<CountersPage />)
        const addNegBtn = screen.getByText('Add -1')
        fireEvent.click(addNegBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        // Look for the minus sign.
        const minusButtons = screen.getAllByRole('button', { name: '−' })
        expect(minusButtons.length).toBeGreaterThan(0)
    })

    it('adds zero pair', () => {
        render(<CountersPage />)
        const zeroPairBtn = screen.getByText('Zero Pair')
        fireEvent.click(zeroPairBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        const plusButtons = screen.getAllByRole('button', { name: '+' })
        const minusButtons = screen.getAllByRole('button', { name: '−' })

        expect(plusButtons.length).toBeGreaterThanOrEqual(1)
        expect(minusButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('clears board', () => {
        render(<CountersPage />)
        const addPosBtn = screen.getByText('Add +1')
        fireEvent.click(addPosBtn)
        act(() => { jest.advanceTimersByTime(1000) })
        expect(screen.queryByText('The board is empty')).not.toBeInTheDocument()

        const clearBtn = screen.getByText('Clear') // Might match Title "Clear Board" or text logic
        // Button text is "Clear" inside span
        fireEvent.click(clearBtn)

        act(() => { jest.runAllTimers() })

        expect(screen.getByText('The board is empty')).toBeInTheDocument()
    })
})
