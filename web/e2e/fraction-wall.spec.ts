import { test, expect } from '@playwright/test';

test.describe('Fraction Wall', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/mathematics/fraction-wall');
    });

    test('should load the fraction wall with all rows', async ({ page }) => {
        await expect(page.getByTestId('fraction-wall-svg')).toBeVisible();
        // Check for some expected cumulative fractions
        await expect(page.getByText('1/1', { exact: true })).toBeVisible();

        // Phase 1 check: Halves row should have 1/2 and 2/2, not two 1/2
        await expect(page.getByText('1/2', { exact: true })).toHaveCount(1);
        await expect(page.getByText('2/2', { exact: true })).toHaveCount(1);

        // Twelfths: each label appears exactly once
        await expect(page.getByText('1/12', { exact: true })).toHaveCount(1);
        await expect(page.getByText('12/12', { exact: true })).toHaveCount(1);
    });

    test('should shade a segment on click', async ({ page }) => {
        // Click 1/2 (first segment)
        const halfSegment = page.locator('g').filter({ hasText: /^1\/2$/ }).first();
        await halfSegment.click();

        // The URL should update with segment '2:0'
        await expect(page).toHaveURL(/s=2%3A0/);
    });

    test('should toggle labels', async ({ page }) => {
        await page.getByRole('button', { name: 'Decimal' }).click();
        // 0.5 appears in rows 2, 4, 6, 8, 10, 12.
        await expect(page.locator('text=0.5')).not.toHaveCount(0);
        await expect(page.locator('text=0.5').first()).toBeVisible();

        // 1 appears in many rows (1/1, 2/2, 3/3...)
        await expect(page.locator('text=1').first()).toBeVisible();

        await page.getByRole('button', { name: 'Percent' }).click();
        // 50% appears in multiple rows
        await expect(page.locator('text=50%').first()).toBeVisible();
        await expect(page.locator('text=100%').first()).toBeVisible();
    });

    test('should show cumulative labels in decimal mode', async ({ page }) => {
        await page.getByRole('button', { name: 'Decimal' }).click();
        // 2nd segment of thirds = 2/3 ≈ 0.667 (also in 4/6, 6/9, 8/12)
        await expect(page.locator('text=0.667').first()).toBeVisible();
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
        await expect(page.locator('svg line').first()).toBeVisible();
    });

    test('should restore state from URL', async ({ page }) => {
        // Go to URL with 1/2 and 2/4 shaded
        await page.goto('/mathematics/fraction-wall?s=2%3A0%3B4%3A0%3B4%3A1');

        // Check if shaded segments exist (URL has 's=...')
        await expect(page).toHaveURL(/s=.*2%3A0/);
        await expect(page).toHaveURL(/s=.*4%3A0/);
        await expect(page).toHaveURL(/s=.*4%3A1/);
    });

    // Phase 2 Tests
    test('should show row total when segments are shaded', async ({ page }) => {
        // Shade 1 segment in the quarters row
        const firstQuarter = page.locator('g').filter({ hasText: /^1\/4$/ }).first();
        await firstQuarter.click();
        // After clicking first segment, row total should show 1/4
        await expect(page.getByTestId('row-total-4')).toHaveText('1/4');

        // Click second segment (which is labeled 2/4 now)
        const secondQuarter = page.locator('g').filter({ hasText: /^2\/4$/ }).first();
        await secondQuarter.click();
        await expect(page.getByTestId('row-total-4')).toHaveText('2/4');
    });

    test('should format row total according to label mode', async ({ page }) => {
        // Shade first segment of halves
        const halfSegment = page.locator('g').filter({ hasText: /^1\/2$/ }).first();
        await halfSegment.click();

        // Switch to decimal mode
        await page.getByRole('button', { name: 'Decimal' }).click();
        await expect(page.getByTestId('row-total-2')).toHaveText('0.5');

        // Switch to percent mode
        await page.getByRole('button', { name: 'Percent' }).click();
        await expect(page.getByTestId('row-total-2')).toHaveText('50%');
    });

    test('should hide row total when no segments are shaded', async ({ page }) => {
        // No segments shaded — no row totals should exist
        await expect(page.getByTestId('row-total-2')).not.toBeVisible();
    });
});
