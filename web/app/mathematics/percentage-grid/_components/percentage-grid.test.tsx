import { render, fireEvent } from '@testing-library/react';
import { PercentageGrid } from './percentage-grid';


describe('PercentageGrid', () => {
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

    it('calls drag handlers on mouse interactions', () => {
        const onDragStart = jest.fn();
        const onDragEnter = jest.fn();

        const { getAllByRole } = render(
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
                onDragEnd={() => undefined}
            />
        );

        const squares = getAllByRole('button');
        fireEvent.mouseDown(squares[0]);
        fireEvent.mouseEnter(squares[1]);

        expect(onDragStart).toHaveBeenCalledWith(0);
        expect(onDragEnter).toHaveBeenCalledWith(1);
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
