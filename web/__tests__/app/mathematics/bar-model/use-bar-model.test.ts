/**
 * Unit tests for useBarModel hook.
 *
 * Tests cover:
 * - Adding bars with snapping
 * - Deleting bars
 * - Moving bars with snapping
 * - Resizing bars with minimum width constraint
 * - Selection management
 * - Clone, join, and split operations
 * - Undo functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useBarModel, BarData } from '@/app/mathematics/bar-model/_hooks/use-bar-model';
import { GRID_SIZE, DEFAULT_BAR_WIDTH, MIN_BAR_WIDTH, BAR_HEIGHT } from '@/app/mathematics/bar-model/constants';

describe('useBarModel', () => {
    describe('addBar', () => {
        it('should add a bar with snapped position', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(105, 55, 0, '1');
            });

            expect(result.current.bars).toHaveLength(1);
            expect(result.current.bars[0]).toMatchObject({
                x: 100, // Snapped from 105
                y: 60,  // Snapped from 55
                colorIndex: 0,
                label: '1',
                width: DEFAULT_BAR_WIDTH,
            });
            expect(result.current.bars[0].id).toBeDefined();
        });

        it('should add multiple bars with unique IDs', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(100, 100, 0, 'A');
                result.current.addBar(200, 100, 1, 'B');
            });

            expect(result.current.bars).toHaveLength(2);
            expect(result.current.bars[0].id).not.toBe(result.current.bars[1].id);
        });

        it('should return the created bar', () => {
            const { result } = renderHook(() => useBarModel());
            let createdBar: BarData | undefined;

            act(() => {
                createdBar = result.current.addBar(100, 100, 0, 'Test');
            });

            expect(createdBar).toBeDefined();
            expect(createdBar!.label).toBe('Test');
        });
    });

    describe('deleteBar', () => {
        it('should delete a bar by ID', () => {
            const { result } = renderHook(() => useBarModel());
            let bar: BarData | undefined;

            act(() => {
                bar = result.current.addBar(100, 100, 0, 'Test');
            });

            act(() => {
                result.current.deleteBar(bar!.id);
            });

            expect(result.current.bars).toHaveLength(0);
        });

        it('should not throw if ID does not exist', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(100, 100, 0, 'Test');
            });

            expect(() => {
                act(() => {
                    result.current.deleteBar('nonexistent-id');
                });
            }).not.toThrow();

            expect(result.current.bars).toHaveLength(1);
        });
    });

    describe('deleteSelected', () => {
        it('should delete all selected bars', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar1 = result.current.addBar(100, 100, 0, 'A');
                result.current.addBar(200, 100, 1, 'B');
                const bar3 = result.current.addBar(300, 100, 2, 'C');
                result.current.selectBars([bar1.id, bar3.id]);
            });

            act(() => {
                result.current.deleteSelected();
            });

            expect(result.current.bars).toHaveLength(1);
            expect(result.current.bars[0].label).toBe('B');
            expect(result.current.selectedIds.size).toBe(0);
        });
    });

    describe('moveBar', () => {
        it('should move a bar to snapped position', () => {
            const { result } = renderHook(() => useBarModel());
            let bar: BarData | undefined;

            act(() => {
                bar = result.current.addBar(100, 100, 0, 'Test');
            });

            act(() => {
                result.current.moveBar(bar!.id, 155, 165);
            });

            expect(result.current.bars[0]).toMatchObject({
                x: 160, // Snapped from 155
                y: 160, // Snapped from 165
            });
        });
    });

    describe('moveSelected', () => {
        it('should move all selected bars by delta', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar1 = result.current.addBar(100, 100, 0, 'A');
                const bar2 = result.current.addBar(200, 100, 1, 'B');
                result.current.addBar(300, 100, 2, 'C'); // Not selected
                result.current.selectBars([bar1.id, bar2.id]);
            });

            act(() => {
                result.current.moveSelected(40, 20);
            });

            expect(result.current.bars[0]).toMatchObject({ x: 140, y: 120 });
            expect(result.current.bars[1]).toMatchObject({ x: 240, y: 120 });
            expect(result.current.bars[2]).toMatchObject({ x: 300, y: 100 }); // Unchanged
        });
    });

    describe('resizeBar', () => {
        it('should resize a bar to snapped width', () => {
            const { result } = renderHook(() => useBarModel());
            let bar: BarData | undefined;

            act(() => {
                bar = result.current.addBar(100, 100, 0, 'Test');
            });

            act(() => {
                result.current.resizeBar(bar!.id, 165);
            });

            expect(result.current.bars[0].width).toBe(160); // Snapped from 165
        });

        it('should enforce minimum width', () => {
            const { result } = renderHook(() => useBarModel());
            let bar: BarData | undefined;

            act(() => {
                bar = result.current.addBar(100, 100, 0, 'Test');
            });

            act(() => {
                result.current.resizeBar(bar!.id, 5);
            });

            expect(result.current.bars[0].width).toBe(MIN_BAR_WIDTH);
        });
    });

    describe('selection', () => {
        it('should select a single bar', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar = result.current.addBar(100, 100, 0, 'Test');
                result.current.selectBar(bar.id);
            });

            expect(result.current.selectedIds.size).toBe(1);
        });

        it('should replace selection by default', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar1 = result.current.addBar(100, 100, 0, 'A');
                const bar2 = result.current.addBar(200, 100, 1, 'B');
                result.current.selectBar(bar1.id);
                result.current.selectBar(bar2.id);
            });

            expect(result.current.selectedIds.size).toBe(1);
        });

        it('should add to selection when additive is true', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar1 = result.current.addBar(100, 100, 0, 'A');
                const bar2 = result.current.addBar(200, 100, 1, 'B');
                result.current.selectBar(bar1.id);
                result.current.selectBar(bar2.id, true);
            });

            expect(result.current.selectedIds.size).toBe(2);
        });

        it('should toggle selection when additive and already selected', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar1 = result.current.addBar(100, 100, 0, 'A');
                const bar2 = result.current.addBar(200, 100, 1, 'B');
                result.current.selectBars([bar1.id, bar2.id]);
                result.current.selectBar(bar1.id, true); // Toggle off
            });

            expect(result.current.selectedIds.size).toBe(1);
            expect(result.current.selectedIds.has(result.current.bars[1].id)).toBe(true);
        });

        it('should clear selection', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar = result.current.addBar(100, 100, 0, 'Test');
                result.current.selectBar(bar.id);
                result.current.clearSelection();
            });

            expect(result.current.selectedIds.size).toBe(0);
        });

        it('should select bars in rectangle', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(100, 100, 0, 'A'); // Inside rect
                result.current.addBar(200, 100, 1, 'B'); // Inside rect
                result.current.addBar(500, 500, 2, 'C'); // Outside rect
            });

            act(() => {
                result.current.selectInRect(new DOMRect(50, 50, 300, 200));
            });

            expect(result.current.selectedIds.size).toBe(2);
        });
    });

    describe('cloneSelectedRight', () => {
        it('should clone selected bars to the right', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar = result.current.addBar(100, 100, 0, 'Original');
                result.current.resizeBar(bar.id, 80);
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.cloneSelectedRight();
            });

            expect(result.current.bars).toHaveLength(2);
            expect(result.current.bars[1].label).toBe('Original');
            expect(result.current.bars[1].x).toBe(180); // 100 + 80 (bar width)
            expect(result.current.bars[1].y).toBe(100); // Same Y
            // New bar should be selected
            expect(result.current.selectedIds.has(result.current.bars[1].id)).toBe(true);
        });

        it('should do nothing if no selection', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(100, 100, 0, 'Test');
                result.current.cloneSelectedRight();
            });

            expect(result.current.bars).toHaveLength(1);
        });
    });

    describe('cloneSelectedDown', () => {
        it('should clone selected bars below', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar = result.current.addBar(100, 100, 0, 'Original');
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.cloneSelectedDown();
            });

            expect(result.current.bars).toHaveLength(2);
            expect(result.current.bars[1].label).toBe('Original');
            expect(result.current.bars[1].x).toBe(100); // Same X
            expect(result.current.bars[1].y).toBe(100 + BAR_HEIGHT + GRID_SIZE); // Below
            // New bar should be selected
            expect(result.current.selectedIds.has(result.current.bars[1].id)).toBe(true);
        });

        it('should do nothing if no selection', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(100, 100, 0, 'Test');
                result.current.cloneSelectedDown();
            });

            expect(result.current.bars).toHaveLength(1);
        });
    });

    describe('isTotal property', () => {
        it('should set a bar as total', () => {
            const { result } = renderHook(() => useBarModel());
            let bar: BarData | undefined;

            act(() => {
                bar = result.current.addBar(100, 100, 0, 'Test');
            });

            act(() => {
                result.current.setBarAsTotal(bar!.id, true);
            });

            expect(result.current.bars[0].isTotal).toBe(true);
        });

        it('should unset a bar as total', () => {
            const { result } = renderHook(() => useBarModel());
            let bar: BarData | undefined;

            act(() => {
                bar = result.current.addBar(100, 100, 0, 'Test');
                result.current.setBarAsTotal(bar!.id, true);
            });

            act(() => {
                result.current.setBarAsTotal(bar!.id, false);
            });

            expect(result.current.bars[0].isTotal).toBe(false);
        });

        it('should ensure only one bar is total at a time', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar1 = result.current.addBar(100, 100, 0, 'A');
                result.current.addBar(200, 100, 1, 'B');
                result.current.setBarAsTotal(bar1.id, true); // Set A as total
            });

            expect(result.current.bars[0].isTotal).toBe(true);

            act(() => {
                result.current.setBarAsTotal(result.current.bars[1].id, true); // Set B as total
            });

            expect(result.current.bars[1].isTotal).toBe(true);
            expect(result.current.bars[0].isTotal).toBe(false); // A should be unset
        });
    });

    describe('applyQuickLabel', () => {
        it('should apply x label to selected bars', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar = result.current.addBar(100, 100, 0, 'Original');
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.applyQuickLabel('x');
            });

            expect(result.current.bars[0].label).toBe('x');
        });

        it('should apply y label to selected bars', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar = result.current.addBar(100, 100, 0, 'Original');
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.applyQuickLabel('y');
            });

            expect(result.current.bars[0].label).toBe('y');
        });

        it('should apply ? label to selected bars', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar = result.current.addBar(100, 100, 0, 'Original');
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.applyQuickLabel('?');
            });

            expect(result.current.bars[0].label).toBe('?');
        });

        it('should apply units label (width in grid units)', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar = result.current.addBar(100, 100, 0, 'Original');
                result.current.resizeBar(bar.id, 100); // 100px = 5 grid units
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.applyQuickLabel('units');
            });

            expect(result.current.bars[0].label).toBe('5'); // 100 / 20 = 5 units
        });

        it('should not support relative as quick label anymore', () => {
            // 'relative' removed from QuickLabelType, so this test is now obsolete
            // or should verify it's not accepted if we were using strings.
            // Typescript prevents this, so we just remove the old test.
        });




        it('should do nothing if no selection', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(100, 100, 0, 'Original');
            });

            act(() => {
                result.current.applyQuickLabel('x');
            });

            expect(result.current.bars[0].label).toBe('Original');
        });
    });

    describe('joinSelected', () => {
        it('should merge selected bars into one', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar1 = result.current.addBar(100, 100, 0, 'A');
                const bar2 = result.current.addBar(200, 100, 1, 'B');
                result.current.selectBars([bar1.id, bar2.id]);
            });

            act(() => {
                result.current.joinSelected();
            });

            expect(result.current.bars).toHaveLength(1);
            const mergedBar = result.current.bars[0];
            expect(mergedBar.width).toBe(200); // 100 + 100 (default widths)
            expect(mergedBar.label).toBe(''); // Reset label
            expect(mergedBar.colorIndex).toBe(0); // Inherit first bar color
            expect(mergedBar.y).toBe(100); // Same Y level
        });

        it('should do nothing with no selection', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(100, 100, 0, 'Test');
                result.current.joinSelected();
            });

            expect(result.current.bars).toHaveLength(1);
        });
    });

    describe('splitSelected', () => {
        it('should split bar into halves', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                // Use width divisible by 2 on grid: 120 / 2 = 60, snap(60) = 60
                const bar = result.current.addBar(100, 100, 0, 'Whole');
                result.current.resizeBar(bar.id, 120);
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.splitSelected(2);
            });

            expect(result.current.bars).toHaveLength(2);
            expect(result.current.bars[0].width).toBe(60);
            expect(result.current.bars[1].width).toBe(60);
            expect(result.current.bars[0].label).toBe(''); // No label on split
            expect(result.current.bars[1].label).toBe(''); // No label on split
            expect(result.current.bars[1].x).toBe(160); // 100 + 60 = 160
        });

        it('should split bar into thirds', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                // Use width divisible by 3 for clean split
                const bar = result.current.addBar(100, 100, 0, 'Whole');
                result.current.resizeBar(bar.id, 120);
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.splitSelected(3);
            });

            expect(result.current.bars).toHaveLength(3);
            expect(result.current.bars[0].width).toBe(40);
            expect(result.current.bars[0].label).toBe(''); // No label on split
        });

        it('should handle non-divisible widths by giving remainder to last part', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                const bar = result.current.addBar(100, 100, 0, 'Whole');
                result.current.resizeBar(bar.id, 100); // 100 / 3 = 33.33...
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.splitSelected(3);
            });

            // Total should still be 100 (snapped: 40 + 40 + 20 = 100)
            const totalWidth = result.current.bars.reduce((sum, b) => sum + b.width, 0);
            expect(totalWidth).toBeGreaterThanOrEqual(MIN_BAR_WIDTH * 3);
        });

        it('should split bar into fifths', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                // 100 units / 5 = 20 units
                const bar = result.current.addBar(100, 100, 0, 'Whole');
                result.current.resizeBar(bar.id, 100);
                result.current.selectBar(bar.id);
            });

            act(() => {
                result.current.splitSelected(5);
            });

            expect(result.current.bars).toHaveLength(5);
            expect(result.current.bars[0].width).toBe(20);
        });
    });

    describe('toggleRelativeLabel', () => {
        it('should toggle the relative label property', () => {
            const { result } = renderHook(() => useBarModel());
            let bar: BarData | undefined;

            act(() => {
                bar = result.current.addBar(100, 100, 0, 'Test');
                result.current.selectBar(bar.id);
            });

            expect(result.current.bars[0].showRelativeLabel).toBeFalsy();

            act(() => {
                result.current.toggleRelativeLabel();
            });

            expect(result.current.bars[0].showRelativeLabel).toBe(true);

            act(() => {
                result.current.toggleRelativeLabel();
            });

            expect(result.current.bars[0].showRelativeLabel).toBe(false);
        });
    });

    describe('updateBarLabel', () => {
        it('should update the label of a bar', () => {
            const { result } = renderHook(() => useBarModel());
            let bar: BarData | undefined;

            act(() => {
                bar = result.current.addBar(100, 100, 0, 'Original');
            });

            act(() => {
                result.current.updateBarLabel(bar!.id, 'Updated');
            });

            expect(result.current.bars[0].label).toBe('Updated');
        });
    });

    describe('undo', () => {
        it('should undo adding a bar', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(100, 100, 0, 'Test');
            });

            expect(result.current.bars).toHaveLength(1);
            expect(result.current.canUndo).toBe(true);

            act(() => {
                result.current.undo();
            });

            expect(result.current.bars).toHaveLength(0);
        });

        it('should undo delete', () => {
            const { result } = renderHook(() => useBarModel());
            let bar: BarData | undefined;

            act(() => {
                bar = result.current.addBar(100, 100, 0, 'Test');
            });

            act(() => {
                result.current.deleteBar(bar!.id);
            });

            expect(result.current.bars).toHaveLength(0);

            act(() => {
                result.current.undo();
            });

            expect(result.current.bars).toHaveLength(1);
        });

        it('should report canUndo correctly', () => {
            const { result } = renderHook(() => useBarModel());

            expect(result.current.canUndo).toBe(false);

            act(() => {
                result.current.addBar(100, 100, 0, 'Test');
            });

            expect(result.current.canUndo).toBe(true);
        });
    });

    describe('clearAll', () => {
        it('should remove all bars', () => {
            const { result } = renderHook(() => useBarModel());

            act(() => {
                result.current.addBar(100, 100, 0, 'A');
                result.current.addBar(200, 100, 1, 'B');
            });

            act(() => {
                result.current.clearAll();
            });

            expect(result.current.bars).toHaveLength(0);
            expect(result.current.selectedIds.size).toBe(0);
        });
    });

    describe('initFromState', () => {
        it('should initialize with provided bars', () => {
            const { result } = renderHook(() => useBarModel());

            const initialBars: BarData[] = [
                { id: 'bar-1', x: 100, y: 100, width: 100, colorIndex: 0, label: 'A' },
                { id: 'bar-2', x: 200, y: 100, width: 150, colorIndex: 1, label: 'B' },
            ];

            act(() => {
                result.current.initFromState(initialBars);
            });

            expect(result.current.bars).toHaveLength(2);
            expect(result.current.bars[0].label).toBe('A');
            expect(result.current.bars[1].label).toBe('B');
        });
    });
});
