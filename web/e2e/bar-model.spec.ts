/**
 * E2E tests for the Bar Model tool.
 *
 * Tests cover page loading, basic interactions, and key features.
 */

import { test, expect } from '@playwright/test';

test.describe('Bar Model Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/mathematics/bar-model');
    });

    test('page loads with correct elements', async ({ page }) => {
        // Check canvas exists and is visible
        await expect(page.locator('[data-testid="bar-model-canvas"]')).toBeVisible();

        // Check empty state message
        await expect(page.getByText('Drag bars here to start')).toBeVisible();

        // Check sidebar section exists (labels removed, but section title should exist)
        await expect(page.getByText('Bar Blocks')).toBeVisible();
    });

    test('can add a bar via drag and drop', async ({ page }) => {
        // Get the first draggable bar in sidebar (buttons within the Bar Blocks section)
        const sidebarButton = page.locator('[data-testid="bar-model-canvas"]').locator('..').locator('button').first();
        const canvas = page.locator('[data-testid="bar-model-canvas"]');

        // Get canvas bounding box
        const canvasBox = await canvas.boundingBox();
        expect(canvasBox).not.toBeNull();

        // Drag from sidebar to canvas
        await sidebarButton.dragTo(canvas, {
            targetPosition: { x: 200, y: 200 }
        });

        // Check bar appears on canvas (empty state should disappear)
        await expect(page.getByText('Drag bars here to start')).not.toBeVisible();
    });


    test('toolbar buttons exist and dropdowns work', async ({ page }) => {
        // Add a bar and select it to enable toolbar buttons
        const sidebarButton = page.locator('[data-testid="bar-model-canvas"]').locator('..').locator('button').first();
        const canvas = page.locator('[data-testid="bar-model-canvas"]');
        await sidebarButton.dragTo(canvas, { targetPosition: { x: 200, y: 200 } });
        // Click the bar to select it (it should be at 200,200)
        // We can find it by text or class. Newly added bar has no text label initially?
        // Let's click the canvas center or use a locator for the bar.
        const bar = canvas.locator('[data-testid^="bar-"]').first();
        await bar.click();

        // Check operation buttons exist (top level)
        await expect(page.getByRole('button', { name: 'Quick Label' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Join' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Split', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Clone', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();

        // Check Split Dropdown
        await page.getByRole('button', { name: 'Split', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Split ½' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Split ⅓' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Split ⅕' })).toBeVisible();

        // Close split dropdown (click backdrop or another button)
        await page.locator('body').click({ position: { x: 0, y: 0 } });

        // Check Clone Dropdown
        await page.getByRole('button', { name: 'Clone', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Clone Right' })).toBeVisible();

        // Close Clone Dropdown
        await page.locator('body').click({ position: { x: 0, y: 0 } });
    });

    test('FDP format dropdown works correctly', async ({ page }) => {
        const canvas = page.locator('[data-testid="bar-model-canvas"]');

        // 1. Add two bars
        const sidebarButton = page.locator('[data-testid="bar-model-canvas"]').locator('..').locator('button').first();

        // Add Bar 1 (Total)
        await sidebarButton.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });
        // Add Bar 2 (Relative)
        await sidebarButton.dragTo(canvas, { targetPosition: { x: 100, y: 200 } });

        // 2. Setup Bar 1 as Total
        const bars = canvas.locator('[data-testid^="bar-"]');
        await expect(bars).toHaveCount(2);

        const bar1 = bars.nth(0);
        await bar1.click();
        await page.getByRole('button', { name: 'Set Total' }).click();
        await expect(bar1.getByText('TOTAL')).toBeVisible();

        // Ensure Total has a label like "100%" for relative calculation
        await bar1.dblclick();
        await page.keyboard.type('100%');
        await page.keyboard.press('Enter');

        // 3. Setup Bar 2 as Relative
        const bar2 = bars.nth(1);
        await bar2.click();

        // Initially format dropdown disabled
        const formatBtn = page.getByRole('button', { name: /Format/i });
        await expect(formatBtn).toBeDisabled();

        // Enable Relative
        await page.getByRole('button', { name: /Relative/i }).click();

        // Format dropdown should be enabled now
        await expect(formatBtn).toBeEnabled();

        // 4. Change Format
        await formatBtn.click();
        await expect(page.getByRole('button', { name: 'Match Total' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Fraction' })).toBeVisible();

        // Select Fraction
        await page.getByRole('button', { name: 'Fraction' }).click();

        // Verify label changes (since widths equal, should be 1/1 or 1)
        // Default width is 100. Ratio is 1.
        // Fraction for 1 is "1".
        await expect(bar2.getByText(/^1$/)).toBeVisible();

        // 5. Split to create fractions
        // Default bar width is 100px (5 grid units).
        // Cannot split into 2 (2.5 units) because of grid snapping.
        // We can split into 5 (1 unit each).
        await page.getByRole('button', { name: 'Split', exact: true }).click();
        await page.getByRole('button', { name: 'Split ⅕' }).click();

        // Now we should have 6 bars total (1 total + 5 fifths)
        // The first fifth should inherit Fraction format
        const fifth = canvas.locator('[data-testid^="bar-"]').nth(1);
        await expect(fifth.getByText('1/5')).toBeVisible();

        // 6. Change to Decimal
        await expect(formatBtn).toBeEnabled();

        await formatBtn.click();
        await page.getByRole('button', { name: 'Decimal' }).click();
        await expect(fifth.getByText('0.2')).toBeVisible();

        // 7. Change to Percentage
        await formatBtn.click();
        await page.getByRole('button', { name: 'Percentage' }).click();
        await expect(fifth.getByText('20%')).toBeVisible();
    });

    test('help button opens modal', async ({ page }) => {
        // Click help button (CircleHelp icon button)
        const helpButton = page.locator('button[aria-label="Help"]');
        await helpButton.click();

        // Check modal opens
        await expect(page.getByTestId('help-modal-backdrop')).toBeVisible();

        // Close modal by clicking "Got it" button
        await page.getByRole('button', { name: 'Got it' }).click();
        await expect(page.getByTestId('help-modal-backdrop')).not.toBeVisible();
    });

    test('navigates from tools page', async ({ page }) => {
        await page.goto('/tools');

        // Find and click the bar model card (use the link with full context)
        const barModelLink = page.getByRole('link', { name: /Bar Model Create and manipulate bar models/i });
        await expect(barModelLink).toBeVisible();
        await barModelLink.click();

        // Should navigate to bar model page
        await expect(page).toHaveURL(/\/mathematics\/bar-model/);
    });
});

test.describe('Bar Model URL State', () => {
    test('restores state from URL', async ({ page }) => {
        // Navigate with URL params (a single bar)
        await page.goto('/mathematics/bar-model?b=0:1,100,100,100');

        // Wait for page to load and state to restore
        await expect(page.locator('[data-testid="bar-model-canvas"]')).toBeVisible();

        // Empty state should not be visible since we have bars
        await expect(page.getByText('Drag bars here to start')).not.toBeVisible();
    });
});
