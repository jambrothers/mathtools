
import { test, expect } from '@playwright/test';

test.describe('Algebra Tiles - Drag Interaction', () => {
    const BASE_URL = '/mathematics/algebra-tiles';

    test('should add tile when dragging from sidebar to canvas', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Locate a tile in the sidebar (e.g., '1')
        const sidebarTile = page.locator('aside button[title*="+1 tile"]').first();
        await page.waitForSelector('[data-testid="canvas"]');
        const canvas = page.locator('[data-testid="canvas"]').first();

        // Ensure both are visible
        await expect(sidebarTile).toBeVisible();
        await expect(canvas).toBeVisible();

        // Get initial tile count
        const initialCount = await page.locator('[data-testid="tile"]').count();

        // Perform drag and drop
        // We drag to a specific offset on the canvas to ensure it drops on the droppable area
        const canvasBox = await canvas.boundingBox();
        if (canvasBox) {
            await sidebarTile.hover();
            await page.mouse.down();
            // Move to canvas center + some offset
            await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2, { steps: 10 });
            await page.mouse.up();
        }

        // Wait for state update
        await page.waitForTimeout(500);

        // Verify tile count increased
        const newCount = await page.locator('[data-testid="tile"]').count();
        expect(newCount).toBeGreaterThan(initialCount);
    });
});
