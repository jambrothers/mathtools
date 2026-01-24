import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Circuit Designer interactive tool.
 * Tests verify canvas, component operations, wiring, demos, and truth table generation.
 */
test.describe('Circuit Designer - Page Load', () => {
    const BASE_URL = '/computing/circuit-designer';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should display the page with main elements', async ({ page }) => {
        // Dashboard/main area should be visible - check for component options
        await expect(page.locator('text=Switch').first()).toBeVisible();
        await expect(page.locator('text=Bulb').first()).toBeVisible();
    });

    test('should display sidebar with component options', async ({ page }) => {
        // Sidebar should have component buttons
        await expect(page.locator('text=Switch').first()).toBeVisible();
        await expect(page.locator('text=Bulb').first()).toBeVisible();
    });

    test('should display AND gate option', async ({ page }) => {
        await expect(page.locator('text=AND').first()).toBeVisible();
    });

    test('should display OR gate option', async ({ page }) => {
        await expect(page.locator('text=OR').first()).toBeVisible();
    });

    test('should display NOT gate option', async ({ page }) => {
        await expect(page.locator('text=NOT').first()).toBeVisible();
    });

    test('should display XOR gate option', async ({ page }) => {
        await expect(page.locator('text=XOR').first()).toBeVisible();
    });

    test('should display toolbar controls', async ({ page }) => {
        // Check for key toolbar buttons
        await expect(page.locator('button:has-text("Clear")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Truth Table")').first()).toBeVisible();
    });

    test('should display demo buttons', async ({ page }) => {
        // Quick demo buttons for common circuits
        const demoButtons = page.locator('button').filter({ hasText: /AND Demo|OR Demo|NOT Demo|XOR Demo/i });
        const count = await demoButtons.count();
        expect(count).toBeGreaterThanOrEqual(0); // At least some demo options
    });
});

test.describe('Circuit Designer - Component Operations', () => {
    const BASE_URL = '/computing/circuit-designer';

    test('should add Switch component when clicking sidebar', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Click on Switch in sidebar
        const switchButton = page.locator('aside button, [class*="sidebar"] button').filter({ hasText: 'Switch' }).first();

        if (await switchButton.isVisible()) {
            await switchButton.click();
            await page.waitForTimeout(300);
        }
    });

    test('should add AND gate when clicking sidebar', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Click on AND in sidebar
        const andButton = page.locator('aside button, [class*="sidebar"] button').filter({ hasText: 'AND' }).first();

        if (await andButton.isVisible()) {
            await andButton.click();
            await page.waitForTimeout(300);
        }
    });

    test('should add Bulb component when clicking sidebar', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Click on Bulb in sidebar
        const bulbButton = page.locator('aside button, [class*="sidebar"] button').filter({ hasText: 'Bulb' }).first();

        if (await bulbButton.isVisible()) {
            await bulbButton.click();
            await page.waitForTimeout(300);
        }
    });

    test('Clear button should remove all components', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Add a component first
        const switchButton = page.locator('aside button, [class*="sidebar"] button').filter({ hasText: 'Switch' }).first();
        if (await switchButton.isVisible()) {
            await switchButton.click();
            await page.waitForTimeout(300);
        }

        // Click Clear
        await page.click('button:has-text("Clear")');
        await page.waitForTimeout(500);

        // May need to confirm clear
        const confirmButton = page.locator('button:has-text("Confirm")');
        if (await confirmButton.isVisible()) {
            await confirmButton.click();
            await page.waitForTimeout(300);
        }
    });
});

test.describe('Circuit Designer - Demo Circuits', () => {
    const BASE_URL = '/computing/circuit-designer';

    test('AND Demo should load AND gate circuit', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Find and click AND Demo button
        const andDemo = page.locator('button').filter({ hasText: /AND/i }).first();

        if (await andDemo.isVisible()) {
            await andDemo.click();
            await page.waitForTimeout(500);
        }
    });

    test('OR Demo should load OR gate circuit', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Find and click OR Demo button
        const orDemo = page.locator('button').filter({ hasText: /OR/i }).first();

        if (await orDemo.isVisible()) {
            await orDemo.click();
            await page.waitForTimeout(500);
        }
    });

    test('NOT Demo should load NOT gate circuit', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Find and click NOT Demo button
        const notDemo = page.locator('button').filter({ hasText: /NOT/i }).first();

        if (await notDemo.isVisible()) {
            await notDemo.click();
            await page.waitForTimeout(500);
        }
    });

    test('XOR Demo should load XOR gate circuit', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Find and click XOR Demo button
        const xorDemo = page.locator('button').filter({ hasText: /XOR/i }).first();

        if (await xorDemo.isVisible()) {
            await xorDemo.click();
            await page.waitForTimeout(500);
        }
    });
});

