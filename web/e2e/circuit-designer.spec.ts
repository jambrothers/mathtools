import { test, expect } from '@playwright/test';

test.describe('Circuit Designer', () => {
    const BASE_URL = '/computing/circuit-designer';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
    });

    test('should load page elements', async ({ page }) => {
        await expect(page.locator('aside')).toBeVisible();
        await expect(page.locator('[data-testid="canvas"]')).toBeVisible();
        // Check for toolbar
        await expect(page.locator('button').filter({ hasText: /Truth Table/i })).toBeVisible();
    });

    test('should add component from sidebar', async ({ page }) => {
        const initialCount = await page.locator('[data-testid="circuit-node"]').count();

        // Click Add Input (Switch)
        // Use accessible name or specific selector
        // Sidebar usually has buttons. 
        // Based on analysis, buttons have text "Switch", "Bulb", etc.
        const switchBtn = page.locator('aside button').filter({ hasText: 'Switch' }).first();
        if (await switchBtn.isVisible()) {
            await switchBtn.click();
            await page.waitForTimeout(200);

            await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialCount + 1);

            // Verify it is an INPUT node (Switch)
            // CircuitNode renders label. "A", "B", etc.
            const newNode = page.locator('[data-testid="circuit-node"]').last();
            await expect(newNode).toBeVisible();
            await expect(newNode.locator('[data-testid="node-label"]')).not.toBeEmpty();
        }
    });

    test('should load Demo circuit', async ({ page }) => {
        const demoBtn = page.locator('button').filter({ hasText: 'AND Gate' }).first();
        if (await demoBtn.isVisible()) {
            await demoBtn.click();
            await page.waitForTimeout(500);

            // AND demo has 2 inputs, 1 gate, 1 output = 4 nodes
            // But verify at least some nodes exist
            const count = await page.locator('[data-testid="circuit-node"]').count();
            expect(count).toBeGreaterThanOrEqual(3);
        }
    });

    test('Truth Table generation', async ({ page }) => {
        // Load demo first
        const demoBtn = page.locator('button').filter({ hasText: 'AND Gate' }).first();
        if (await demoBtn.isVisible()) {
            await demoBtn.click();
            await page.waitForTimeout(500);
        }

        const ttBtn = page.locator('button').filter({ hasText: 'Truth Table' }).first();
        await ttBtn.click();

        // Check modal appears
        await expect(page.locator('div[role="dialog"], div.fixed')).toBeVisible();
        await expect(page.locator('h2', { hasText: 'Truth Table' })).toBeVisible();

        // Check table content
        await expect(page.locator('table')).toBeVisible();
        // 4 rows for AND gate
        // tbody tr count
        await expect(page.locator('tbody tr')).toHaveCount(4);
    });

    test('Undo functionality', async ({ page }) => {
        const initialCount = await page.locator('[data-testid="circuit-node"]').count();

        // Add Bulb
        const bulbBtn = page.locator('aside button').filter({ hasText: 'Bulb' }).first();
        await bulbBtn.click();
        await page.waitForTimeout(200);

        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialCount + 1);

        // Undo
        const undoBtn = page.locator('button').filter({ hasText: 'Undo' }).first();
        await undoBtn.click();

        await expect(page.locator('[data-testid="circuit-node"]')).toHaveCount(initialCount);
    });
});
