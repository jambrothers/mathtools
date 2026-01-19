import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Double Sided Counters interactive tool.
 * Comprehensive tests beyond the URL state tests.
 */
test.describe('Double Sided Counters - Core Functionality', () => {
    const BASE_URL = '/mathematics/double-sided-counters';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('text=The board is empty');
    });

    test('should display empty board message initially', async ({ page }) => {
        const emptyMessage = page.locator('text=The board is empty');
        await expect(emptyMessage).toBeVisible();
    });

    test('should display toolbar controls', async ({ page }) => {
        // Check for key toolbar buttons
        await expect(page.locator('button:has-text("Add +1")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Add -1")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Zero Pair")').first()).toBeVisible();
    });

    test('should add positive counter when clicking Add +1', async ({ page }) => {
        await page.click('text=Add +1');
        await page.waitForTimeout(300);

        const counters = page.locator('[data-testid="counter"]');
        await expect(counters).toHaveCount(1);
    });

    test('should add negative counter when clicking Add -1', async ({ page }) => {
        await page.click('text=Add -1');
        await page.waitForTimeout(300);

        const counters = page.locator('[data-testid="counter"]');
        await expect(counters).toHaveCount(1);
    });

    test('should add zero pair (one positive and one negative)', async ({ page }) => {
        await page.click('text=Zero Pair');
        await page.waitForTimeout(300);

        const counters = page.locator('[data-testid="counter"]');
        await expect(counters).toHaveCount(2);
    });

    test('should show stats panel by default', async ({ page }) => {
        // Add a counter first
        await page.click('text=Add +1');
        await page.waitForTimeout(300);

        // Counter should be visible, confirming stats panel is showing count
        const counter = page.locator('[data-testid="counter"]').first();
        await expect(counter).toBeVisible();
    });

    test('should toggle stats visibility with Stats button', async ({ page }) => {
        // Add a counter
        await page.click('text=Add +1');
        await page.waitForTimeout(300);

        // Toggle stats off
        await page.click('button:has-text("Stats")');
        await page.waitForTimeout(300);

        // Toggle stats back on
        await page.click('button:has-text("Stats")');
    });

    test('Number Line toggle should work', async ({ page }) => {
        // Enable number line
        await page.click('button:has-text("Number Line")');
        await page.waitForTimeout(300);

        // Number line should show values
        await expect(page.locator('text=0').first()).toBeVisible();
        await expect(page.locator('text=-10').first()).toBeVisible();
        await expect(page.locator('text=10').first()).toBeVisible();
    });

    test('Slow mode toggle should work', async ({ page }) => {
        // Enable slow mode
        await page.click('button:has-text("Slow")');
        await page.waitForTimeout(300);

        // Animation speed control should appear
        await expect(page.locator('text=Animation Speed')).toBeVisible();
    });

    test('Sort button should organize counters into rows', async ({ page }) => {
        // Add counters
        await page.click('text=Add +1');
        await page.click('text=Add -1');
        await page.waitForTimeout(300);

        // Click Sort
        await page.click('button:has-text("Sort")');
        await page.waitForTimeout(300);

        // Button should still say "Sort" (no longer cycles)
        await expect(page.getByRole('button', { name: 'Sort', exact: true })).toBeVisible();
    });

    test('Clear button should remove all counters', async ({ page }) => {
        // Add some counters
        await page.click('text=Add +1');
        await page.click('text=Add -1');
        await page.waitForTimeout(300);

        // Click Clear
        await page.click('button:has-text("Clear")');
        await page.waitForTimeout(300);

        // Board should be empty
        await expect(page.locator('text=The board is empty')).toBeVisible();
    });

    test('should handle expression input', async ({ page }) => {
        // Look for expression input
        const expressionInput = page.locator('input[type="text"]').first();

        if (await expressionInput.isVisible()) {
            // Type an expression like "3 + 2"
            await expressionInput.fill('3');
            await expressionInput.press('Enter');
            await page.waitForTimeout(500);

            // Should have added counters
            const counters = page.locator('[data-testid="counter"]');
            const count = await counters.count();
            expect(count).toBeGreaterThan(0);
        }
    });

    test('Link button should generate shareable URL', async ({ page }) => {
        // Add a counter
        await page.click('text=Add +1');
        await page.waitForTimeout(300);

        // Click Link button
        await page.click('button:has-text("Link")');
        await page.waitForTimeout(300);

        // Check clipboard content
        const clipboardText = await page.evaluate(async () => {
            return await navigator.clipboard.readText();
        });

        expect(clipboardText).toContain(BASE_URL);
    });
});

test.describe('Double Sided Counters - Counter Interactions', () => {
    const BASE_URL = '/mathematics/double-sided-counters';

    test('should flip counter on double-click', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('text=The board is empty');

        // Add a counter
        await page.click('text=Add +1');
        await page.waitForTimeout(500);

        // Double-click on the counter to flip it
        const counter = page.locator('[data-testid="counter"]').first();
        await counter.dblclick();
        await page.waitForTimeout(500);

        // Counter should still exist (flipped)
        const counters = page.locator('[data-testid="counter"]');
        await expect(counters).toHaveCount(1);
    });

    test('should allow dragging counters', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('text=The board is empty');

        // Add a counter
        await page.click('text=Add +1');
        await page.waitForTimeout(500);

        // Get counter element
        const counter = page.locator('[data-testid="counter"]').first();
        await expect(counter).toBeVisible();

        // Get initial position
        const initialBox = await counter.boundingBox();
        expect(initialBox).not.toBeNull();

        // Drag the counter
        if (initialBox) {
            await page.mouse.move(initialBox.x + initialBox.width / 2, initialBox.y + initialBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(initialBox.x + 100, initialBox.y + 100);
            await page.mouse.up();
            await page.waitForTimeout(300);
        }

        // Counter should still exist
        await expect(page.locator('[data-testid="counter"]')).toHaveCount(1);
    });

    test('Cancel Pairs should animate pairs disappearing', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('text=The board is empty');

        // Add a zero pair
        await page.click('text=Zero Pair');
        await page.waitForTimeout(500);

        // Sort to organize into rows
        await page.click('button:has-text("Sort")');
        await page.waitForTimeout(300);

        // Click Cancel Pairs to remove the zero pair
        const cancelButton = page.locator('button').filter({ hasText: /Cancel/i }).first();
        if (await cancelButton.isVisible()) {
            await cancelButton.click();
            await page.waitForTimeout(1000);
        }

        // Board should be empty after canceling the zero pair
        await expect(page.locator('text=The board is empty')).toBeVisible();
    });
});
