import { render, screen, fireEvent } from '@testing-library/react';
import { AreaModelCanvas } from '@/app/mathematics/area-model/_components/area-model-canvas';
import { buildModel, computePartialProducts, computeTotal } from '@/app/mathematics/area-model/_lib/area-model-logic';

describe('AreaModelCanvas', () => {
    const defaultModel = buildModel('3', '4', false);
    const defaultProducts = computePartialProducts(defaultModel);
    const defaultTotal = computeTotal(defaultProducts, defaultModel);

    it('renders empty state when model is null', () => {
        render(<AreaModelCanvas
            model={null}
            products={null}
            total=""
            showFactorLabels={true}
            showPartialProducts={true}
            showTotal={true}
            showGridLines={true}
            showArray={false}
            revealedCells={new Set()}
            onCellClick={() => { }}
        />);

        expect(screen.getByText(/enter factors to visualize/i)).toBeInTheDocument();
    });

    it('renders 1x1 model correctly', () => {
        render(<AreaModelCanvas
            model={defaultModel}
            products={defaultProducts}
            total={defaultTotal}
            showFactorLabels={true}
            showPartialProducts={true}
            showTotal={true}
            showGridLines={true}
            showArray={false}
            revealedCells={new Set(['0-0'])}
            onCellClick={() => { }}
        />);

        expect(screen.getByTestId('area-model-svg')).toBeInTheDocument();
        expect(screen.getByTestId('factor-label-row-0')).toHaveTextContent('3');
        expect(screen.getByTestId('factor-label-col-0')).toHaveTextContent('4');
        expect(screen.getByTestId('product-label-0-0')).toHaveTextContent('12');
        expect(screen.getByTestId('total-label')).toHaveTextContent('Total: 12');
    });

    it('renders 2x2 partitioned model', () => {
        const model = buildModel('20, 3', '10, 5', false);
        const products = computePartialProducts(model);
        const total = computeTotal(products, model);

        render(<AreaModelCanvas
            model={model}
            products={products}
            total={total}
            showFactorLabels={true}
            showPartialProducts={true}
            showTotal={true}
            showGridLines={true}
            showArray={false}
            revealedCells={new Set(['0-0', '0-1', '1-0', '1-1'])}
            onCellClick={() => { }}
        />);

        expect(screen.getByTestId('product-label-0-0')).toHaveTextContent('200');
        expect(screen.getByTestId('product-label-1-1')).toHaveTextContent('15');
        expect(screen.getAllByTestId(/grid-line-/)).toHaveLength(2); // 1 vertical, 1 horizontal separator
    });

    it('respects visibility toggles', () => {
        render(<AreaModelCanvas
            model={defaultModel}
            products={defaultProducts}
            total={defaultTotal}
            showFactorLabels={false}
            showPartialProducts={false}
            showTotal={false}
            showGridLines={false}
            showArray={false}
            revealedCells={new Set(['0-0'])}
            onCellClick={() => { }}
        />);

        expect(screen.queryByTestId('factor-label-row-0')).not.toBeInTheDocument();
        expect(screen.queryByTestId('product-label-0-0')).not.toBeInTheDocument();
        expect(screen.queryByTestId('total-label')).not.toBeInTheDocument();
        expect(screen.queryByTestId(/grid-line-/)).not.toBeInTheDocument();
    });

    it('handles progressive reveal via cell click', () => {
        const onCellClick = jest.fn();
        render(<AreaModelCanvas
            model={defaultModel}
            products={defaultProducts}
            total={defaultTotal}
            showFactorLabels={true}
            showPartialProducts={true}
            showTotal={true}
            showGridLines={true}
            showArray={false}
            revealedCells={new Set()} // All hidden
            onCellClick={onCellClick}
        />);

        expect(screen.queryByTestId('product-label-0-0')).not.toBeInTheDocument();

        const cell = screen.getByTestId('cell-0-0');
        fireEvent.click(cell);

        expect(onCellClick).toHaveBeenCalledWith('0-0');
    });

    it('renders discrete array overlay', () => {
        render(<AreaModelCanvas
            model={defaultModel}
            products={defaultProducts}
            total={defaultTotal}
            showFactorLabels={true}
            showPartialProducts={true}
            showTotal={true}
            showGridLines={true}
            showArray={true}
            revealedCells={new Set(['0-0'])}
            onCellClick={() => { }}
        />);

        // 3x4 = 12 dots
        expect(screen.getAllByTestId(/array-dot-/)).toHaveLength(12);
    });

    it('renders algebraic labels correctly', () => {
        const model = buildModel('x + 1', 'x + 2', false);
        const products = computePartialProducts(model);
        render(<AreaModelCanvas
            model={model}
            products={products}
            total="x² + 3x + 2"
            showFactorLabels={true}
            showPartialProducts={true}
            showTotal={true}
            showGridLines={true}
            showArray={false}
            revealedCells={new Set(['0-0', '0-1', '1-0', '1-1'])}
            onCellClick={() => { }}
        />);

        expect(screen.getByTestId('product-label-0-0')).toHaveTextContent('x²');
        expect(screen.getByTestId('product-label-0-1')).toHaveTextContent('2x');
    });
});
