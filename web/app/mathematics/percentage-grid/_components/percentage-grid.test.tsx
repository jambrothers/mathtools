import { render, fireEvent } from '@testing-library/react';
import { PercentageGrid } from './percentage-grid';
import { TOTAL_SQUARES } from '../constants';

describe('PercentageGrid', () => {
    it('renders 100 squares', () => {
        const { getAllByRole } = render(
            <PercentageGrid
                selectedIndices={new Set()}
                dragPreviewBounds={null}
                isDragging={false}
                onToggle={() => undefined}
                onDragStart={() => undefined}
                onDragEnter={() => undefined}
                onDragEnd={() => undefined}
            />
        );

        expect(getAllByRole('button')).toHaveLength(TOTAL_SQUARES);
    });

    it('calls drag handlers on mouse interactions', () => {
        const onDragStart = jest.fn();
        const onDragEnter = jest.fn();

        const { getAllByRole } = render(
            <PercentageGrid
                selectedIndices={new Set()}
                dragPreviewBounds={null}
                isDragging={true}
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
                onToggle={() => undefined}
                onDragStart={() => undefined}
                onDragEnter={() => undefined}
                onDragEnd={() => undefined}
            />
        );

        expect(getByTestId('drag-preview-overlay')).toBeInTheDocument();
    });
});
