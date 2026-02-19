import React from 'react';
import { render, screen } from '@testing-library/react';
import { FractionWallSidebar } from '@/app/mathematics/fraction-wall/_components/fraction-wall-sidebar';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Hash: () => <svg data-testid="icon-hash" />,
    Binary: () => <svg data-testid="icon-binary" />,
    Percent: () => <svg data-testid="icon-percent" />,
    EyeOff: () => <svg data-testid="icon-eye-off" />,
    Trash2: () => <svg data-testid="icon-trash" />,
    ChevronDown: () => <svg data-testid="icon-chevron-down" />,
    Minus: () => <svg data-testid="icon-minus" />,
    Plus: () => <svg data-testid="icon-plus" />,
}));

describe('FractionWallSidebar Accessibility', () => {
    const defaultProps = {
        visibleDenominators: [1, 2],
        onToggleDenominator: jest.fn(),
        labelMode: 'fraction' as const,
        onLabelModeChange: jest.fn(),
        showEquivalenceLines: false,
        onToggleEquivalenceLines: jest.fn(),
        onClear: jest.fn(),
        onCopyLink: jest.fn(),
        onExport: jest.fn(),
    };

    it('renders label mode buttons with aria-pressed attributes', () => {
        render(<FractionWallSidebar {...defaultProps} />);

        const fractionBtn = screen.getByRole('button', { name: /fraction/i });
        const decimalBtn = screen.getByRole('button', { name: /decimal/i });

        expect(fractionBtn).toHaveAttribute('aria-pressed', 'true');
        expect(decimalBtn).toHaveAttribute('aria-pressed', 'false');
    });

    it('renders visible row buttons with aria-pressed and aria-label attributes', () => {
        render(<FractionWallSidebar {...defaultProps} />);

        // Use exact name match to avoid matching "row 10" when looking for "row 1"
        const row1Btn = screen.getByRole('button', { name: "Toggle visibility of row 1" });
        const row3Btn = screen.getByRole('button', { name: "Toggle visibility of row 3" });

        expect(row1Btn).toHaveAttribute('aria-pressed', 'true');
        expect(row3Btn).toHaveAttribute('aria-pressed', 'false');
    });
});
