import { render, screen, fireEvent, act } from '@testing-library/react'
import { LinearEquationsSidebar } from '@/app/mathematics/linear-equations/_components/linear-equations-sidebar'
import { LineConfig } from '@/app/mathematics/linear-equations/constants'

// Mock dependencies
jest.mock('lucide-react', () => ({
    Sliders: () => <div data-testid="icon-sliders" />,
    Eye: () => <div data-testid="icon-eye" />,
    BookMarked: () => <div data-testid="icon-bookmarked" />,
    Plus: () => <div data-testid="icon-plus" />,
    Trash2: () => <div data-testid="icon-trash" />,
    AlignJustify: () => <div data-testid="icon-align-justify" />,
    Scaling: () => <div data-testid="icon-scaling" />,
    Download: () => <div data-testid="icon-download" />,
}))

// Mock ControlPanel components to simplify testing
jest.mock('@/components/tool-ui/control-panel', () => ({
    ControlSection: ({ children, title }: any) => <div data-testid={`section-${title}`}>{children}</div>,
    ControlSlider: ({ label, onValueChange, ...props }: any) => <input type="range" aria-label={label} {...props} />,
    ControlToggle: ({ label, ...props }: any) => <input type="checkbox" aria-label={label} {...props} />,
    ControlPresetButton: ({ label, onClick }: any) => <button onClick={onClick}>{label}</button>
}))

// Mock CopyLinkButton
jest.mock('@/components/tool-ui/copy-link-button', () => ({
    CopyLinkButton: ({ onCopyLink }: any) => (
        <button onClick={onCopyLink}>Copy Link</button>
    )
}))

const mockLines: LineConfig[] = [
    { id: '1', m: 1, c: 0, color: '#000000' }
]

describe('LinearEquationsSidebar', () => {
    const defaultProps = {
        lines: mockLines,
        activeLineId: '1',
        onLineSelect: jest.fn(),
        onAddLine: jest.fn(),
        onRemoveLine: jest.fn(),
        onUpdateLine: jest.fn(),
        showEquation: true,
        setShowEquation: jest.fn(),
        showIntercepts: true,
        setShowIntercepts: jest.fn(),
        showSlopeTriangle: true,
        setShowSlopeTriangle: jest.fn(),
        slopeTriangleSize: 1,
        setSlopeTriangleSize: jest.fn(),
        showGradientCalculation: true,
        setShowGradientCalculation: jest.fn(),
        showGrid: true,
        setShowGrid: jest.fn(),
        onApplyPreset: jest.fn(),
        onReset: jest.fn(),
        onExport: jest.fn(),
        onCopyLink: jest.fn()
    }

    it('renders copy link button via CopyLinkButton component', () => {
        render(<LinearEquationsSidebar {...defaultProps} />)
        const copyButton = screen.getByText('Copy Link')
        expect(copyButton).toBeInTheDocument()
        fireEvent.click(copyButton)
        expect(defaultProps.onCopyLink).toHaveBeenCalled()
    })

    it('renders export button with download icon', () => {
        render(<LinearEquationsSidebar {...defaultProps} />)
        const exportButton = screen.getByText('Export').closest('button')
        expect(exportButton).toBeInTheDocument()
        expect(screen.getByTestId('icon-download')).toBeInTheDocument()
    })
})
