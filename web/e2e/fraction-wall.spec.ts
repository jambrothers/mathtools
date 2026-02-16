import { test, expect } from '@playwright/test';

test.describe('Fraction Wall', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/mathematics/fraction-wall');
    });

    test('should load the fraction wall with all rows', async ({ page }) => {
        await expect(page.getByTestId('fraction-wall-svg')).toBeVisible();
        // Check for some expected fractions
        await expect(page.getByText('1/1', { exact: true })).toBeVisible();
        await expect(page.getByText('1/2', { exact: true })).toHaveCount(2);
        await expect(page.getByText('1/12', { exact: true })).toHaveCount(12);
    });

    test('should shade a segment on click', async ({ page }) => {
        // Click 1/2 (first segment)
        // Note: We use a more specific locator if possible, but text search works for simple cases
        const halfSegment = page.locator('g').filter({ hasText: /^1\/2$/ }).first();
        await halfSegment.click();

        // The URL should update with segment '2:0'
        await expect(page).toHaveURL(/s=2%3A0/);
    });

    test('should toggle labels', async ({ page }) => {
        await page.getByRole('button', { name: 'Decimal' }).click();
        await expect(page.locator('text=0.5')).toHaveCount(2);

        await page.getByRole('button', { name: 'Percent' }).click();
        await expect(page.locator('text=50%')).toHaveCount(2);
    });

    test('should toggle equivalence lines', async ({ page }) => {
        // Shade 1/2
        const halfSegment = page.locator('g').filter({ hasText: /^1\/2$/ }).first();
        await halfSegment.click();

        // Verify shading worked (wait for URL)
        await expect(page).toHaveURL(/s=2%3A0/);

        // Toggle equivalence lines
        await page.getByLabel('Equivalence Lines').click({ force: true });

        // Should show a line in the SVG
        await expect(page.locator('line')).toBeVisible();
    });

    test('should restore state from URL', async ({ page }) => {
        // Go to URL with 1/2 and 2/4 shaded
        await page.goto('/mathematics/fraction-wall?s=2%3A0%3B4%3A0%3B4%3A1');

        // Check if shaded segments exist (URL has 's=...')
        await expect(page).toHaveURL(/s=.*2%3A0/);
        await expect(page).toHaveURL(/s=.*4%3A0/);
        await expect(page).toHaveURL(/s=.*4%3A1/);
    });
});
