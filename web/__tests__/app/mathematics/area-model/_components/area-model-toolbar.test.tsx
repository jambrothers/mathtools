import { render, screen, fireEvent } from '@testing-library/react';
import { AreaModelToolbar } from '@/app/mathematics/area-model/_components/area-model-toolbar';

describe('AreaModelToolbar', () => {
    const defaultProps = {
        factorA: '3',
        factorB: '4',
        onFactorAChange: jest.fn(),
        onFactorBChange: jest.fn(),
        onIncrementA: jest.fn(),
        onDecrementA: jest.fn(),
        onIncrementB: jest.fn(),
        onDecrementB: jest.fn(),
        onVisualise: jest.fn(),
        showFactorLabels: true,
        showPartialProducts: true,
        showTotal: true,
        showGridLines: true,
        showArray: false,
        onToggleFactorLabels: jest.fn(),
        onTogglePartialProducts: jest.fn(),
        onToggleTotal: jest.fn(),
        onToggleGridLines: jest.fn(),
        onToggleArray: jest.fn(),
        isAlgebraic: false,
        onRevealAll: jest.fn(),
        onHideAll: jest.fn(),
        autoPartition: false,
        onToggleAutoPartition: jest.fn(),
        onGenerateLink: jest.fn(),
        onExport: jest.fn(),
    };

    it('renders factor inputs', () => {
        render(<AreaModelToolbar {...defaultProps} />);
        expect(screen.getByLabelText(/factor a/i)).toHaveValue('3');
        expect(screen.getByLabelText(/factor b/i)).toHaveValue('4');
    });

    it('handles input changes', () => {
        const onFactorAChange = jest.fn();
        render(<AreaModelToolbar {...defaultProps} onFactorAChange={onFactorAChange} />);

        const input = screen.getByLabelText(/factor a/i);
        fireEvent.change(input, { target: { value: '5' } });
        expect(onFactorAChange).toHaveBeenCalledWith('5');
    });

    it('handles increment/decrement clicks', () => {
        const onIncrementA = jest.fn();
        render(<AreaModelToolbar {...defaultProps} onIncrementA={onIncrementA} />);

        const incBtn = screen.getByTestId('increment-a');
        fireEvent.click(incBtn);
        expect(onIncrementA).toHaveBeenCalled();
    });

    it('handles visualize click', () => {
        const onVisualise = jest.fn();
        render(<AreaModelToolbar {...defaultProps} onVisualise={onVisualise} />);

        fireEvent.click(screen.getByLabelText(/visualise/i));
        expect(onVisualise).toHaveBeenCalled();
    });

    it('handles visibility toggles', () => {
        const onToggleFactorLabels = jest.fn();
        render(<AreaModelToolbar {...defaultProps} onToggleFactorLabels={onToggleFactorLabels} />);

        fireEvent.click(screen.getByLabelText(/labels/i));
        expect(onToggleFactorLabels).toHaveBeenCalled();
    });

    it('disables array toggle when algebraic', () => {
        render(<AreaModelToolbar {...defaultProps} isAlgebraic={true} />);
        const arrayToggle = screen.getByLabelText(/array/i);
        expect(arrayToggle).toBeDisabled();
    });

    it('handles auto-partition toggle', () => {
        const onToggleAutoPartition = jest.fn();
        render(<AreaModelToolbar {...defaultProps} onToggleAutoPartition={onToggleAutoPartition} />);

        fireEvent.click(screen.getByLabelText(/auto-partition/i));
        expect(onToggleAutoPartition).toHaveBeenCalled();
    });

    it('handles undo click', () => {
        const onUndo = jest.fn();
        render(<AreaModelToolbar {...defaultProps} onUndo={onUndo} canUndo={true} />);

        fireEvent.click(screen.getByLabelText(/undo/i));
        expect(onUndo).toHaveBeenCalled();
    });

    it('handles clear click', () => {
        const onClear = jest.fn();
        render(<AreaModelToolbar {...defaultProps} onClear={onClear} />);

        fireEvent.click(screen.getByLabelText(/clear/i));
        expect(onClear).toHaveBeenCalled();
    });
});
