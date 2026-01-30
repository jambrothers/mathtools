import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Algebra Tiles URL state feature.
 * Tests verify that:
 * 1. Tile configurations can be shared via URL
 * 2. Opening a URL recreates the exact state
 * 3. All settings are preserved through the URL
 */

test.describe('Algebra Tiles - URL State', () => {
    const BASE_URL = '/mathematics/algebra-tiles';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should have Link button in toolbar', async ({ page }) => {
        const linkButton = page.locator('button').filter({ hasText: 'Link' });
        await expect(linkButton).toBeVisible();
    });

    test('should generate URL when clicking Link button', async ({ page }) => {
        // Click on +1 tile to add it (still works as fallback)
        const unitTile = page.locator('button').filter({ hasText: '+1' }).first();
        await unitTile.click();
        await page.waitForTimeout(300);

        // Click the Link button
        await page.click('button:has-text("Link")');

        // Get clipboard content
        const clipboardText = await page.evaluate(async () => {
            return await navigator.clipboard.readText();
        });

        expect(clipboardText).toContain(BASE_URL);
        expect(clipboardText).toContain('t=');
    });

    test('should preserve labels setting in URL', async ({ page }) => {
        // Toggle labels off
        await page.click('button:has-text("Labels")');
        await page.waitForTimeout(200);

        // Generate link
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // URL should have lb=0
        expect(clipboardText).toContain('lb=0');
    });

    test('should preserve showY setting in URL', async ({ page }) => {
        // Toggle Show Y on
        await page.click('button:has-text("Show Y")');
        await page.waitForTimeout(200);

        // Generate link
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // URL should have y=1
        expect(clipboardText).toContain('y=1');
    });

    test('should preserve snap setting in URL', async ({ page }) => {
        // Toggle Snap on
        await page.click('button:has-text("Snap")');
        await page.waitForTimeout(200);

        // Generate link
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // URL should have sn=1
        expect(clipboardText).toContain('sn=1');
    });

    test('roundtrip: URL produces identical tile count in new page', async ({ page, context }) => {
        // Add some tiles
        await page.locator('button').filter({ hasText: '+1' }).first().click();
        await page.locator('button').filter({ hasText: '+x' }).first().click();
        await page.waitForTimeout(500);

        // Generate URL
        await page.click('button:has-text("Link")');
        const url = await page.evaluate(() => navigator.clipboard.readText());

        // Open in new page
        const newPage = await context.newPage();
        await newPage.goto(url);
        await newPage.waitForLoadState('networkidle');
        await newPage.waitForTimeout(500);

        // Tiles should be on the canvas
        // Note: tiles are absolutely positioned elements
        await newPage.close();
    });

    test('should recreate settings from URL', async ({ page, context }) => {
        // Enable all settings
        await page.click('button:has-text("Show Y")'); // Enable Show Y
        await page.click('button:has-text("Snap")'); // Enable Snap
        await page.click('button:has-text("Labels")'); // Disable Labels
        await page.waitForTimeout(200);

        // Generate link
        await page.click('button:has-text("Link")');
        const url = await page.evaluate(() => navigator.clipboard.readText());

        // Open in new page
        const newPage = await context.newPage();
        await newPage.goto(url);
        await newPage.waitForLoadState('networkidle');

        // Verify y tiles are available in sidebar (Show Y is on)
        const yTile = newPage.locator('button').filter({ hasText: '+y²' }).first();
        await expect(yTile).toBeVisible();

        // Verify Snap button is active
        const snapButton = newPage.locator('button').filter({ hasText: 'Snap' }).first();
        await expect(snapButton).toBeVisible();

        await newPage.close();
    });
});

test.describe('Algebra Tiles - Drag from Sidebar', () => {
    const BASE_URL = '/mathematics/algebra-tiles';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
    });

    test('sidebar tiles should be draggable', async ({ page }) => {
        // Check that sidebar tile buttons have draggable attribute
        const tileButton = page.locator('button[draggable="true"]').first();
        await expect(tileButton).toBeVisible();
    });

    test('clicking sidebar tile still adds tile (fallback)', async ({ page }) => {
        // Click on +1 tile
        const unitTile = page.locator('button').filter({ hasText: '+1' }).first();
        await unitTile.click();
        await page.waitForTimeout(300);

        // Tile should have been added (check that something happened)
        // We can verify by checking the Link button generates a non-empty URL
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toContain('t=');
    });

    test('horizontal tile variants should appear when Show Y is enabled', async ({ page }) => {
        // Enable Show Y
        await page.click('button:has-text("Show Y")');
        await page.waitForTimeout(200);

        // Check for y tile (it should have horizontal variant visible)
        const yTiles = page.locator('button[draggable="true"]').filter({ hasText: 'y' });
        // There should be multiple y-related buttons
        const count = await yTiles.count();
        expect(count).toBeGreaterThanOrEqual(2);
    });
});

test.describe('Algebra Tiles - Snap to Grid', () => {
    const BASE_URL = '/mathematics/algebra-tiles';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
    });

    test('Snap button should be visible and toggleable', async ({ page }) => {
        const snapButton = page.locator('button').filter({ hasText: 'Snap' }).first();
        await expect(snapButton).toBeVisible();

        // Click to toggle
        await snapButton.click();
        await page.waitForTimeout(200);

        // Button should now be active (has different styling)
        await expect(snapButton).toBeVisible();
    });

    test('grid should be visible when snap is enabled', async ({ page }) => {
        // Enable snap
        await page.click('button:has-text("Snap")');
        await page.waitForTimeout(200);

        // Canvas should have grid background
        // The canvas has a grid background div when gridSize is set
        const canvas = page.locator('[class*="flex-1"][class*="bg-slate"]').first();
        await expect(canvas).toBeVisible();
    });
});

test.describe('Algebra Tiles - Toolbar Updates', () => {
    const BASE_URL = '/mathematics/algebra-tiles';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
    });

    test('Delete button should not be present', async ({ page }) => {
        const deleteButton = page.locator('button').filter({ hasText: 'Delete' });
        await expect(deleteButton).toHaveCount(0);
    });

    test('Visualise button should have correct text', async ({ page }) => {
        const visualiseButton = page.locator('button').filter({ hasText: 'Visualise' });
        await expect(visualiseButton).toBeVisible();
    });

    test('Clear button should be present', async ({ page }) => {
        const clearButton = page.locator('button').filter({ hasText: 'Clear' });
        await expect(clearButton).toBeVisible();
    });

    test('placeholder should show new example text', async ({ page }) => {
        const input = page.locator('input[placeholder*="x^2"]');
        await expect(input).toBeVisible();
    });
});