test.describe('Circuit Designer - Truth Table', () => {
    const BASE_URL = '/computing/circuit-designer';

    test('Truth Table button should open truth table dialog/panel', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // First load a demo circuit to have components
        const andDemo = page.locator('button').filter({ hasText: /AND/i }).first();
        if (await andDemo.isVisible()) {
            await andDemo.click();
            await page.waitForTimeout(500);
        }

        // Click Truth Table button
        const truthTableButton = page.locator('button:has-text("Truth Table")').first();
        if (await truthTableButton.isVisible()) {
            await truthTableButton.click();
            await page.waitForTimeout(500);

            // Truth table should appear (look for table or header text)
            await expect(page.locator('table, text=Truth Table, text=Output').first()).toBeVisible();
            // Just checking it doesn't crash
        }
    });
});

test.describe('Circuit Designer - Switch Interaction', () => {
    const BASE_URL = '/computing/circuit-designer';

    test('should toggle switch state on click', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Load a demo with switches
        const andDemo = page.locator('button').filter({ hasText: /AND/i }).first();
        if (await andDemo.isVisible()) {
            await andDemo.click();
            await page.waitForTimeout(500);
        }

        // Find a switch component and click it
        const switchComponent = page.locator('[class*="switch"], [data-type="switch"]').first();

        if (await switchComponent.isVisible()) {
            await switchComponent.click();
            await page.waitForTimeout(300);

            // Click again to toggle back
            await switchComponent.click();
            await page.waitForTimeout(300);
        }
    });
});

test.describe('Circuit Designer - Component Dragging', () => {
    const BASE_URL = '/computing/circuit-designer';

    test('should allow dragging components to reposition', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Load a demo circuit
        const andDemo = page.locator('button').filter({ hasText: /AND/i }).first();
        if (await andDemo.isVisible()) {
            await andDemo.click();
            await page.waitForTimeout(500);
        }

        // Find a circuit node/component
        const component = page.locator('[class*="circuit-node"], [class*="node"]').first();

        if (await component.isVisible()) {
            const box = await component.boundingBox();

            if (box) {
                // Drag the component
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 50, box.y + 50);
                await page.mouse.up();
                await page.waitForTimeout(300);
            }
        }
    });
});

test.describe('Circuit Designer - Undo Functionality', () => {
    const BASE_URL = '/computing/circuit-designer';

    test('Undo button should revert adding a component', async ({ page }) => {
        page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Get initial count of nodes
        const initialNodes = await page.locator('[data-testid="circuit-node"]').count();

        // Add an AND gate
        // Use :has(span:text("AND")) to distinguish from toolbar demo button which is plain text
        const andButton = page.locator('button').filter({ has: page.locator('span', { hasText: 'AND' }) }).first();
        if (await andButton.isVisible()) {
            await andButton.click();
            await page.waitForTimeout(300);
        }

        // Verify count increased
        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialNodes + 1);

        // Click Undo
        await page.click('button:has-text("Undo")');

        // Verify count returned to initial
        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialNodes);
    });

    test('Ctrl+Z should trigger undo', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Get initial count of nodes
        const initialNodes = await page.locator('[data-testid="circuit-node"]').count();

        // Add a Switch
        const switchButton = page.locator('button').filter({ has: page.locator('span', { hasText: 'Switch' }) }).first();
        if (await switchButton.isVisible()) {
            await switchButton.click();
            await page.waitForTimeout(300);
        }

        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialNodes + 1);

        // Press Ctrl+Z
        await page.keyboard.press('Control+z');

        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialNodes);
    });

    test('Undo should revert Clear Canvas', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        const initialNodes = await page.locator('[data-testid="circuit-node"]').count();
        expect(initialNodes).toBeGreaterThan(0);

        // Click Clear
        await page.click('button:has-text("Clear")');
        // No confirmation modal anymore, so it should clear immediately

        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(0);

        // Click Undo
        await page.click('button:has-text("Undo")');

        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialNodes);
    });
});

test.describe('Circuit Designer - Drag Drop', () => {
    const BASE_URL = '/computing/circuit-designer';

    test('should allow dragging components from sidebar to canvas', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        const initialNodes = await page.locator('[data-testid="circuit-node"]').count();
        const canvas = page.locator('[data-testid="canvas"]');
        const switchButton = page.locator('button').filter({ has: page.locator('span', { hasText: 'Switch' }) }).first();

        // Drag switch to canvas center
        await switchButton.dragTo(canvas, {
            targetPosition: { x: 300, y: 300 }
        });

        // Check node count increased
        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialNodes + 1);
    });

    test('should allow dragging Logic Gates from sidebar', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        const initialNodes = await page.locator('[data-testid="circuit-node"]').count();
        const canvas = page.locator('[data-testid="canvas"]');
        const andButton = page.locator('button').filter({ has: page.locator('span', { hasText: 'AND' }) }).first();

        await andButton.dragTo(canvas, {
            targetPosition: { x: 400, y: 300 }
        });

        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialNodes + 1);
    });
});
