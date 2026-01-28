import { render, screen } from '@testing-library/react';
import { Bar } from '@/app/mathematics/bar-model/_components/bar';

describe('Bar Component', () => {
    const mockBar = {
        id: '1',
        label: 'Test Bar',
        value: 10,
        colorIndex: 0, // Fixed: Added colorIndex
        parts: [],
        x: 0,
        y: 0,
        width: 200,
        showRelativeLabel: false,
        isTotal: false
    };

    const mockHandlers = {
        onUpdate: jest.fn(),
        onRemove: jest.fn(),
        onDragStart: jest.fn(),
        onSelect: jest.fn(),
        onResize: jest.fn(),
        onLabelChange: jest.fn(),
        isSelected: false
    };

    it('renders with touch-none class for correct touch handling', () => {
        render(<Bar bar={mockBar} {...mockHandlers} />);

        // Find the main container by test ID (Bar component adds data-testid={`bar-${bar.id}`})
        const barElement = screen.getByTestId(`bar-${mockBar.id}`);
        expect(barElement).toHaveClass('touch-none');
    });
});
