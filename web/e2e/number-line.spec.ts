import { test, expect } from '@playwright/test';

test.describe('Number Line Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/mathematics/number-line');
    });

    test('should render the number line with default ticks', async ({ page }) => {
        const svg = page.getByTestId('number-line-svg');
        await expect(svg).toBeVisible();
        await expect(svg.getByText('-10', { exact: true })).toBeVisible();
        await expect(svg.getByText('0', { exact: true })).toBeVisible();
        await expect(svg.getByText('10', { exact: true })).toBeVisible();
    });

    test('should add and drag points', async ({ page }) => {
        // Disable snapping to ensure points land where put
        await page.locator('label').filter({ hasText: 'Snap to Ticks' }).click();

        await page.getByTestId('add-point-input').fill('5');
        await page.getByTestId('add-point-button').click();

        const svg = page.getByTestId('number-line-svg');
        await expect(svg.getByTestId(/^point-p-/).first()).toBeVisible();
        // Point gets auto-labeled 'A', so text is 'A (5)'
        await expect(svg.getByText('A (5)')).toBeVisible();
    });

    test('should hide and reveal values', async ({ page }) => {
        // Disable snapping
        await page.locator('label').filter({ hasText: 'Snap to Ticks' }).click();

        await page.getByTestId('add-point-input').fill('7');
        await page.getByTestId('add-point-button').click();

        // Toggle hide values
        await page.locator('label').filter({ hasText: 'Hide Point Values' }).click();

        const svg = page.getByTestId('number-line-svg');
        // Value 7 should be hidden, but label 'A' should remain
        await expect(svg.getByText('7', { exact: true })).not.toBeVisible();
        await expect(svg.getByText('A', { exact: true })).toBeVisible();

        // Toggle back
        await page.locator('label').filter({ hasText: 'Hide Point Values' }).click();
        await expect(svg.getByText('A (7)', { exact: true })).toBeVisible();
    });

    test('should zoom and change ticks', async ({ page }) => {
        await page.getByRole('button', { name: '0 to 1', exact: true }).click();

        const svg = page.getByTestId('number-line-svg');
        // Decimal ticks should appear in SVG
        await expect(svg.getByText('0.1', { exact: true })).toBeVisible();
        await expect(svg.getByText('0.5', { exact: true })).toBeVisible();
        await expect(svg.getByText('0.9', { exact: true })).toBeVisible();
    });

    test('should restore state from URL', async ({ page }) => {
        const url = '/mathematics/number-line?min=-2&max=2&points=1,A,red|-1,B,blue&arcs=p-2,p-1,%2B2&labels=1&hide=0&snap=1';
        await page.goto(url);

        const svg = page.getByTestId('number-line-svg');
        await expect(svg.getByText('A (1)', { exact: true })).toBeVisible({ timeout: 10000 });
        await expect(svg.getByText('B (-1)', { exact: true })).toBeVisible();
        await expect(svg.getByText('+2', { exact: true })).toBeVisible();
    });

    test('should create jump arcs interactively', async ({ page }) => {
        // Add two points
        await page.getByTestId('add-point-input').fill('0');
        await page.getByTestId('add-point-button').click();
        await page.getByTestId('add-point-input').fill('10');
        await page.getByTestId('add-point-button').click();

        // Start drawing mode
        await page.getByRole('button', { name: 'Draw Jump Arc' }).click();
        await expect(page.getByText('Click first point to start arc...')).toBeVisible();

        const svg = page.getByTestId('number-line-svg');
        const points = svg.getByTestId(/^point-p-/);

        // Click first point - target the top-most circle
        await points.nth(0).locator('circle').last().click({ force: true });
        await expect(page.getByText('Click second point to finish arc...')).toBeVisible();

        // Click second point
        await points.nth(1).locator('circle').last().click({ force: true });

        // Should create an arc
        await expect(page.getByText('Click first point to start arc...')).toBeVisible();

        // Final check: manual addition should still show one arc
        await expect(page.locator('text=Arc 1:')).toBeVisible();
    });

    test('should auto-label jump arcs with the correct difference', async ({ page }) => {
        // Disable snapping
        await page.locator('label').filter({ hasText: 'Snap to Ticks' }).click();

        // Add two points: 0 and -5
        await page.getByTestId('add-point-input').fill('0');
        await page.getByTestId('add-point-button').click();
        await page.getByTestId('add-point-input').fill('-5');
        await page.getByTestId('add-point-button').click();

        // Create arc from 0 to -5
        await page.getByRole('button', { name: 'Draw Jump Arc' }).click();
        const svg = page.getByTestId('number-line-svg');
        const points = svg.getByTestId(/^point-p-/);

        // Click first point (auto-labeled A) and second (auto-labeled B)
        await points.nth(0).locator('circle').last().click({ force: true });
        await points.nth(1).locator('circle').last().click({ force: true });

        // Check for minus sign − (not hyphen -)
        await expect(svg.getByText('−5', { exact: true })).toBeVisible();
    });

    test('should add points by clicking on the number line in add-point mode', async ({ page }) => {
        // Start add-point mode
        await page.getByRole('button', { name: 'Click to Add Point' }).click();
        await expect(page.getByText('Click on the number line to place points...')).toBeVisible();

        const svg = page.getByTestId('number-line-svg');

        // Targeted via its data-testid for the active hit area
        const hitArea = svg.getByTestId('number-line-hit-area');
        await expect(hitArea).toBeVisible();

        // Click on the hit area at 50% width (0 on -10 to 10 scale)
        // Canvas height is 500, so center is 250.
        await hitArea.click({ position: { x: 500, y: 250 } });

        // Wait a bit for the point to be added
        await page.waitForTimeout(500);

        // Should create a point at 0
        await expect(svg.getByTestId(/^point-p-/).first()).toBeVisible();
        // Point gets auto-labeled 'A', so text is 'A (0)'
        await expect(svg.getByText('A (0)')).toBeVisible();
    });

    test('should support ordering exercises with progressive reveal', async ({ page }) => {
        // 1. Add some points
        await page.click('button:has-text("Click to Add Point")');
        await expect(page.getByText('Finish Adding')).toBeVisible();
        const svg = page.getByTestId('number-line-svg');
        const box = await svg.boundingBox();
        if (!box) throw new Error('Could not find number line bounding box');

        // Buffer wait for interaction mode state to settle
        await page.waitForTimeout(200);

        // Click on the SVG directly at tick-aligned positions
        // Canvas width 1000. 200/1000 = 0.2. Value = -10 + 0.2*20 = -6.
        // 700/1000 = 0.7. Value = -10 + 0.7*20 = 4.
        // Height 500. Center = 250.
        await svg.click({ position: { x: 200, y: 250 } });
        await page.waitForTimeout(100);
        await svg.click({ position: { x: 700, y: 250 } });
        await page.waitForTimeout(100);

        // Verify auto-labels A and B in SVG
        await expect(svg.getByText('A (-6)')).toBeVisible();
        await expect(svg.getByText('B (4)')).toBeVisible();

        // 2. Hide all points
        await page.click('button:has-text("Hide All")');

        // In hidden mode, labels should still be visible in SVG, but values are hidden
        await expect(svg.getByText('A', { exact: true })).toBeVisible();
        await expect(svg.getByText('(-5)')).not.toBeVisible();

        // 3. Reveal first point specifically
        // Find the eye icon for point A (first in list)
        const pointItems = page.locator('div.flex.items-center.gap-2.p-2.rounded');
        await pointItems.first().locator('button[title="Reveal Point"]').click();

        // Now Point A should show its value again in SVG
        await expect(svg.getByText('A (-5)')).toBeVisible();

        // Point B should still be hidden in SVG
        await expect(svg.getByText('B (5)')).not.toBeVisible();
        await expect(svg.getByText('B', { exact: true })).toBeVisible();

        // 4. Reveal all
        await page.click('button:has-text("Reveal All")');
        await expect(svg.getByText('B (5)')).toBeVisible();
    });
});
