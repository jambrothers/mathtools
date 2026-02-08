
import { test, expect } from '@playwright/test';

test.describe('Algebra Tiles - Drag Interaction', () => {
    const BASE_URL = '/mathematics/algebra-tiles';

    test('should add tile when dragging from sidebar to canvas', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Locate a tile in the sidebar (e.g., '1')
        const sidebarTile = page.locator('aside button').filter({ hasText: '1' }).first();
        const canvas = page.locator('div[class*="canvas"]').first();

        // Ensure both are visible
        await expect(sidebarTile).toBeVisible();
        await expect(canvas).toBeVisible();

        // Get initial tile count
        const initialCount = await page.locator('[data-testid="tile"]').count();

        // Perform drag and drop
        await sidebarTile.dragTo(canvas, { force: true });

        // Wait for state update
        await page.waitForTimeout(500);

        // Verify tile count increased
        const newCount = await page.locator('[data-testid="tile"]').count();
        expect(newCount).toBe(initialCount + 1);
    });
});
