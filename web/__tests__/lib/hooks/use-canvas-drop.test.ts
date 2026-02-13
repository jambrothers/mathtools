"use client"

import { renderHook, act } from '@testing-library/react';
import { useCanvasDrop } from '@/lib/hooks/use-canvas-drop';

describe('useCanvasDrop', () => {
    let canvasElement: HTMLElement;
    let canvasRef: React.RefObject<HTMLElement | null>;
    let onDropData: jest.Mock;

    beforeEach(() => {
        canvasElement = document.createElement('div');
        jest.spyOn(canvasElement, 'getBoundingClientRect').mockReturnValue({
            left: 100,
            top: 100,
            width: 500,
            height: 500,
            right: 600,
            bottom: 600,
            x: 100,
            y: 100,
            toJSON: () => {}
        });

        // Mock add/removeEventListener since we're using a DOM element which has them,
        // but we might want to spy on them.
        jest.spyOn(canvasElement, 'addEventListener');
        jest.spyOn(canvasElement, 'removeEventListener');

        canvasRef = { current: canvasElement };
        onDropData = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handleDrop', () => {
        it('parses JSON data and calls onDropData with correct coordinates', () => {
            const { result } = renderHook(() => useCanvasDrop({
                canvasRef,
                onDropData
            }));

            const data = { id: 'test-item', type: 'tile' };
            const event = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clientX: 250,
                clientY: 250,
                dataTransfer: {
                    getData: jest.fn().mockReturnValue(JSON.stringify(data)),
                    dropEffect: 'none'
                }
            } as unknown as React.DragEvent<HTMLElement>;

            act(() => {
                result.current.handleDrop(event);
            });

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(event.dataTransfer.getData).toHaveBeenCalledWith('application/json');
            // 250 (client) - 100 (rect) = 150
            expect(onDropData).toHaveBeenCalledWith(data, { x: 150, y: 150 });
        });

        it('snaps coordinates to grid when gridSize is provided', () => {
            const gridSize = 20;
            const { result } = renderHook(() => useCanvasDrop({
                canvasRef,
                onDropData,
                gridSize
            }));

            const data = { id: 'test-item' };
            // 255 - 100 = 155. Snap to 20 -> 160
            const event = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clientX: 255,
                clientY: 255,
                dataTransfer: {
                    getData: jest.fn().mockReturnValue(JSON.stringify(data))
                }
            } as unknown as React.DragEvent<HTMLElement>;

            act(() => {
                result.current.handleDrop(event);
            });

            expect(onDropData).toHaveBeenCalledWith(data, { x: 160, y: 160 });
        });

        it('handles drop parse error gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const { result } = renderHook(() => useCanvasDrop({
                canvasRef,
                onDropData
            }));

            const event = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                clientX: 200,
                clientY: 200,
                dataTransfer: {
                    getData: jest.fn().mockReturnValue('invalid-json')
                }
            } as unknown as React.DragEvent<HTMLElement>;

            act(() => {
                result.current.handleDrop(event);
            });

            expect(onDropData).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('Drop parse error:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('does nothing if data is empty', () => {
            const { result } = renderHook(() => useCanvasDrop({
                canvasRef,
                onDropData
            }));

            const event = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                dataTransfer: {
                    getData: jest.fn().mockReturnValue('')
                }
            } as unknown as React.DragEvent<HTMLElement>;

            act(() => {
                result.current.handleDrop(event);
            });

            expect(onDropData).not.toHaveBeenCalled();
        });

        it('does nothing if canvasRef is null', () => {
             const { result } = renderHook(() => useCanvasDrop({
                canvasRef: { current: null },
                onDropData
            }));

            const event = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                 dataTransfer: {
                    getData: jest.fn().mockReturnValue(JSON.stringify({}))
                }
            } as unknown as React.DragEvent<HTMLElement>;

            act(() => {
                result.current.handleDrop(event);
            });

            expect(onDropData).not.toHaveBeenCalled();
        });
    });

    describe('handleDragOver', () => {
        it('sets dropEffect and prevents default', () => {
            const { result } = renderHook(() => useCanvasDrop({
                canvasRef,
                onDropData,
                dropEffect: 'move'
            }));

            const event = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                dataTransfer: {
                    dropEffect: 'none'
                }
            } as unknown as React.DragEvent<HTMLElement>;

            act(() => {
                result.current.handleDragOver(event);
            });

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(event.dataTransfer.dropEffect).toBe('move');
        });
    });

    describe('handleTouchDrop', () => {
        it('listens for touchdrop event and handles it', () => {
            renderHook(() => useCanvasDrop({
                canvasRef,
                onDropData
            }));

            expect(canvasElement.addEventListener).toHaveBeenCalledWith('touchdrop', expect.any(Function));

            // Get the handler
            const handler = (canvasElement.addEventListener as jest.Mock).mock.calls[0][1];

            const data = { id: 'touch-item' };
            const customEvent = {
                detail: {
                    dragData: data,
                    clientX: 300,
                    clientY: 300
                }
            };

            act(() => {
                handler(customEvent);
            });

            // 300 - 100 = 200
            expect(onDropData).toHaveBeenCalledWith(data, { x: 200, y: 200 });
        });

        it('cleans up event listener on unmount', () => {
            const { unmount } = renderHook(() => useCanvasDrop({
                canvasRef,
                onDropData
            }));

            unmount();
            expect(canvasElement.removeEventListener).toHaveBeenCalledWith('touchdrop', expect.any(Function));
        });
    });
});
