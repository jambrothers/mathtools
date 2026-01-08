import { render, screen, fireEvent } from '@testing-library/react'
import CountersPage from '@/app/manipulatives/double-sided-counters/page'

// Mock the SetPageTitle component to avoid context requirement
jest.mock('@/components/set-page-title', () => ({
    SetPageTitle: ({ title }: { title: string }) => <h1>{title}</h1>
}))

describe('Double Sided Counters Page', () => {
    it('renders the title and empty state', () => {
        render(<CountersPage />)
        expect(screen.getByText('Double Sided Counters')).toBeInTheDocument()
        expect(screen.getByText('The board is empty')).toBeInTheDocument()
    })

    it('adds positive counters via sidebar', () => {
        render(<CountersPage />)
        const initialCount = screen.queryAllByText('+').length
        const addPosBtn = screen.getByText('Add +1')
        fireEvent.click(addPosBtn)

        // Should increase by 1
        const newCount = screen.queryAllByText('+').length
        expect(newCount).toBe(initialCount + 1)
        expect(screen.queryByText('The board is empty')).not.toBeInTheDocument()
    })

    it('adds negative counters via sidebar', () => {
        render(<CountersPage />)
        const initialCount = screen.queryAllByText('−').length
        fireEvent.click(screen.getByText('Add -1'))
        expect(screen.queryAllByText('−').length).toBe(initialCount + 1)
    })

    it('adds zero pair', () => {
        render(<CountersPage />)
        const initialPos = screen.queryAllByText('+').length
        const initialNeg = screen.queryAllByText('−').length

        fireEvent.click(screen.getByText('Zero Pair'))

        expect(screen.queryAllByText('+').length).toBe(initialPos + 1)
        expect(screen.queryAllByText('−').length).toBe(initialNeg + 1)
    })

    it('updates stats correctly', () => {
        render(<CountersPage />)
        // Add +1, +1, -1
        fireEvent.click(screen.getByText('Zero Pair')) // +1, -1
        fireEvent.click(screen.getByText('Add +1'))    // +1

        // Check Stats
        expect(screen.getByText('+2')).toBeInTheDocument() // Pos count
        expect(screen.getByText('-1')).toBeInTheDocument() // Neg count
    })

    it('clears the board', () => {
        render(<CountersPage />)
        fireEvent.click(screen.getByText('Add +1'))
        expect(screen.queryByText('The board is empty')).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Clear'))
        expect(screen.getByText('The board is empty')).toBeInTheDocument()
    })
})
