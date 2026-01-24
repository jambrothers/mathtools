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

        // Check sidebar has bar blocks
        await expect(page.getByText('1 Unit')).toBeVisible();
        await expect(page.getByText('Variable x')).toBeVisible();
        await expect(page.getByText('Variable y')).toBeVisible();
    });

    test('can add a bar via drag and drop', async ({ page }) => {
        const sidebar = page.getByText('1 Unit');
        const canvas = page.locator('[data-testid="bar-model-canvas"]');

        // Get canvas bounding box
        const canvasBox = await canvas.boundingBox();
        expect(canvasBox).not.toBeNull();

        // Drag from sidebar to canvas
        await sidebar.dragTo(canvas, {
            targetPosition: { x: 200, y: 200 }
        });

        // Check bar appears on canvas (empty state should disappear)
        await expect(page.getByText('Drag bars here to start')).not.toBeVisible();
    });

    test('toolbar shows selected count', async ({ page }) => {
        // Check initial selected count
        await expect(page.getByText('Selected: 0')).toBeVisible();
    });

    test('toolbar buttons exist', async ({ page }) => {
        // Check operation buttons exist
        await expect(page.getByRole('button', { name: /Join/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Split ½/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Split ⅓/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Clone/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Delete/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Undo/i })).toBeVisible();
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
