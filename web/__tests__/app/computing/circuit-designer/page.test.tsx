import { render } from '@testing-library/react'
import CircuitDesignerPage from '@/app/computing/circuit-designer/page'

// Mock the SetPageTitle component
jest.mock('@/components/set-page-title', () => ({
    SetPageTitle: () => null
}))

// Mock window.confirm for clearCanvas function
global.confirm = jest.fn(() => true)

describe('Circuit Designer Page', () => {
    it('matches snapshot', () => {
        const { container } = render(<CircuitDesignerPage />)
        expect(container).toMatchSnapshot()
    })

    it('renders the toolbar with clear and truth table buttons', () => {
        const { getByText } = render(<CircuitDesignerPage />)
        expect(getByText('Clear')).toBeInTheDocument()
        expect(getByText('Generate Truth Table')).toBeInTheDocument()
    })

    it('renders all component type buttons in the sidebar', () => {
        const { getAllByText, getByText } = render(<CircuitDesignerPage />)
        expect(getByText('Switch')).toBeInTheDocument()
        expect(getByText('Bulb')).toBeInTheDocument()
        // AND, OR, NOT, XOR appear both as node labels and footer buttons
        expect(getAllByText('AND').length).toBeGreaterThanOrEqual(1)
        expect(getAllByText('OR').length).toBeGreaterThanOrEqual(1)
        expect(getAllByText('NOT').length).toBeGreaterThanOrEqual(1)
        expect(getAllByText('XOR').length).toBeGreaterThanOrEqual(1)
    })

    it('renders initial nodes with labels', () => {
        const { getByText } = render(<CircuitDesignerPage />)
        // Initial demo circuit has inputs A, B, AND gate, and Output
        expect(getByText('A')).toBeInTheDocument()
        expect(getByText('B')).toBeInTheDocument()
        expect(getByText('Out')).toBeInTheDocument()
    })
})
