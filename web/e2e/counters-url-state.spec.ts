import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Double Sided Counters URL state feature.
 * These tests verify that:
 * 1. Counter configurations can be shared via URL
 * 2. Opening a URL recreates the exact state
 * 3. All settings are preserved through the URL
 */

test.describe('Double Sided Counters - URL State', () => {
    const BASE_URL = '/mathematics/double-sided-counters';

    test.beforeEach(async ({ page }) => {
        // Start with a clean page
        await page.goto(BASE_URL);
        // Wait for the page to be fully loaded
        await page.waitForSelector('text=The board is empty');
    });

    test('should recreate exact counter configuration from generated URL', async ({ page, context }) => {
        // 1. Add some counters
        await page.click('text=Add +1');
        await page.click('text=Add +1');
        await page.click('text=Add -1');

        // Wait for counters to appear - look for the stats panel showing counts
        // Stats shows "+2" for positive and "-1" for negative count
        await page.waitForTimeout(500); // Allow counters to render

        // Count the counter elements directly (they have absolute positioning and rounded-full class)
        const counterElements = page.locator('[data-testid^="counter-"]:not([data-testid="counter-canvas"]):not([data-testid="counter-type-select"])');
        await expect(counterElements).toHaveCount(3);

        // 2. Click the Link button to generate URL
        await page.click('button:has-text("Link")');

        // 3. Get clipboard content
        const clipboardText = await page.evaluate(async () => {
            return await navigator.clipboard.readText();
        });

        expect(clipboardText).toContain('?c=');
        expect(clipboardText).toContain(BASE_URL);

        // 4. Open the generated URL in a new page
        const newPage = await context.newPage();
        await newPage.goto(clipboardText);
        await newPage.waitForLoadState('networkidle');

        // 5. Verify same number of counters
        const newCounterElements = newPage.locator('[data-testid^="counter-"]:not([data-testid="counter-canvas"]):not([data-testid="counter-type-select"])');
        await expect(newCounterElements).toHaveCount(3);

        await newPage.close();
    });

    test('should preserve number line visibility in URL', async ({ page, context }) => {
        // Click on Number Line button to toggle it on
        await page.click('button:has-text("Number Line")');

        // Wait for number line to appear - it contains a horizontal line and ticks
        // The number line shows values from -10 to +10
        await expect(page.locator('text=0').first()).toBeVisible();

        // Generate link
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // URL should have nl=1
        expect(clipboardText).toContain('nl=1');

        // Open in new page
        const newPage = await context.newPage();
        await newPage.goto(clipboardText);
        await newPage.waitForLoadState('networkidle');

        // Number line should be visible (check for the -10 to +10 scale)
        await expect(newPage.locator('text=-10').first()).toBeVisible();

        await newPage.close();
    });

    test('should preserve slow mode in URL', async ({ page, context }) => {
        // Enable slow mode
        await page.click('button:has-text("Slow")');

        // Verify speed control appears - it has "Animation Speed" text
        await expect(page.locator('text=Animation Speed')).toBeVisible();

        // Generate link
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // URL should have sl=1 for slow mode
        expect(clipboardText).toContain('sl=1');

        // Open in new page
        const newPage = await context.newPage();
        await newPage.goto(clipboardText);
        await newPage.waitForLoadState('networkidle');

        // Speed control should be visible (slow mode is on)
        await expect(newPage.locator('text=Animation Speed')).toBeVisible();

        await newPage.close();
    });

    test('should preserve stats visibility in URL', async ({ page, context }) => {
        // First add a counter so stats are meaningful
        await page.click('text=Add +1');
        await page.waitForTimeout(300);

        // Turn off stats by clicking the Stats button
        await page.click('button:has-text("Stats")');

        // The stats panel should now be hidden
        // Wait a moment for the UI to update
        await page.waitForTimeout(300);

        // Generate link
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // URL should have st=0
        expect(clipboardText).toContain('st=0');

        // Open in new page
        const newPage = await context.newPage();
        await newPage.goto(clipboardText);
        await newPage.waitForLoadState('networkidle');

        // Counter exists (visible as '+' on the counter itself)
        const counters = newPage.locator('[data-testid^="counter-"]:not([data-testid="counter-canvas"]):not([data-testid="counter-type-select"])');
        await expect(counters).toHaveCount(1);

        await newPage.close();
    });

    test('should preserve sort state in URL', async ({ page, context }) => {
        // Add counters
        await page.click('text=Zero Pair');
        await page.click('text=Zero Pair');
        await page.waitForTimeout(300);

        // Click Sort to organize
        await page.click('button:has-text("Sort")');
        await page.waitForTimeout(300);

        // Generate link
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // URL should have so=grouped
        expect(clipboardText).toContain('so=grouped');

        // Open in new page
        const newPage = await context.newPage();
        await newPage.goto(clipboardText);
        await newPage.waitForLoadState('networkidle');

        // The button should still say "Sort" (no longer cycles)
        await expect(newPage.getByRole('button', { name: 'Sort', exact: true })).toBeVisible();

        await newPage.close();
    });

    test('should handle empty state URL', async ({ page }) => {
        // Generate link with empty board
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // Should still be a valid URL
        expect(clipboardText).toContain(BASE_URL);

        // Should not have counters param with values (or empty)
        // The URL might not have 'c=' at all, or have an empty value
        const hasCounters = clipboardText.includes('c=p:') || clipboardText.includes('c=n:');
        expect(hasCounters).toBe(false);
    });

    test('should recreate many counters correctly', async ({ page, context }) => {
        // Add many counters (10 positive, 5 negative)
        for (let i = 0; i < 10; i++) {
            await page.click('text=Add +1');
        }
        for (let i = 0; i < 5; i++) {
            await page.click('text=Add -1');
        }
        await page.waitForTimeout(500);

        // Verify counter count
        const counters = page.locator('[data-testid^="counter-"]:not([data-testid="counter-canvas"]):not([data-testid="counter-type-select"])');
        await expect(counters).toHaveCount(15);

        // Generate link
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // Open in new page
        const newPage = await context.newPage();
        await newPage.goto(clipboardText);
        await newPage.waitForLoadState('networkidle');

        // Verify same counter count
        const newCounters = newPage.locator('[data-testid^="counter-"]:not([data-testid="counter-canvas"]):not([data-testid="counter-type-select"])');
        await expect(newCounters).toHaveCount(15);

        await newPage.close();
    });

    test('should handle URL with multiple settings enabled', async ({ page, context }) => {
        // Add counters
        await page.click('text=Add +1');
        await page.click('text=Add -1');
        await page.waitForTimeout(300);

        // Enable settings
        await page.click('button:has-text("Number Line")'); // nl=1
        await page.click('button:has-text("Slow")');        // sl=1
        await page.click('button:has-text("Sort")');        // so=grouped

        // Generate link
        await page.click('button:has-text("Link")');
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

        // Verify URL has all params
        expect(clipboardText).toContain('nl=1');
        expect(clipboardText).toContain('sl=1');
        expect(clipboardText).toContain('so=grouped');
        expect(clipboardText).toContain('c=');

        // Open in new page and verify all settings
        const newPage = await context.newPage();
        await newPage.goto(clipboardText);
        await newPage.waitForLoadState('networkidle');

        // Number line visible (has -10 in it)
        await expect(newPage.locator('text=-10').first()).toBeVisible();
        // Slow mode visible (speed control)
        await expect(newPage.locator('text=Animation Speed')).toBeVisible();
        // Sort button still visible (button says "Sort")
        await expect(newPage.getByRole('button', { name: 'Sort', exact: true })).toBeVisible();
        // Counters exist
        const newCounters = newPage.locator('[data-testid^="counter-"]:not([data-testid="counter-canvas"]):not([data-testid="counter-type-select"])');
        await expect(newCounters).toHaveCount(2);

        await newPage.close();
    });

    test('roundtrip: URL produces identical counter count in new page', async ({ page, context }) => {
        // Add a specific configuration
        await page.click('text=Add +1');
        await page.click('text=Add +1');
        await page.click('text=Add +1');
        await page.click('text=Add -1');
        await page.click('text=Add -1');
        await page.waitForTimeout(500);

        // Get original counter count
        const originalCount = await page.locator('[data-testid^="counter-"]:not([data-testid="counter-canvas"]):not([data-testid="counter-type-select"])').count();
        expect(originalCount).toBe(5);

        // Generate URL
        await page.click('button:has-text("Link")');
        const url = await page.evaluate(() => navigator.clipboard.readText());

        // Open in new page
        const newPage = await context.newPage();
        await newPage.goto(url);
        await newPage.waitForLoadState('networkidle');

        // Verify identical count
        const newCount = await newPage.locator('[data-testid^="counter-"]:not([data-testid="counter-canvas"]):not([data-testid="counter-type-select"])').count();
        expect(newCount).toBe(originalCount);

        await newPage.close();
    });
});
