import { test, expect } from '@playwright/test';

test.describe('Number Line Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/mathematics/number-line');
        // Wait for hydration
        await expect(page.getByTestId('number-line-svg')).toBeVisible({ timeout: 10000 });
    });

    test('should render the number line with default ticks', async ({ page }) => {
        const svg = page.getByTestId('number-line-svg');
        await expect(svg.getByText('-10', { exact: true })).toBeVisible();
        await expect(svg.getByText('0', { exact: true })).toBeVisible();
        await expect(svg.getByText('10', { exact: true })).toBeVisible();
    });

    test('should add and drag points', async ({ page }) => {
        // Disable snapping
        await page.locator('label').filter({ hasText: 'Snap to Ticks' }).click();

        await page.getByTestId('add-point-input').fill('5');
        await page.getByTestId('add-point-button').click();

        const svg = page.getByTestId('number-line-svg');
        await expect(svg.getByTestId(/^point-p-/).first()).toBeVisible();
        await expect(svg.getByText('A (5)')).toBeVisible();
    });

    test('should hide and reveal values', async ({ page }) => {
        await page.locator('label').filter({ hasText: 'Snap to Ticks' }).click();
        await page.getByTestId('add-point-input').fill('7');
        await page.getByTestId('add-point-button').click();

        await page.locator('label').filter({ hasText: 'Hide Point Values' }).click();
        const svg = page.getByTestId('number-line-svg');
        await expect(svg.getByText('7', { exact: true })).not.toBeVisible();
        await expect(svg.getByText('A', { exact: true })).toBeVisible();

        await page.locator('label').filter({ hasText: 'Hide Point Values' }).click();
        await expect(svg.getByText('A (7)', { exact: true })).toBeVisible();
    });

    test('should zoom and change ticks', async ({ page }) => {
        await page.getByRole('button', { name: '0 to 1', exact: true }).click();
        const svg = page.getByTestId('number-line-svg');
        await expect(svg.getByText('0.1', { exact: true })).toBeVisible();
        await expect(svg.getByText('0.5', { exact: true })).toBeVisible();
    });

    test('should restore state from URL', async ({ page }) => {
        const url = '/mathematics/number-line?min=-2&max=2&points=1,A,red|-1,B,blue&arcs=p-2,p-1,%2B2&labels=1&hide=0&snap=1';
        await page.goto(url);
        const svg = page.getByTestId('number-line-svg');
        await expect(svg.getByText('A (1)', { exact: true })).toBeVisible();
        await expect(svg.getByText('B (-1)', { exact: true })).toBeVisible();
        await expect(svg.getByText('+2', { exact: true })).toBeVisible();
    });

    test('should create jump arcs interactively', async ({ page }) => {
        await page.getByTestId('add-point-input').fill('0');
        await page.getByTestId('add-point-button').click();
        await page.getByTestId('add-point-input').fill('10');
        await page.getByTestId('add-point-button').click();

        await page.getByRole('button', { name: 'Add Jump', exact: true }).click();
        const svg = page.getByTestId('number-line-svg');
        const points = svg.getByTestId(/^point-p-/);
        await points.nth(0).locator('circle').last().click({ force: true });
        await points.nth(1).locator('circle').last().click({ force: true });

        await expect(page.locator('text=Arc 1:')).toBeVisible();
    });

    test('should auto-label jump arcs correctly', async ({ page }) => {
        await page.locator('label').filter({ hasText: 'Snap to Ticks' }).click();
        await page.getByTestId('add-point-input').fill('0');
        await page.getByTestId('add-point-button').click();
        await page.getByTestId('add-point-input').fill('-5');
        await page.getByTestId('add-point-button').click();

        await page.getByRole('button', { name: 'Add Jump', exact: true }).click();
        const svg = page.getByTestId('number-line-svg');
        const points = svg.getByTestId(/^point-p-/);
        await points.nth(0).locator('circle').last().click({ force: true });
        await points.nth(1).locator('circle').last().click({ force: true });
        await expect(svg.getByText('−5', { exact: true })).toBeVisible();
    });

    test('should add points by clicking on the number line in add-point mode', async ({ page }) => {
        await page.getByRole('button', { name: 'Add Point', exact: true }).click();
        const svg = page.getByTestId('number-line-svg');
        // Click directly on the SVG using coordinates
        await svg.click({ position: { x: 500, y: 250 } });
        await page.waitForTimeout(500);
        await expect(svg.getByTestId(/^point-p-/).first()).toBeVisible();
        await expect(svg.getByText('A (0)')).toBeVisible();
    });

    test('should support ordering exercises', async ({ page }) => {
        await page.getByRole('button', { name: 'Add Point', exact: true }).click();
        const svg = page.getByTestId('number-line-svg');
        await svg.click({ position: { x: 200, y: 250 } }); // Should be -6
        await page.waitForTimeout(200);
        await svg.click({ position: { x: 800, y: 250 } }); // Should be 6
        await page.waitForTimeout(200);

        await expect(svg.getByText('A (-6)')).toBeVisible();
        await page.click('button:has-text("Hide All")');
        await expect(svg.getByText('A', { exact: true })).toBeVisible();
        await expect(svg.getByText('(-6)')).not.toBeVisible();

        const pointItems = page.locator('div.flex.items-center.gap-2.p-2.rounded');
        await pointItems.first().locator('button[title="Reveal Point"]').click();
        await expect(svg.getByText('A (-6)')).toBeVisible();
    });

    test('should delete points', async ({ page }) => {
        await page.getByTestId('add-point-input').fill('0');
        await page.getByTestId('add-point-button').click();
        const svg = page.getByTestId('number-line-svg');
        const points = svg.getByTestId(/^point-p-/);

        await page.getByRole('button', { name: 'Delete', exact: true }).click();
        await points.nth(0).locator('circle').last().click({ force: true });
        await expect(svg.getByText('A (0)')).not.toBeVisible();
    });
});
