import { render, screen, fireEvent } from '@testing-library/react';
import { ExportModal } from '../../../components/tool-ui/export-modal';

describe('ExportModal', () => {
    const mockOnClose = jest.fn();
    const mockOnExport = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not render when isOpen is false', () => {
        const { container } = render(
            <ExportModal
                isOpen={false}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders correctly when isOpen is true', () => {
        render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );

        expect(screen.getByText('Export')).toBeInTheDocument();
        expect(screen.getByText('PNG Image')).toBeInTheDocument();
        expect(screen.getByText('SVG Vector')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders custom title when provided', () => {
        render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
                title="Custom Export Title"
            />
        );
        expect(screen.getByText('Custom Export Title')).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );

        fireEvent.click(screen.getByLabelText('Close'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the cancel button is clicked', () => {
        render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );

        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the backdrop is clicked', () => {
        const { container } = render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );

        // The first div is the backdrop
        fireEvent.click(container.firstChild as Element);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when the modal content is clicked', () => {
        render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );

        // Click on the title, which is inside the modal content
        fireEvent.click(screen.getByText('Export'));
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onExport with "png" when PNG option is selected', () => {
        render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );

        fireEvent.click(screen.getByText('PNG Image'));
        expect(mockOnExport).toHaveBeenCalledWith('png');
    });

    it('calls onExport with "svg" when SVG option is selected', () => {
        render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );

        fireEvent.click(screen.getByText('SVG Vector'));
        expect(mockOnExport).toHaveBeenCalledWith('svg');
    });

    it('calls onClose when Escape key is pressed', () => {
        render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when other keys are pressed', () => {
        render(
            <ExportModal
                isOpen={true}
                onClose={mockOnClose}
                onExport={mockOnExport}
            />
        );

        fireEvent.keyDown(document, { key: 'Enter' });
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
