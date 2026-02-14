import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Export Functionality', () => {
    test('Bar Model export should work in Firefox', async ({ page }) => {
        // Correctly formatted URL
        const urlParams = new URLSearchParams();
        urlParams.set('b', '0:100,100,100,400,0');
        await page.goto(`/mathematics/bar-model?${urlParams.toString()}`);

        // Wait for tool to initialize and render canvas
        await page.waitForSelector('[data-testid="bar-model-canvas"]');

        // Wait for bar to be rendered
        await page.waitForSelector('[data-testid^="bar-"]');
        await page.waitForTimeout(500); // Extra buffer for canvas sync

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
        // Correctly formatted URL with single-level encoding for parameters
        const urlParams = new URLSearchParams();
        urlParams.set('b', '0:100,100,100,400,0');
        await page.goto(`/mathematics/bar-model?${urlParams.toString()}`);

        await page.waitForSelector('[data-testid="bar-model-canvas"]');
        await page.waitForSelector('[data-testid^="bar-"]');

        const exportButton = page.getByRole('button', { name: 'Export' });
        await exportButton.click();

        const downloadPromise = page.waitForEvent('download');
        await page.getByText('SVG Vector').click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/bar-model-\d+\.svg/);
    });

    test('Double Sided Counters export should work', async ({ page }) => {
        await page.goto('/mathematics/double-sided-counters');

        // Add a counter by clicking the +1 sidebar item
        const plusOne = page.locator('button:has-text("Add +1")').first();
        await plusOne.click();
        await page.waitForTimeout(500); // Wait for render

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
