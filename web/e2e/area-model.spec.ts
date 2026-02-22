import { test, expect } from '@playwright/test';

test.describe('Area Model Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/mathematics/area-model');
    });

    test('renders basic UI elements', async ({ page }) => {
        await expect(page.getByLabel('Factor A')).toBeVisible();
        await expect(page.getByLabel('Factor B')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Visualise' })).toBeVisible();
        await expect(page.getByText('Enter factors to visualize the area model')).toBeVisible();
    });

    test('visualizes a simple numeric model', async ({ page }) => {
        await page.getByLabel('Factor A').fill('3');
        await page.getByLabel('Factor B').fill('4');
        await page.getByRole('button', { name: 'Visualise' }).click();

        const svg = page.locator('[data-testid="area-model-svg"]');
        await expect(svg).toBeVisible();

        // Check for factor labels
        await expect(page.getByTestId('factor-label-row-0')).toHaveText('3');
        await expect(page.getByTestId('factor-label-col-0')).toHaveText('4');

        // By default all cells are revealed (per my implementation in hook)
        await expect(page.getByTestId('product-label-0-0')).toHaveText('12');
        await expect(page.getByTestId('total-label')).toHaveText('Total: 12');
    });

    test('handles auto-partitioning', async ({ page }) => {
        await page.getByLabel('Factor A').fill('23');
        await page.getByLabel('Factor B').fill('15');
        await page.getByRole('button', { name: 'Auto-Partition' }).click();
        await page.getByRole('button', { name: 'Visualise' }).click();

        // Row should have 2 terms: 20 and 3
        await expect(page.getByTestId('factor-label-row-0')).toHaveText('20');
        await expect(page.getByTestId('factor-label-row-1')).toHaveText('3');

        // Col should have 2 terms: 10 and 5
        await expect(page.getByTestId('factor-label-col-0')).toHaveText('10');
        await expect(page.getByTestId('factor-label-col-1')).toHaveText('5');

        await expect(page.getByTestId('product-label-0-0')).toHaveText('200');
        await expect(page.getByTestId('total-label')).toHaveText('Total: 345');
    });

    test('progressive reveal interaction', async ({ page }) => {
        await page.getByLabel('Factor A').fill('3');
        await page.getByLabel('Factor B').fill('4');
        await page.getByRole('button', { name: 'Visualise' }).click();

        await page.getByRole('button', { name: 'Hide All' }).click();
        await expect(page.getByTestId('product-label-0-0')).not.toBeVisible();

        await page.getByTestId('cell-0-0').click();
        await expect(page.getByTestId('product-label-0-0')).toBeVisible();
        await expect(page.getByTestId('product-label-0-0')).toHaveText('12');
    });

    test('stepwise factor adjustment', async ({ page }) => {
        await page.getByLabel('Factor A').fill('5');
        await page.getByTestId('increment-a').click();
        await expect(page.getByLabel('Factor A')).toHaveValue('6');

        await page.getByTestId('decrement-a').click();
        await expect(page.getByLabel('Factor A')).toHaveValue('5');
    });

    test('algebraic model visualization', async ({ page }) => {
        await page.getByLabel('Factor A').fill('x + 1');
        await page.getByLabel('Factor B').fill('x + 2');
        await page.getByRole('button', { name: 'Visualise' }).click();

        await expect(page.getByTestId('product-label-0-0')).toHaveText('x²');
        await expect(page.getByTestId('total-label')).toHaveText('Total: x² + 3x + 2');

        // Discrete array should be disabled
        const arrayToggle = page.getByLabel('Toggle Discrete Array');
        await expect(arrayToggle).toBeDisabled();
    });
});
