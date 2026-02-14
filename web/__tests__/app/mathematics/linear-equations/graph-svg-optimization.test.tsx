import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { GraphSVG } from '@/app/mathematics/linear-equations/_components/graph-svg';

describe('GraphSVG Performance Optimization', () => {
    const defaultProps = {
        lines: [{ id: '1', m: 1, c: 0, color: '#ff0000', label: 'y=x' }],
        showEquation: true,
        showIntercepts: true,
        activeLineId: '1',
        interactionMode: 'move' as const,
        onParameterChange: jest.fn(),
    };

    it('should call getBoundingClientRect only once during dragging (optimized)', () => {
        const { getByTestId } = render(<GraphSVG {...defaultProps} />);
        const svg = getByTestId('graph-svg');

        // Spy on getBoundingClientRect
        const getBoundingClientRectSpy = jest.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
            width: 800,
            height: 800,
            top: 0,
            left: 0,
            bottom: 800,
            right: 800,
            x: 0,
            y: 0,
            toJSON: () => {},
        } as DOMRect);

        // Start dragging
        fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, pointerId: 1 });

        // Move multiple times
        fireEvent.pointerMove(svg, { clientX: 110, clientY: 110, pointerId: 1 });
        fireEvent.pointerMove(svg, { clientX: 120, clientY: 120, pointerId: 1 });
        fireEvent.pointerMove(svg, { clientX: 130, clientY: 130, pointerId: 1 });

        // End dragging
        fireEvent.pointerUp(svg, { pointerId: 1 });

        // In the optimized implementation, it should be called only once in handlePointerDown
        expect(getBoundingClientRectSpy).toHaveBeenCalledTimes(1);

        getBoundingClientRectSpy.mockRestore();
    });
});
