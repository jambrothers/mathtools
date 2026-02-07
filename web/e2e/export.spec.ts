import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Export Functionality', () => {
    test('Bar Model export should work in Firefox', async ({ page }) => {
        // Navigate to Bar Model tool with predefined state (One bar with ID 0)
        await page.goto('/mathematics/bar-model?b=0:100%252C300%2C80%2C800');

        // Wait for tool to initialize and render canvas
        await page.waitForSelector('[data-testid="bar-model-canvas"]');

        // Wait for bar to be rendered
        await page.waitForSelector('[data-testid="bar-0"]');

        // Click Export button
        // Note: ToolbarButton might render 'Export' as tooltip or text
        const exportButton = page.getByRole('button', { name: 'Export' });
        await exportButton.click();

        // Wait for modal to appear
        await page.waitForSelector('text=Export Bar Model');

        // Setup download listener
        const downloadPromise = page.waitForEvent('download');

        // Click PNG Image export
        await page.getByText('PNG Image').click();

        // Wait for download
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/bar-model-\d+\.png/);

        // Verify download size > 0
        const path = await download.path();
        const stats = fs.statSync(path);
        expect(stats.size).toBeGreaterThan(0);
    });

    test('Bar Model SVG export should work', async ({ page }) => {
        await page.goto('/mathematics/bar-model?b=0:100%252C300%2C80%2C800');

        await page.waitForSelector('[data-testid="bar-model-canvas"]');
        await page.waitForSelector('[data-testid="bar-0"]');

        const exportButton = page.getByRole('button', { name: 'Export' });
        await exportButton.click();

        const downloadPromise = page.waitForEvent('download');
        await page.getByText('SVG Vector').click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/bar-model-\d+\.svg/);
    });

    test('Double Sided Counters export should work', async ({ page }) => {
        await page.goto('/mathematics/double-sided-counters');

        // Add a counter by clicking the +1 sidebar item (if it's clickable) or dragging
        // Actually, clicking the sidebar item adds it in current implementation
        const plusOne = page.getByText('+1').first();
        await plusOne.click();

        // Wait for counter to appear using the new data-testid format
        await page.waitForSelector('[data-testid^="counter-"]');

        // Click Export button in toolbar
        const exportButton = page.getByRole('button', { name: 'Export' });
        await exportButton.click();

        // Wait for modal to appear
        await expect(page.getByText('Export Counters')).toBeVisible();

        // Setup download listener
        const downloadPromise = page.waitForEvent('download');

        // Click PNG Image export
        await page.getByText('PNG Image').click();

        // Wait for download
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/double-sided-counters-\d+\.png/);

        // Check size
        const path = await download.path();
        const stats = fs.statSync(path);
        expect(stats.size).toBeGreaterThan(0);
    });
});
