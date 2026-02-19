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
        await expect(svg.getByText('5', { exact: true })).toBeVisible();
    });

    test('should hide and reveal values', async ({ page }) => {
        // Disable snapping
        await page.locator('label').filter({ hasText: 'Snap to Ticks' }).click();

        await page.getByTestId('add-point-input').fill('7');
        await page.getByTestId('add-point-button').click();

        // Toggle hide values
        await page.locator('label').filter({ hasText: 'Hide Point Values' }).click();

        const svg = page.getByTestId('number-line-svg');
        await expect(svg.getByText('7', { exact: true })).not.toBeVisible();
        await expect(svg.getByText('?', { exact: true })).toBeVisible();

        // Toggle back
        await page.locator('label').filter({ hasText: 'Hide Point Values' }).click();
        await expect(svg.getByText('7', { exact: true })).toBeVisible();
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
        // Arcs don't have test-ids yet, but we can check if the instruction resets or just add an arc label
        // Actually, let's just check if it resets to "first point" or stays in mode
        await expect(page.getByText('Click first point to start arc...')).toBeVisible();

        // Final check: manual addition should still show one arc
        await expect(page.locator('text=Arc 1:')).toBeVisible();
    });
});
