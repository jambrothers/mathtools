"use client"

import { renderHook, act } from '@testing-library/react';
import { useDraggable } from '@/lib/hooks/use-draggable';

// Helper to create pointer events (will work for both mouse and pointer events)
function createPointerEvent(type: string, options: Partial<PointerEvent> = {}): PointerEvent {
    return new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: options.clientX ?? 0,
        clientY: options.clientY ?? 0,
        pointerId: options.pointerId ?? 1,
        pointerType: options.pointerType ?? 'mouse',
        ...options
    });
}

// Helper for React synthetic events
function createReactPointerEvent(options: Partial<React.PointerEvent> = {}): React.PointerEvent {
    return {
        clientX: options.clientX ?? 0,
        clientY: options.clientY ?? 0,
        pointerId: options.pointerId ?? 1,
        pointerType: options.pointerType ?? 'mouse',
        currentTarget: {
            setPointerCapture: jest.fn(),
            releasePointerCapture: jest.fn(),
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
    } as unknown as React.PointerEvent;
}

describe('useDraggable', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('returns initial position', () => {
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 100, y: 200 })
            );

            expect(result.current.position).toEqual({ x: 100, y: 200 });
        });

        it('starts with isDragging as false', () => {
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 })
            );

            expect(result.current.isDragging).toBe(false);
        });

        it('returns a handler function for pointer down', () => {
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 })
            );

            // The handler should be named handlePointerDown after migration
            // For now it's handleMouseDown, test will verify behavior regardless of name
            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            expect(typeof handler).toBe('function');
        });
    });

    describe('drag threshold', () => {
        it('does not trigger drag for movements below threshold', async () => {
            const onDragStart = jest.fn();
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 100, y: 100 }, {
                    onDragStart,
                    threshold: 10
                })
            );

            // Start potential drag
            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({ clientX: 100, clientY: 100 }));
            });

            // Move less than threshold
            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', { clientX: 105, clientY: 105 }));
                window.dispatchEvent(createPointerEvent('mousemove', { clientX: 105, clientY: 105 } as any));
            });

            expect(result.current.isDragging).toBe(false);
            expect(onDragStart).not.toHaveBeenCalled();
        });

        it('triggers onDragStart when threshold is crossed', async () => {
            const onDragStart = jest.fn();
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 100, y: 100 }, {
                    onDragStart,
                    threshold: 5
                })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({ clientX: 100, clientY: 100 }));
            });

            // Move beyond threshold
            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', { clientX: 120, clientY: 120 }));
                window.dispatchEvent(createPointerEvent('mousemove', { clientX: 120, clientY: 120 } as any));
            });

            expect(result.current.isDragging).toBe(true);
            expect(onDragStart).toHaveBeenCalledWith('test-id', { x: 100, y: 100 });
        });

        it('uses default threshold of 5 pixels', async () => {
            const onDragStart = jest.fn();
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 }, { onDragStart })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({ clientX: 0, clientY: 0 }));
            });

            // Move exactly 4 pixels (below default threshold)
            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', { clientX: 3, clientY: 3 }));
                window.dispatchEvent(createPointerEvent('mousemove', { clientX: 3, clientY: 3 } as any));
            });

            expect(result.current.isDragging).toBe(false);
            expect(onDragStart).not.toHaveBeenCalled();

            // Move to 6 pixels (above threshold)
            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', { clientX: 5, clientY: 5 }));
                window.dispatchEvent(createPointerEvent('mousemove', { clientX: 5, clientY: 5 } as any));
            });

            expect(result.current.isDragging).toBe(true);
        });
    });

    describe('drag lifecycle', () => {
        it('updates position during drag', async () => {
            const onDragMove = jest.fn();
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 50, y: 50 }, {
                    onDragMove,
                    threshold: 5
                })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({ clientX: 50, clientY: 50 }));
            });

            // Move to trigger drag
            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', { clientX: 100, clientY: 150 }));
                window.dispatchEvent(createPointerEvent('mousemove', { clientX: 100, clientY: 150 } as any));
            });

            expect(result.current.position).toEqual({ x: 100, y: 150 });
            expect(onDragMove).toHaveBeenCalled();
        });

        it('triggers onDragEnd on pointer up', async () => {
            const onDragEnd = jest.fn();
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 }, {
                    onDragEnd,
                    threshold: 5
                })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({ clientX: 0, clientY: 0 }));
            });

            // Move to start drag
            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', { clientX: 50, clientY: 50 }));
                window.dispatchEvent(createPointerEvent('mousemove', { clientX: 50, clientY: 50 } as any));
            });

            // Release
            act(() => {
                window.dispatchEvent(createPointerEvent('pointerup', { clientX: 50, clientY: 50 }));
                window.dispatchEvent(createPointerEvent('mouseup', { clientX: 50, clientY: 50 } as any));
            });

            expect(result.current.isDragging).toBe(false);
            expect(onDragEnd).toHaveBeenCalledWith('test-id', expect.objectContaining({ x: 50, y: 50 }));
        });

        it('does not call onDragEnd if drag never started', async () => {
            const onDragEnd = jest.fn();
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 }, {
                    onDragEnd,
                    threshold: 10
                })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({ clientX: 0, clientY: 0 }));
            });

            // Release without moving (no drag started)
            act(() => {
                window.dispatchEvent(createPointerEvent('pointerup', {}));
                window.dispatchEvent(createPointerEvent('mouseup', {} as any));
            });

            expect(onDragEnd).not.toHaveBeenCalled();
        });
    });

    describe('disabled state', () => {
        it('does not start drag when disabled', async () => {
            const onDragStart = jest.fn();
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 }, {
                    onDragStart,
                    disabled: true
                })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({ clientX: 0, clientY: 0 }));
            });

            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', { clientX: 100, clientY: 100 }));
                window.dispatchEvent(createPointerEvent('mousemove', { clientX: 100, clientY: 100 } as any));
            });

            expect(result.current.isDragging).toBe(false);
            expect(onDragStart).not.toHaveBeenCalled();
        });
    });

    describe('grid snapping', () => {
        it('snaps position to grid when gridSize is specified', async () => {
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 }, {
                    gridSize: 20,
                    threshold: 5
                })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({ clientX: 0, clientY: 0 }));
            });

            // Move to position that should snap
            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', { clientX: 35, clientY: 45 }));
                window.dispatchEvent(createPointerEvent('mousemove', { clientX: 35, clientY: 45 } as any));
            });

            // 35 rounds to 40, 45 rounds to 40
            expect(result.current.position).toEqual({ x: 40, y: 40 });
        });
    });

    describe('scale support', () => {
        it('adjusts movement by scale factor', async () => {
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 }, {
                    scale: 2, // 2x zoom
                    threshold: 5
                })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({ clientX: 0, clientY: 0 }));
            });

            // Move 100 pixels on screen = 50 pixels in scaled space
            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', { clientX: 100, clientY: 100 }));
                window.dispatchEvent(createPointerEvent('mousemove', { clientX: 100, clientY: 100 } as any));
            });

            expect(result.current.position).toEqual({ x: 50, y: 50 });
        });
    });

    describe('position sync', () => {
        it('syncs position when initialPos changes and not dragging', async () => {
            const { result, rerender } = renderHook(
                ({ pos }) => useDraggable('test-id', pos),
                { initialProps: { pos: { x: 0, y: 0 } } }
            );

            expect(result.current.position).toEqual({ x: 0, y: 0 });

            // External update (e.g., undo action)
            rerender({ pos: { x: 200, y: 300 } });

            expect(result.current.position).toEqual({ x: 200, y: 300 });
        });
    });

    describe('pointer type support', () => {
        it('works with touch pointer type', async () => {
            const onDragStart = jest.fn();
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 }, {
                    onDragStart,
                    threshold: 5
                })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({
                    clientX: 0,
                    clientY: 0,
                    pointerType: 'touch'
                }));
            });

            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', {
                    clientX: 50,
                    clientY: 50,
                    pointerType: 'touch'
                }));
                window.dispatchEvent(createPointerEvent('mousemove', {
                    clientX: 50,
                    clientY: 50
                } as any));
            });

            expect(result.current.isDragging).toBe(true);
            expect(onDragStart).toHaveBeenCalled();
        });

        it('works with pen pointer type', async () => {
            const onDragStart = jest.fn();
            const { result } = renderHook(() =>
                useDraggable('test-id', { x: 0, y: 0 }, {
                    onDragStart,
                    threshold: 5
                })
            );

            const handler = result.current.handleMouseDown ?? result.current.handlePointerDown;
            act(() => {
                handler(createReactPointerEvent({
                    clientX: 0,
                    clientY: 0,
                    pointerType: 'pen'
                }));
            });

            act(() => {
                window.dispatchEvent(createPointerEvent('pointermove', {
                    clientX: 50,
                    clientY: 50,
                    pointerType: 'pen'
                }));
                window.dispatchEvent(createPointerEvent('mousemove', {
                    clientX: 50,
                    clientY: 50
                } as any));
            });

            expect(result.current.isDragging).toBe(true);
        });
    });
});
