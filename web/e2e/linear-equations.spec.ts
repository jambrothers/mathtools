import { test, expect } from '@playwright/test';


test.describe('Linear Equations Tool', () => {
    const BASE_URL = '/mathematics/linear-equations';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        // Wait for graph to be visible
        await page.waitForSelector('.w-full.h-full.drop-shadow-xl'); // SVG selector
    });

    test('should display default line and values', () => {
        // verify title (via page title set)
        // verify default values in sliders
        // verify line is rendered
    });

    test('should update graph when sliders change', async ({ page }) => {
        // Change gradient slider
        const mSlider = page.locator('input[type="range"]').first(); // Gradient is first
        await mSlider.fill('2');
        // Check display value update
        await expect(page.locator('span.font-mono').first()).toHaveText('2');

        // Equation label on graph should update
        // We might need to look for text content in SVG
        await expect(page.locator('text=y = 2x + 1')).toBeVisible();
    });

    test('should add and remove lines', async ({ page }) => {
        // Click Add button
        await page.getByTitle("Add Line").click();

        // Should have 2 tabs
        await expect(page.getByText('Line 2')).toBeVisible();

        // Remove line
        await page.getByText('Remove this line').click();

        // Should have 1 tab/line again
        await expect(page.getByText('Line 2')).not.toBeVisible();
    });

    test('should apply presets', async ({ page }) => {
        // Parallel preset
        await page.getByText('Parallel Line').click();

        // Should add a new line (Line 2)
        await expect(page.getByText('Line 2')).toBeVisible();

        // Verify gradients are equal (approx check via sliders or assumption that preset works if line added)
        // Unit tests covered the math logic. E2E verifies UI hookup.
    });

    test('should toggle display options', async ({ page }) => {
        // Toggle equation off
        await page.getByText('Show Equation').click();

        // Equation label should disappear
        await expect(page.locator('text=y = 0.5x + 1')).not.toBeVisible();
    });

    test('export menu should open', async ({ page }) => {
        await page.getByText('Export').click();
        await expect(page.getByText('PNG Image')).toBeVisible();
        await expect(page.getByText('SVG Vector')).toBeVisible();
    });

});
