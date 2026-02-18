import { render, screen, fireEvent } from '@testing-library/react';
import CountersPage from '@/app/mathematics/double-sided-counters/page';
import { useCounters } from '@/app/mathematics/double-sided-counters/_hooks/use-counters';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock useCounters
jest.mock('@/app/mathematics/double-sided-counters/_hooks/use-counters', () => ({
    useCounters: jest.fn(),
    CounterType: {}
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    usePathname: () => ''
}));

jest.mock('@/components/page-title-context', () => ({
    usePageTitle: () => ({ setTitle: jest.fn() }),
    PageTitleContext: { Provider: ({ children }: { children: React.ReactNode }) => children }
}));

jest.mock('@/components/set-page-title', () => ({
    SetPageTitle: () => null
}));

// Mock useDraggable
jest.mock('@/lib/hooks/use-draggable', () => ({
    useDraggable: () => ({
        position: { x: 0, y: 0 },
        isDragging: false,
        handlePointerDown: jest.fn(),
    })
}));

describe('Double Sided Counters Interaction', () => {
    const mockUseCounters = useCounters as jest.Mock;

    beforeAll(() => {
        // Polyfill setPointerCapture for JSDOM
        Element.prototype.setPointerCapture = jest.fn();
        Element.prototype.releasePointerCapture = jest.fn();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const defaultMockReturn = {
        counters: [{ id: 1, value: 1, x: 100, y: 100 }],
        selectedIds: new Set(),
        handleSelect: jest.fn(),
        handleDragMove: jest.fn(),
        deleteSelected: jest.fn(),
        clearSelection: jest.fn(),
        handleMarqueeSelect: jest.fn(),
        highlightedPair: [],
        isAnimating: false,
        canUndo: true,
        undo: jest.fn(),
        handleDragStart: jest.fn(),
        sortState: 'none',
        isSequentialMode: false,
        setIsSequentialMode: jest.fn(),
        isOrdered: true,
        animSpeed: 1000,
        setAnimSpeed: jest.fn(),
        setCountersFromState: jest.fn(),
        snapToOrder: jest.fn(),
        flipAll: jest.fn(),
        organize: jest.fn(),
        cancelZeroPairs: jest.fn(),
        clearBoard: jest.fn(),
        addCounter: jest.fn(),
        addCounterAtPosition: jest.fn(),
        addZeroPair: jest.fn(),
        flipCounter: jest.fn(),
        removeCounter: jest.fn(),
        updateCounterPosition: jest.fn()
    };

    it.skip('selects a counter on click', () => {
        const handleSelect = jest.fn();
        mockUseCounters.mockReturnValue({
            ...defaultMockReturn,
            handleSelect
        });

        render(<CountersPage />);

        const counters = screen.getAllByTestId(/^counter-\d+$/);

        // Or just assume first one is id 1 since mock has id 1.
        fireEvent.pointerDown(counters[0]);

        expect(handleSelect).toHaveBeenCalledWith(1, false);
    });

    it.skip('adds to selection on shift+click', () => {
        const handleSelect = jest.fn();
        mockUseCounters.mockReturnValue({
            ...defaultMockReturn,
            counters: [
                { id: 1, value: 1, x: 100, y: 100 },
                { id: 2, value: 1, x: 200, y: 100 }
            ],
            handleSelect
        });

        render(<CountersPage />);

        const counters = screen.getAllByTestId(/^counter-\d+$/);
        // Click the second one (id 2)
        // DraggableCounter handles shift+selection on CLICK, not pointerDown
        fireEvent.click(counters[1], { shiftKey: true });

        expect(handleSelect).toHaveBeenCalledWith(2, true);
    });

    it('deletes selected counters when Delete key is pressed', () => {
        const deleteSelected = jest.fn();
        mockUseCounters.mockReturnValue({
            ...defaultMockReturn,
            selectedIds: new Set([1]),
            deleteSelected
        });

        render(<CountersPage />);

        fireEvent.keyDown(window, { key: 'Delete' });
        expect(deleteSelected).toHaveBeenCalled();
    });

    it('does not delete if no selection', () => {
        const deleteSelected = jest.fn();
        mockUseCounters.mockReturnValue({
            ...defaultMockReturn,
            selectedIds: new Set(),
            deleteSelected
        });

        render(<CountersPage />);

        fireEvent.keyDown(window, { key: 'Delete' });
        expect(deleteSelected).not.toHaveBeenCalled();
    });

    it('triggers marquee selection', () => {
        const handleMarqueeSelect = jest.fn();
        mockUseCounters.mockReturnValue({
            ...defaultMockReturn,
            counters: [
                { id: 1, value: 1, x: 100, y: 100 },
                { id: 2, value: -1, x: 200, y: 200 }
            ],
            handleMarqueeSelect
        });

        render(<CountersPage />);

        const canvas = screen.getByTestId('counter-canvas');

        fireEvent.pointerDown(canvas, { clientX: 0, clientY: 0, offsetX: 0, offsetY: 0 });
        fireEvent.pointerMove(canvas, { clientX: 150, clientY: 150, offsetX: 150, offsetY: 150 });
        fireEvent.pointerUp(canvas, { clientX: 150, clientY: 150, offsetX: 150, offsetY: 150 });

        expect(handleMarqueeSelect).toHaveBeenCalled();
        expect(handleMarqueeSelect).toHaveBeenCalledTimes(1);
    });
});
