import { render, fireEvent } from '@testing-library/react';
import { PercentageGrid } from './percentage-grid';


describe('PercentageGrid', () => {
    beforeAll(() => {
        // Mock ResizeObserver
        global.ResizeObserver = class ResizeObserver {
            callback: ResizeObserverCallback;
            constructor(callback: ResizeObserverCallback) {
                this.callback = callback;
            }
            observe(target: Element) {
                // Immediately trigger callback with dummy dimensions to render grid
                this.callback([{
                    contentRect: { width: 500, height: 500 },
                    target,
                } as ResizeObserverEntry], this);
            }
            unobserve() { }
            disconnect() { }
        };
    });

    it('renders 100 squares for 10x10 grid', () => {
        const { getAllByRole } = render(
            <PercentageGrid
                selectedIndices={new Set()}
                dragPreviewBounds={null}
                isDragging={false}
                rows={10}
                cols={10}
                totalCells={100}
                onToggle={() => undefined}
                onDragStart={() => undefined}
                onDragEnter={() => undefined}
                onDragEnd={() => undefined}
            />
        );

        // The grid content is conditional on ResizeObserver triggering, which our mock does synchronously.
        expect(getAllByRole('button')).toHaveLength(100);
    });

    it('renders 20 squares for 10x2 grid', () => {
        const { getAllByRole } = render(
            <PercentageGrid
                selectedIndices={new Set()}
                dragPreviewBounds={null}
                isDragging={false}
                rows={2}
                cols={10}
                totalCells={20}
                onToggle={() => undefined}
                onDragStart={() => undefined}
                onDragEnter={() => undefined}
                onDragEnd={() => undefined}
            />
        );

        expect(getAllByRole('button')).toHaveLength(20);
    });

    it('calls drag handlers on pointer interactions', () => {
        const onDragStart = jest.fn();
        const onDragEnter = jest.fn();
        const onDragEnd = jest.fn();

        // Mock pointer capture methods
        const originalSetPointerCapture = HTMLElement.prototype.setPointerCapture;
        const originalReleasePointerCapture = HTMLElement.prototype.releasePointerCapture;
        const originalElementFromPoint = document.elementFromPoint;

        HTMLElement.prototype.setPointerCapture = jest.fn();
        HTMLElement.prototype.releasePointerCapture = jest.fn();
        document.elementFromPoint = jest.fn();

        const { getAllByRole, getByRole } = render(
            <PercentageGrid
                selectedIndices={new Set()}
                dragPreviewBounds={null}
                isDragging={true}
                rows={10}
                cols={10}
                totalCells={100}
                onToggle={() => undefined}
                onDragStart={onDragStart}
                onDragEnter={onDragEnter}
                onDragEnd={onDragEnd}
            />
        );

        const squares = getAllByRole('button');
        const grid = getByRole('grid');

        // Start Drag
        fireEvent.pointerDown(squares[0]);
        expect(onDragStart).toHaveBeenCalledWith(0);
        expect(grid.setPointerCapture).toHaveBeenCalled();

        // Move Drag
        // Simulate finding the second square under the cursor
        (document.elementFromPoint as jest.Mock).mockReturnValue(squares[1]);

        fireEvent.pointerMove(grid, { clientX: 100, clientY: 100 });
        expect(onDragEnter).toHaveBeenCalledWith(1);

        // End Drag
        fireEvent.pointerUp(grid);
        expect(onDragEnd).toHaveBeenCalled();
        expect(grid.releasePointerCapture).toHaveBeenCalled();

        // Cleanup
        HTMLElement.prototype.setPointerCapture = originalSetPointerCapture;
        HTMLElement.prototype.releasePointerCapture = originalReleasePointerCapture;
        document.elementFromPoint = originalElementFromPoint;
    });

    it('shows the drag preview overlay when bounds are provided', () => {
        const { getByTestId } = render(
            <PercentageGrid
                selectedIndices={new Set()}
                dragPreviewBounds={{ rowMin: 0, rowMax: 1, colMin: 0, colMax: 1 }}
                isDragging={true}
                rows={10}
                cols={10}
                totalCells={100}
                onToggle={() => undefined}
                onDragStart={() => undefined}
                onDragEnter={() => undefined}
                onDragEnd={() => undefined}
            />
        );

        expect(getByTestId('drag-preview-overlay')).toBeInTheDocument();
    });
});
