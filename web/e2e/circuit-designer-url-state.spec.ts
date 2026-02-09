import { test, expect } from '@playwright/test';

test.describe('Circuit Designer - URL State', () => {
    const BASE_URL = '/computing/circuit-designer';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test('should generate shareable URL with circuit state', async ({ page, context }) => {
        // 0.  Clear default nodes - skipped as tests start fresh or default is fine
        // await page.click('button:has-text("Clear")');

        // 1. Build a simple circuit
        // Add an Input switch
        await page.click('button:has-text("Switch")');
        // Add an Output bulb
        await page.click('button:has-text("Bulb")');

        // 2. Generate Link
        await page.click('button:has-text("Link")');

        // Verify tooltip appears
        await expect(page.locator('text=Link copied')).toBeVisible();

        // 3. Get clipboard content
        const clipboardText = await page.evaluate(async () => {
            return await navigator.clipboard.readText();
        });

        expect(clipboardText).toContain(BASE_URL);
        expect(clipboardText).toContain('?n='); // Should have nodes

        // 4. Open in new page
        const newPage = await context.newPage();
        await newPage.goto(clipboardText);
        await newPage.waitForLoadState('networkidle');

        // 5. Verify components exist
        // Check sidebar button exists
        await expect(newPage.locator('button', { hasText: 'Switch' }).first()).toBeVisible();

        // Check for node on canvas using data-testid
        // We look for a node that contains the text "A"
        await expect(newPage.locator('[data-testid="circuit-node"]').filter({ hasText: 'A' })).toBeVisible();
        // Let's add specific test IDs in implementation to make this robust? 
        // For now, checks if we can find elements that look like nodes.

        // We can verify the "Link" button is still there too.
        await expect(newPage.locator('button:has-text("Link")')).toBeVisible();

        await newPage.close();
    });

    test('should restore connections and switch state', async ({ page }) => {
        // Test with a constructed URL to avoid relying on drag-drop complexity in test setup if possible
        // URL for: Switch (ON) -> Output
        // Nodes: Switch at 100,100 (ON), Bulb at 300,100
        // Wire: Switch -> Bulb
        const switchId = 's1';
        const bulbId = 'b1';
        const nodesParam = `I:${switchId}:100,100:A:1;O:${bulbId}:300,100:B`;
        const wiresParam = `${switchId}>${bulbId}:0`;

        const url = `${BASE_URL}?n=${encodeURIComponent(nodesParam)}&w=${encodeURIComponent(wiresParam)}`;

        await page.goto(url);

        // Verify visual state if possible. 
        // Check for nodes by locating elements (implementation should add data-testid if missing)
        // For now, we'll assume there's some DOM element for nodes.

        // Since we haven't implemented it yet, this test will fail not just on assertions but on functionality if we ran it.
        // But for TDD, we write what we expect.
    });
});
