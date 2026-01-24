import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas } from '@/components/tool-ui/canvas';

describe('Canvas', () => {
    describe('rendering', () => {
        it('renders children', () => {
            render(
                <Canvas>
                    <div data-testid="child">Child content</div>
                </Canvas>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            render(<Canvas className="custom-class" data-testid="canvas" />);
            expect(screen.getByTestId('canvas')).toHaveClass('custom-class');
        });

        it('renders grid background when gridSize is provided', () => {
            const { container } = render(<Canvas gridSize={40} data-testid="canvas" />);
            const grid = container.querySelector('[class*="pointer-events-none"]');
            expect(grid).toHaveStyle({ backgroundSize: '40px 40px' });
        });
    });

    describe('marquee selection', () => {
        it('does not show marquee initially', () => {
            const { container } = render(<Canvas data-testid="canvas" />);
            const marquee = container.querySelector('[class*="border-indigo"]');
            expect(marquee).not.toBeInTheDocument();
        });

        it('shows marquee box during pointer drag', () => {
            const { container } = render(<Canvas data-testid="canvas" />);
            const canvas = screen.getByTestId('canvas');

            jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
                left: 0, top: 0, right: 500, bottom: 500,
                width: 500, height: 500, x: 0, y: 0, toJSON: () => { }
            });

            fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, target: canvas });
            fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });

            const marquee = container.querySelector('[class*="border-indigo"]');
            expect(marquee).toBeInTheDocument();
        });

        it('calls onSelectionEnd with rect when drag exceeds threshold', () => {
            const onSelectionEnd = jest.fn();
            render(<Canvas data-testid="canvas" onSelectionEnd={onSelectionEnd} />);
            const canvas = screen.getByTestId('canvas');

            jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
                left: 0, top: 0, right: 500, bottom: 500,
                width: 500, height: 500, x: 0, y: 0, toJSON: () => { }
            });

            fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50, target: canvas });
            fireEvent.pointerMove(canvas, { clientX: 150, clientY: 150 });
            fireEvent.pointerUp(canvas, { clientX: 150, clientY: 150 });

            expect(onSelectionEnd).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: 50,
                    y: 50,
                    width: 100,
                    height: 100
                })
            );
        });

        it('does not call onSelectionEnd for small movements', () => {
            const onSelectionEnd = jest.fn();
            render(<Canvas data-testid="canvas" onSelectionEnd={onSelectionEnd} />);
            const canvas = screen.getByTestId('canvas');

            jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
                left: 0, top: 0, right: 500, bottom: 500,
                width: 500, height: 500, x: 0, y: 0, toJSON: () => { }
            });

            fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50, target: canvas });
            fireEvent.pointerMove(canvas, { clientX: 52, clientY: 52 });
            fireEvent.pointerUp(canvas, { clientX: 52, clientY: 52 });

            expect(onSelectionEnd).not.toHaveBeenCalled();
        });

        it('clears marquee on pointer up', () => {
            const { container } = render(<Canvas data-testid="canvas" />);
            const canvas = screen.getByTestId('canvas');

            jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
                left: 0, top: 0, right: 500, bottom: 500,
                width: 500, height: 500, x: 0, y: 0, toJSON: () => { }
            });

            fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, target: canvas });
            fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });

            expect(container.querySelector('[class*="border-indigo"]')).toBeInTheDocument();

            fireEvent.pointerUp(canvas, { clientX: 200, clientY: 200 });

            expect(container.querySelector('[class*="border-indigo"]')).not.toBeInTheDocument();
        });

        it('clears marquee on pointer leave', () => {
            const { container } = render(<Canvas data-testid="canvas" />);
            const canvas = screen.getByTestId('canvas');

            jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
                left: 0, top: 0, right: 500, bottom: 500,
                width: 500, height: 500, x: 0, y: 0, toJSON: () => { }
            });

            fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, target: canvas });
            fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });

            expect(container.querySelector('[class*="border-indigo"]')).toBeInTheDocument();

            fireEvent.pointerLeave(canvas);

            expect(container.querySelector('[class*="border-indigo"]')).not.toBeInTheDocument();
        });

        it('does not start marquee when clicking on child elements', () => {
            const { container } = render(
                <Canvas data-testid="canvas">
                    <div data-testid="child" style={{ width: 50, height: 50 }}>Child</div>
                </Canvas>
            );
            const child = screen.getByTestId('child');

            fireEvent.pointerDown(child, { clientX: 25, clientY: 25 });
            fireEvent.pointerMove(container, { clientX: 100, clientY: 100 });

            const marquee = container.querySelector('[class*="border-indigo"]');
            expect(marquee).not.toBeInTheDocument();
        });
    });

    describe('click handling', () => {
        it('calls onClick when clicked', () => {
            const onClick = jest.fn();
            render(<Canvas data-testid="canvas" onClick={onClick} />);

            fireEvent.click(screen.getByTestId('canvas'));

            expect(onClick).toHaveBeenCalled();
        });

        it('ignores click immediately after marquee selection', () => {
            const onClick = jest.fn();
            const onSelectionEnd = jest.fn();
            render(<Canvas data-testid="canvas" onClick={onClick} onSelectionEnd={onSelectionEnd} />);
            const canvas = screen.getByTestId('canvas');

            jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
                left: 0, top: 0, right: 500, bottom: 500,
                width: 500, height: 500, x: 0, y: 0, toJSON: () => { }
            });

            // Perform a selection
            fireEvent.pointerDown(canvas, { clientX: 50, clientY: 50, target: canvas });
            fireEvent.pointerMove(canvas, { clientX: 150, clientY: 150 });
            fireEvent.pointerUp(canvas, { clientX: 150, clientY: 150 });

            expect(onSelectionEnd).toHaveBeenCalled();
        });
    });

    describe('pointer event support', () => {
        it('responds to pointerdown event', () => {
            const { container } = render(<Canvas data-testid="canvas" />);
            const canvas = screen.getByTestId('canvas');

            jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
                left: 0, top: 0, right: 500, bottom: 500,
                width: 500, height: 500, x: 0, y: 0, toJSON: () => { }
            });

            fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, target: canvas });
            fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });

            const marquee = container.querySelector('[class*="border-indigo"]');
            expect(marquee).toBeInTheDocument();
        });

        it('handles touch pointer type', () => {
            const onSelectionEnd = jest.fn();
            render(<Canvas data-testid="canvas" onSelectionEnd={onSelectionEnd} />);
            const canvas = screen.getByTestId('canvas');

            jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
                left: 0, top: 0, right: 500, bottom: 500,
                width: 500, height: 500, x: 0, y: 0, toJSON: () => { }
            });

            fireEvent.pointerDown(canvas, {
                clientX: 50, clientY: 50,
                target: canvas,
                pointerType: 'touch'
            });
            fireEvent.pointerMove(canvas, {
                clientX: 150, clientY: 150,
                pointerType: 'touch'
            });
            fireEvent.pointerUp(canvas, {
                clientX: 150, clientY: 150,
                pointerType: 'touch'
            });

            expect(onSelectionEnd).toHaveBeenCalled();
        });
    });
});
