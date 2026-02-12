import { render, screen, fireEvent, act } from '@testing-library/react';
import { DraggableSidebarItem, SidebarDragData } from '@/components/tool-ui/draggable-sidebar-item';

describe('DraggableSidebarItem', () => {
    const defaultDragData: SidebarDragData = { type: 'test', value: 42 };

    describe('rendering', () => {
        it('renders label', () => {
            render(<DraggableSidebarItem dragData={defaultDragData} label="Test Item" />);
            expect(screen.getByText('Test Item')).toBeInTheDocument();
        });

        it('renders icon when provided', () => {
            render(
                <DraggableSidebarItem
                    dragData={defaultDragData}
                    label="Test"
                    icon={<div data-testid="icon">Icon</div>}
                />
            );
            expect(screen.getByTestId('icon')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            render(
                <DraggableSidebarItem
                    dragData={defaultDragData}
                    label="Test"
                    className="custom-class"
                />
            );
            expect(screen.getByRole('button')).toHaveClass('custom-class');
        });

        it('is a button element', () => {
            render(<DraggableSidebarItem dragData={defaultDragData} label="Test" />);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('click handling', () => {
        it('calls onClick when clicked', () => {
            const onClick = jest.fn();
            render(
                <DraggableSidebarItem
                    dragData={defaultDragData}
                    label="Test"
                    onClick={onClick}
                />
            );

            fireEvent.click(screen.getByRole('button'));

            expect(onClick).toHaveBeenCalled();
        });

        it('does not throw if no onClick provided', () => {
            render(<DraggableSidebarItem dragData={defaultDragData} label="Test" />);
            expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
        });
    });

    describe('mouse drag (native HTML5)', () => {
        it('is draggable', () => {
            render(<DraggableSidebarItem dragData={defaultDragData} label="Test" />);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('draggable', 'true');
        });

        it('sets dataTransfer on dragStart', () => {
            render(<DraggableSidebarItem dragData={defaultDragData} label="Test" />);
            const button = screen.getByRole('button');

            const mockSetData = jest.fn();
            const mockDataTransfer = {
                setData: mockSetData,
                effectAllowed: ''
            };

            fireEvent.dragStart(button, { dataTransfer: mockDataTransfer });

            expect(mockSetData).toHaveBeenCalledWith(
                'application/json',
                JSON.stringify(defaultDragData)
            );
            expect(mockDataTransfer.effectAllowed).toBe('copy');
        });
    });

    describe('touch drag (custom pointer events)', () => {
        let originalElementFromPoint: typeof document.elementFromPoint;

        beforeEach(() => {
            originalElementFromPoint = document.elementFromPoint;
        });

        afterEach(() => {
            document.elementFromPoint = originalElementFromPoint;
        });

        it('shows ghost element during touch drag and updates its position', () => {
            render(
                <DraggableSidebarItem
                    dragData={defaultDragData}
                    label="Test"
                    icon={<div data-testid="icon">🔵</div>}
                />
            );
            const button = screen.getByRole('button');

            // Simulate touch drag start  
            fireEvent.pointerDown(button, {
                clientX: 100,
                clientY: 100,
                pointerType: 'touch',
                pointerId: 1
            });

            // Trigger drag threshold (dist > 5)
            // Move from 100,100 to 200,200
            act(() => {
                fireEvent.pointerMove(button, {
                    clientX: 200,
                    clientY: 200,
                    pointerType: 'touch'
                });
            });

            // Ghost element should be in the document (via portal)
            const ghost = document.querySelector('[data-testid="drag-ghost"]') as HTMLElement;
            expect(ghost).toBeInTheDocument();

            // Initial position check (should match the event that triggered the drag start)
            // Note: Our implementation sets position on pointerMove.
            // When drag starts, it renders. Does it set style immediately?
            // The imperative update happens in the `if (ghostRef.current)` block which is after the render cycle.
            // But since we are in `act`, let's see.
            // Actually, the `pointerMove` that *starts* the drag (sets state) does *not* execute the imperative update block
            // because `ghostRef.current` is null at that moment (it's being rendered).

            // So we need another move to verify position update.

            act(() => {
                fireEvent.pointerMove(button, {
                    clientX: 250,
                    clientY: 250,
                    pointerType: 'touch'
                });
            });

            expect(ghost.style.left).toBe('250px');
            expect(ghost.style.top).toBe('250px');
        });

        it('does not show ghost for mouse pointer type', () => {
            render(
                <DraggableSidebarItem
                    dragData={defaultDragData}
                    label="Test"
                    icon={<div data-testid="icon">🔵</div>}
                />
            );
            const button = screen.getByRole('button');

            // Mouse pointer type should use native drag
            fireEvent.pointerDown(button, {
                clientX: 100,
                clientY: 100,
                pointerType: 'mouse',
                pointerId: 1
            });

            fireEvent.pointerMove(button, {
                clientX: 200,
                clientY: 200,
                pointerType: 'mouse'
            });

            const ghost = document.querySelector('[data-testid="drag-ghost"]');
            expect(ghost).not.toBeInTheDocument();
        });

        it('dispatches touchdrop event when released over canvas', () => {
            // Create a mock canvas element
            const canvasDiv = document.createElement('div');
            canvasDiv.setAttribute('data-testid', 'counter-canvas');
            document.body.appendChild(canvasDiv);

            const touchDropHandler = jest.fn();
            canvasDiv.addEventListener('touchdrop', touchDropHandler);

            // Mock elementFromPoint to return canvas
            document.elementFromPoint = jest.fn().mockReturnValue(canvasDiv);

            render(
                <DraggableSidebarItem
                    dragData={defaultDragData}
                    label="Test"
                    icon={<div>🔵</div>}
                />
            );
            const button = screen.getByRole('button');

            // Simulate complete touch drag
            act(() => {
                fireEvent.pointerDown(button, {
                    clientX: 100,
                    clientY: 100,
                    pointerType: 'touch',
                    pointerId: 1
                });
            });

            act(() => {
                fireEvent.pointerMove(button, {
                    clientX: 200,
                    clientY: 200,
                    pointerType: 'touch'
                });
            });

            act(() => {
                fireEvent.pointerUp(button, {
                    clientX: 200,
                    clientY: 200,
                    pointerType: 'touch'
                });
            });

            expect(touchDropHandler).toHaveBeenCalled();

            // Cleanup
            document.body.removeChild(canvasDiv);
        });

        it('clears ghost element on pointer up', () => {
            render(
                <DraggableSidebarItem
                    dragData={defaultDragData}
                    label="Test"
                    icon={<div>🔵</div>}
                />
            );
            const button = screen.getByRole('button');

            act(() => {
                fireEvent.pointerDown(button, {
                    clientX: 100,
                    clientY: 100,
                    pointerType: 'touch',
                    pointerId: 1
                });
            });

            act(() => {
                fireEvent.pointerMove(button, {
                    clientX: 200,
                    clientY: 200,
                    pointerType: 'touch'
                });
            });

            // Ghost should exist
            expect(document.querySelector('[data-testid="drag-ghost"]')).toBeInTheDocument();

            act(() => {
                fireEvent.pointerUp(button, {
                    clientX: 200,
                    clientY: 200,
                    pointerType: 'touch'
                });
            });

            // Ghost should be gone
            expect(document.querySelector('[data-testid="drag-ghost"]')).not.toBeInTheDocument();
        });

        it('works with pen pointer type', () => {
            render(
                <DraggableSidebarItem
                    dragData={defaultDragData}
                    label="Test"
                    icon={<div data-testid="icon">🔵</div>}
                />
            );
            const button = screen.getByRole('button');

            fireEvent.pointerDown(button, {
                clientX: 100,
                clientY: 100,
                pointerType: 'pen',
                pointerId: 1
            });

            fireEvent.pointerMove(button, {
                clientX: 200,
                clientY: 200,
                pointerType: 'pen'
            });

            const ghost = document.querySelector('[data-testid="drag-ghost"]');
            expect(ghost).toBeInTheDocument();
        });
    });

    describe('disabled state', () => {
        it('applies disabled styles when disabled', () => {
            render(
                <DraggableSidebarItem
                    dragData={defaultDragData}
                    label="Test"
                    disabled
                />
            );
            expect(screen.getByRole('button')).toBeDisabled();
        });
    });
});
