
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Bar } from '@/app/mathematics/bar-model/_components/bar';


// Mock props
const defaultProps = {
    bar: {
        id: 'bar-1',
        x: 0,
        y: 0,
        width: 100,
        colorIndex: 0,
        label: 'test',
    },
    isSelected: false,
    onSelect: jest.fn(),
    onDragStart: jest.fn(),
    onResize: jest.fn(),
    onLabelChange: jest.fn(),
};

describe('Bar Component Interaction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should select itself on pointer down if not selected', () => {
        render(<Bar {...defaultProps} isSelected={false} />);

        const barElement = screen.getByTestId('bar-bar-1');
        fireEvent.pointerDown(barElement);

        // Should trigger selection (replacing others)
        expect(defaultProps.onSelect).toHaveBeenCalledWith('bar-1', false);
        expect(defaultProps.onDragStart).toHaveBeenCalled();
    });

    it('should NOT trigger selection on pointer down if ALREADY selected (to preserve group for dragging)', () => {
        render(<Bar {...defaultProps} isSelected={true} />);

        const barElement = screen.getByTestId('bar-bar-1');
        fireEvent.pointerDown(barElement);

        // Should NOT trigger selection logic (preserves existing group)
        expect(defaultProps.onSelect).not.toHaveBeenCalled();
        // But MUST still trigger drag start
        expect(defaultProps.onDragStart).toHaveBeenCalled();
    });

    it('should trigger additive selection on pointer down with Shift key', () => {
        render(<Bar {...defaultProps} isSelected={false} />);

        const barElement = screen.getByTestId('bar-bar-1');
        fireEvent.pointerDown(barElement, { shiftKey: true });

        expect(defaultProps.onSelect).toHaveBeenCalledWith('bar-1', true);
    });

    // We also need to test that a "Click" (Down + Up without move) on a selected bar DOES eventually select just that bar
    // This test documents the EXPECTED behavior we want to add.
    it('should select ONLY itself on click (PointerUp) if it was already selected but NOT dragged', () => {
        render(<Bar {...defaultProps} isSelected={true} />);

        const barElement = screen.getByTestId('bar-bar-1');

        // Down (should not select)
        fireEvent.pointerDown(barElement, { clientX: 0, clientY: 0 });
        expect(defaultProps.onSelect).not.toHaveBeenCalled();

        // Up (should select single, since it was a click)
        fireEvent.pointerUp(barElement, { clientX: 0, clientY: 0 });
        expect(defaultProps.onSelect).toHaveBeenCalledWith('bar-1', false);
    });
});
