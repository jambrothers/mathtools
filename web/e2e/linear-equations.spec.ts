import { test, expect } from '@playwright/test';

test.describe('Linear Equations Tool', () => {
    const BASE_URL = '/mathematics/linear-equations';

    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(BASE_URL);
        await page.waitForSelector('[data-testid="linear-equations-page"]', { state: 'visible', timeout: 15000 });
        await page.waitForSelector('[data-testid="graph-svg"]', { state: 'attached', timeout: 10000 });
    });

    test.describe('Layout & Sidebar', () => {
        test('should have centered graph (centerpiece)', async ({ page }) => {
            const svg = page.getByTestId('graph-svg');
            await expect(svg).toBeAttached();
            await expect(svg.locator('line').first()).toBeAttached();
        });

        test('should have functional sidebar toggle', async ({ page }) => {
            const toggleBtn = page.getByTestId('sidebar-toggle-button').first();
            await expect(toggleBtn).toBeVisible();

            const initialLabel = await toggleBtn.getAttribute('aria-label');
            await toggleBtn.click();
            await expect(toggleBtn).not.toHaveAttribute('aria-label', initialLabel || "");

            await toggleBtn.click();
            await expect(toggleBtn).toHaveAttribute('aria-label', initialLabel || "");
        });

        test('should scroll sidebar independently', async ({ page }) => {
            const exportBtn = page.getByText('Export');
            await exportBtn.scrollIntoViewIfNeeded();
            await expect(exportBtn).toBeVisible();
        });
    });

    test.describe('Interactive Graphing', () => {
        test('should allow dragging to move (change c)', async ({ page }) => {
            // Use getByText click to bypass sr-only input check issues
            await page.getByText('Show Equation').click();
            await expect(page.locator('.equation-label')).toBeAttached();

            await page.getByRole('button', { name: 'Move (c)' }).click();

            // Use hit-area for better target size
            const targetLine = page.getByTestId('function-line-hit-area-line-1');
            const box = await targetLine.boundingBox();
            if (!box) throw new Error("Line not found");

            // Drag
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 150, { steps: 10 });
            await page.mouse.up();

            const cValue = parseFloat(await page.getByTestId('slider-y-intercept--c-').inputValue());
            expect(cValue).not.toBe(1);
        });

        test('should allow rotating (change m)', async ({ page }) => {
            await page.getByRole('button', { name: 'Reset Tool' }).click();
            await page.getByRole('button', { name: 'Rotate (m)' }).click();

            const targetLine = page.getByTestId('function-line-hit-area-line-1');
            const box = await targetLine.boundingBox();
            if (!box) throw new Error("Line not found");

            // Click near the right edge of the bounding box (high x)
            await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.8, { steps: 15 });
            await page.mouse.up();

            const mValue = parseFloat(await page.getByTestId('slider-gradient--m-').inputValue());
            expect(mValue).not.toBe(0.5);
        });

        test('should display slope triangle and labels', async ({ page }) => {
            await page.getByText('Show Slope Triangle').click();
            await expect(page.locator('.slope-triangle')).toBeAttached();
        });
    });

    test.describe('Controls', () => {
        test('should update graph when sliders change', async ({ page }) => {
            await page.getByText('Show Equation').click();
            await expect(page.locator('.equation-label')).toBeAttached();

            const mSlider = page.getByTestId('slider-gradient--m-');
            await mSlider.fill('2');
            await expect(page.locator('.equation-label')).toContainText('y = 2x');
        });

        test('should toggle display options', async ({ page }) => {
            // Equation starts hidden (default false)
            await page.getByText('Show Equation').click();
            await expect(page.locator('.equation-label')).toBeAttached();
            await page.getByText('Show Equation').click(); // Toggle off
            await expect(page.locator('.equation-label')).not.toBeAttached();

            // Grid starts shown (default true)
            await expect(page.getByTestId('graph-grid')).toBeAttached();
            await page.getByText('Show Grid').click(); // Toggle off
            await expect(page.getByTestId('graph-grid')).not.toBeAttached();
            await page.getByText('Show Grid').click(); // Toggle on
            await expect(page.getByTestId('graph-grid')).toBeAttached();
        });

        test('should apply presets', async ({ page }) => {
            await page.getByRole('button', { name: 'Proportional' }).click();
            await expect(page.getByTestId('slider-y-intercept--c-')).toHaveValue('0');

            await page.getByRole('button', { name: 'Parallel Line' }).click();
            await expect(page.getByText('Line 2')).toBeVisible();
        });
    });

    test.describe('Multi-line Support', () => {
        test('should add and remove lines', async ({ page }) => {
            await page.getByRole('button', { name: 'Add', exact: true }).click();
            await expect(page.getByText('Line 2')).toBeVisible();

            await page.getByRole('button', { name: 'Remove this line' }).click();
            await expect(page.getByText('Line 2')).not.toBeVisible();
        });
    });

    test.describe('Regressions', () => {
        test('should not show floating point artifacts in gradient stepper', async ({ page }) => {
            const increaseBtn = page.getByLabel('Increase Gradient (m)');

            // Starts at 0.5. Increment to 0.6, 0.7, 0.8
            await increaseBtn.click(); // 0.6
            await expect(page.locator('.text-xs.text-slate-500.font-mono').first()).toHaveText('0.6');

            await increaseBtn.click(); // 0.7
            await increaseBtn.click(); // 0.8
            await expect(page.locator('.text-xs.text-slate-500.font-mono').first()).toHaveText('0.8');

            // Previous bug would show 0.799999999999 or similar
            await expect(page.locator('.text-xs.text-slate-500.font-mono').first()).not.toHaveText(/0\.799/);
            await expect(page.locator('.text-xs.text-slate-500.font-mono').first()).not.toHaveText(/0\.8000/);
        });
    });
});
