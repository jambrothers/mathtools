import { renderHook, act } from '@testing-library/react';
import { useUrlState } from '@/lib/hooks/use-url-state';
import { useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
}));

describe('useUrlState', () => {
    const originalLocation = window.location;
    const originalClipboard = navigator.clipboard;

    beforeAll(() => {
        // Mock clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn(),
            },
        });

        // Mock window location
        delete (window as any).location;
        (window as any).location = {
            origin: 'http://localhost',
            pathname: '/test',
            assign: jest.fn(),
        };
    });

    afterAll(() => {
        window.location = originalLocation;
        Object.assign(navigator, { clipboard: originalClipboard });
    });

    const mockOnRestore = jest.fn();
    const mockDeserialize = jest.fn();
    const mockSerialize = jest.fn();

    const mockSerializer = {
        deserialize: mockDeserialize,
        serialize: mockSerialize,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should restore state from valid URL params', () => {
        // Arrange
        const mockParams = new URLSearchParams('foo=bar');
        (useSearchParams as jest.Mock).mockReturnValue(mockParams);
        const restoredState = { foo: 'bar' };
        mockDeserialize.mockReturnValue(restoredState);

        // Act
        const { result, rerender } = renderHook(() =>
            useUrlState(mockSerializer, { onRestore: mockOnRestore })
        );

        // Assert
        expect(mockDeserialize).toHaveBeenCalledWith(mockParams);
        expect(mockOnRestore).toHaveBeenCalledWith(restoredState);

        // Change params to trigger effect re-run, checking the early return
        const newParams = new URLSearchParams('foo=baz');
        (useSearchParams as jest.Mock).mockReturnValue(newParams);

        rerender();

        // Check hasRestored update
        expect(result.current.hasRestored).toBe(false);
        act(() => {
            jest.runAllTimers();
        });
        expect(result.current.hasRestored).toBe(true);
    });

    it('should NOT call onRestore if deserialization returns null', () => {
        // Arrange
        const mockParams = new URLSearchParams('invalid=true');
        (useSearchParams as jest.Mock).mockReturnValue(mockParams);
        mockDeserialize.mockReturnValue(null);

        // Act
        const { result } = renderHook(() =>
            useUrlState(mockSerializer, { onRestore: mockOnRestore })
        );

        // Assert
        expect(mockDeserialize).toHaveBeenCalledWith(mockParams);
        expect(mockOnRestore).not.toHaveBeenCalled();

        // hasRestored should still become true
        act(() => {
            jest.runAllTimers();
        });
        expect(result.current.hasRestored).toBe(true);
    });

    it('should handle empty search params', () => {
        // Arrange
        const mockParams = new URLSearchParams('');
        (useSearchParams as jest.Mock).mockReturnValue(mockParams);

        // Act
        const { result } = renderHook(() =>
            useUrlState(mockSerializer, { onRestore: mockOnRestore })
        );

        // Assert
        expect(mockDeserialize).not.toHaveBeenCalled();
        expect(mockOnRestore).not.toHaveBeenCalled();

        // hasRestored should still become true
        act(() => {
            jest.runAllTimers();
        });
        expect(result.current.hasRestored).toBe(true);
    });

    it('should generate shareable URL', () => {
        // Arrange
        const mockParams = new URLSearchParams('test=123');
        (useSearchParams as jest.Mock).mockReturnValue(mockParams);
        mockSerialize.mockReturnValue(new URLSearchParams('saved=state'));

        const { result } = renderHook(() =>
            useUrlState(mockSerializer, { onRestore: mockOnRestore })
        );

        // Act
        const url = result.current.getShareableUrl({ some: 'state' });

        // Assert
        expect(mockSerialize).toHaveBeenCalledWith({ some: 'state' });
        expect(url).toBe('http://localhost/test?saved=state');
    });

    it('should use provided baseUrl for shareable URL', () => {
        // Arrange
        const mockParams = new URLSearchParams('');
        (useSearchParams as jest.Mock).mockReturnValue(mockParams);
        mockSerialize.mockReturnValue(new URLSearchParams('q=1'));

        const { result } = renderHook(() =>
            useUrlState(mockSerializer, {
                onRestore: mockOnRestore,
                baseUrl: 'https://example.com/tool'
            })
        );

        // Act
        const url = result.current.getShareableUrl({ some: 'state' });

        // Assert
        expect(url).toBe('https://example.com/tool?q=1');
    });

    it('should copy shareable URL to clipboard', async () => {
        // Arrange
        const mockParams = new URLSearchParams('');
        (useSearchParams as jest.Mock).mockReturnValue(mockParams);
        mockSerialize.mockReturnValue(new URLSearchParams('x=y'));

        const { result } = renderHook(() =>
            useUrlState(mockSerializer, { onRestore: mockOnRestore })
        );

        // Act
        await act(async () => {
            await result.current.copyShareableUrl({ some: 'state' });
        });

        // Assert
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost/test?x=y');
    });
});
