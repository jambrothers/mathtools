import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TruthTableModal } from '../../../../app/computing/circuit-designer/_components/truth-table-modal';
import { TruthTableData, CircuitNode } from '../../../../app/computing/circuit-designer/constants';

// Mock data
const mockInputs: CircuitNode[] = [
    { id: '1', type: 'INPUT', x: 0, y: 0, label: 'A', state: false },
    { id: '2', type: 'INPUT', x: 0, y: 0, label: 'B', state: false },
];
const mockOutputs: CircuitNode[] = [
    { id: '3', type: 'OUTPUT', x: 0, y: 0, label: 'Out', state: false },
];

const mockRows = [
    { inputs: [0, 0], outputs: [0] },
    { inputs: [0, 1], outputs: [0] },
    { inputs: [1, 0], outputs: [0] },
    { inputs: [1, 1], outputs: [1] },
];

const mockData: TruthTableData = {
    inputs: mockInputs,
    outputs: mockOutputs,
    rows: mockRows,
};

describe('TruthTableModal', () => {
    const mockOnClose = jest.fn();
    const mockOnRefresh = jest.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
        mockOnRefresh.mockClear();
    });

    it('renders the modal with correct title', () => {
        render(<TruthTableModal data={mockData} onClose={mockOnClose} onRefresh={mockOnRefresh} />);
        expect(screen.getByText('Truth Table')).toBeInTheDocument();
        expect(screen.getByText('4 Combinations Generated')).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
        render(<TruthTableModal data={mockData} onClose={mockOnClose} onRefresh={mockOnRefresh} />);
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
        expect(screen.getByText('Out')).toBeInTheDocument();
    });

    it('renders correct number of rows and cell values', () => {
        render(<TruthTableModal data={mockData} onClose={mockOnClose} onRefresh={mockOnRefresh} />);

        // Check for specific values in the table.
        // Note: screen.getAllByText('0') might match many things.
        // We can check if the correct number of rows exist (excluding header).
        const rows = screen.getAllByRole('row');
        // 1 header row + 4 data rows = 5 rows
        expect(rows).toHaveLength(5);

        // Check a specific row content
        // Last row should have 1, 1 -> 1
        const lastRow = rows[4];
        expect(lastRow).toHaveTextContent('1');
    });

    it('calls onClose when close button is clicked', () => {
        render(<TruthTableModal data={mockData} onClose={mockOnClose} onRefresh={mockOnRefresh} />);
        const closeButton = screen.getByLabelText('Close');
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onRefresh when refresh button is clicked', () => {
        render(<TruthTableModal data={mockData} onClose={mockOnClose} onRefresh={mockOnRefresh} />);
        const refreshButton = screen.getByText('Refresh');
        fireEvent.click(refreshButton);
        expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
});
