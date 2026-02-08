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
        await expect(page.getByRole('button', { name: 'Clone Left' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Clone Up' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Clone Down' })).toBeVisible();
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
