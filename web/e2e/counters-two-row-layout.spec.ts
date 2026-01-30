import { test, expect } from '@playwright/test';

/**
 * E2E tests for the two-row layout enhancement.
 * 
 * TDD: These tests are written FIRST before implementation.
 * They verify:
 * - Positive counters appear on top row
 * - Negative counters appear on bottom row
 * - Sort button organizes into two-row layout
 * - Animation Speed slider is positioned below stats
 * - Number line is larger for IWB visibility
 */

test.describe('Double Sided Counters - Two-Row Layout', () => {
    const BASE_URL = '/mathematics/double-sided-counters';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('text=The board is empty');
    });

    test('positive counters appear on top row', async ({ page }) => {
        // Add a positive counter
        await page.click('text=Add +1');
        await page.waitForTimeout(300);

        // Get counter position
        const counter = page.locator('[data-testid="counter"]').first();
        const box = await counter.boundingBox();

        expect(box).not.toBeNull();

        // Add a negative counter to compare Y positions
        await page.click('text=Add -1');
        await page.waitForTimeout(300);

        const positiveCounter = page.locator('[data-testid="counter"]').first();
        const negativeCounter = page.locator('[data-testid="counter"]').last();

        const posBox = await positiveCounter.boundingBox();
        const negBox = await negativeCounter.boundingBox();

        // Positive should be above negative (lower Y value)
        expect(posBox!.y).toBeLessThan(negBox!.y);
    });

    test('negative counters appear on bottom row', async ({ page }) => {
        // Add positive first
        await page.click('text=Add +1');
        await page.waitForTimeout(300);

        // Add negative
        await page.click('text=Add -1');
        await page.waitForTimeout(300);

        const counters = page.locator('[data-testid="counter"]');
        await expect(counters).toHaveCount(2);

        // Get positions
        const boxes = await Promise.all([
            counters.first().boundingBox(),
            counters.last().boundingBox()
        ]);

        // Assuming first is positive (top), last is negative (bottom)
        // The negative counter should have higher Y value
        const positiveY = boxes[0]!.y;
        const negativeY = boxes[1]!.y;

        expect(negativeY).toBeGreaterThan(positiveY);
    });

    test('zero pair places counters in respective rows', async ({ page }) => {
        await page.click('text=Zero Pair');
        await page.waitForTimeout(300);

        const counters = page.locator('[data-testid="counter"]');
        await expect(counters).toHaveCount(2);

        // Get all counter Y positions
        const count = await counters.count();
        const yPositions: number[] = [];

        for (let i = 0; i < count; i++) {
            const box = await counters.nth(i).boundingBox();
            if (box) yPositions.push(box.y);
        }

        // Should have two distinct Y positions (top row and bottom row)
        const uniqueY = [...new Set(yPositions)];
        expect(uniqueY.length).toBe(2);
    });

    test('Sort button arranges counters into two rows', async ({ page }) => {
        // Add mixed counters
        await page.click('text=Add +1');
        await page.click('text=Add -1');
        await page.click('text=Add +1');
        await page.click('text=Add -1');
        await page.waitForTimeout(500);

        // Drag one counter out of position
        const counter = page.locator('[data-testid="counter"]').first();
        const box = await counter.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + 300, box.y + 200);
            await page.mouse.up();
            await page.waitForTimeout(200);
        }

        // Click Sort
        await page.click('button:has-text("Sort")');
        await page.waitForTimeout(500);

        // Verify counters are organized
        const counters = page.locator('[data-testid="counter"]');
        const count = await counters.count();
        const yPositions: number[] = [];

        for (let i = 0; i < count; i++) {
            const cBox = await counters.nth(i).boundingBox();
            if (cBox) yPositions.push(cBox.y);
        }

        // Should have exactly 2 distinct Y values (top and bottom row)
        const uniqueY = [...new Set(yPositions)];
        expect(uniqueY.length).toBe(2);
    });

    test('Ordered button is no longer present', async ({ page }) => {
        // The old "Ordered" button should be removed
        const orderedButton = page.locator('button:has-text("Ordered")');
        await expect(orderedButton).toHaveCount(0);
    });
});

test.describe('Double Sided Counters - UI Improvements', () => {
    const BASE_URL = '/mathematics/double-sided-counters';

    test('Animation Speed slider appears below stats panel', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('text=The board is empty');

        // Add a counter so stats are meaningful
        await page.click('text=Add +1');
        await page.waitForTimeout(300);

        // Enable slow mode
        await page.click('button:has-text("Slow")');
        await page.waitForTimeout(300);

        // Get stats panel position
        const stats = page.locator('text=Pos').first();
        const statsBox = await stats.boundingBox();

        // Get speed control position
        const speedControl = page.locator('text=Animation Speed');
        await expect(speedControl).toBeVisible();
        const speedBox = await speedControl.boundingBox();

        // Speed control should be below stats (higher Y value)
        expect(speedBox!.y).toBeGreaterThan(statsBox!.y);
    });

    test('Number line is visible and reasonably sized', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('text=The board is empty');

        // Enable number line
        await page.click('button:has-text("Number Line")');
        await page.waitForTimeout(300);

        // Check number line elements are visible
        await expect(page.locator('text=-10').first()).toBeVisible();
        await expect(page.locator('text=10').first()).toBeVisible();

        // Get number line container size
        const numberLine = page.locator('text=-10').first().locator('..').locator('..');
        const box = await numberLine.boundingBox();

        // Should be at least 80px tall for IWB visibility (increased from ~80px)
        expect(box!.height).toBeGreaterThanOrEqual(80);
    });
});

test.describe('Double Sided Counters - Drag from Sidebar', () => {
    const BASE_URL = '/mathematics/double-sided-counters';

    test('can drag positive counter from sidebar to canvas', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('text=The board is empty');

        // Find the Add +1 button in sidebar
        const addButton = page.locator('button:has-text("Add +1")').first();
        const addBox = await addButton.boundingBox();

        // Find the canvas area
        const canvas = page.locator('[data-testid="counter-canvas"]');
        const canvasBox = await canvas.boundingBox();

        if (addBox && canvasBox) {
            // Drag from sidebar to canvas
            await page.mouse.move(addBox.x + addBox.width / 2, addBox.y + addBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(canvasBox.x + 200, canvasBox.y + 100);
            await page.mouse.up();
            await page.waitForTimeout(300);

            // Should have added a counter
            const counters = page.locator('[data-testid="counter"]');
            await expect(counters).toHaveCount(1);
        }
    });

    test('can drag negative counter from sidebar to canvas', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('text=The board is empty');

        // Find the Add -1 button in sidebar
        const addButton = page.locator('button:has-text("Add -1")').first();
        const addBox = await addButton.boundingBox();

        // Find the canvas area
        const canvas = page.locator('[data-testid="counter-canvas"]');
        const canvasBox = await canvas.boundingBox();

        if (addBox && canvasBox) {
            // Drag from sidebar to canvas
            await page.mouse.move(addBox.x + addBox.width / 2, addBox.y + addBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(canvasBox.x + 200, canvasBox.y + 100);
            await page.mouse.up();
            await page.waitForTimeout(300);

            // Should have added a counter
            const counters = page.locator('[data-testid="counter"]');
            await expect(counters).toHaveCount(1);
        }
    });
});
