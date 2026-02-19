
import { test, expect } from '@playwright/test';

test.describe('Experimental Banner Integration', () => {

    // Tools that should have the banner
    const experimentalTools = [
        { url: '/mathematics/number-line', id: 'number-line' },
        { url: '/mathematics/fraction-wall', id: 'fraction-wall' },
        { url: '/mathematics/sequences', id: 'sequences' }
    ];

    // Tool that should NOT have the banner
    const stableTool = '/mathematics/bar-model';

    for (const tool of experimentalTools) {
        test(`${tool.id}: shows experimental banner and allows dismissal`, async ({ page }) => {
            await page.goto(tool.url);

            // Banner should be visible
            const bannerTitle = page.getByText('Experimental Feature');
            const bannerDesc = page.getByText('This page is experimental and features could change at any time');

            await expect(bannerTitle).toBeVisible();
            await expect(bannerDesc).toBeVisible();

            // Check for occlusion - Banner should be at the top (approx y=81), Content should be below it
            const bannerBox = await page.locator('.fixed.z-40').boundingBox();
            // We need to find the main content. For tools using InteractiveToolLayout, it's the element with z-[40] fixed.
            // For sequences, it's the flex col wrapper.
            // Let's grab the banner height and verify the content starts after it.

            if (bannerBox) {
                // Verify banner is positioned correctly (below header which is ~81px)
                expect(bannerBox.y).toBeGreaterThanOrEqual(80);

                // Now check that the tool content is pushed down.
                // We pick a key element from the tool content. Be generic.
                const toolContent = page.locator('main, div.flex-col > .flex-1').last();
                const contentBox = await toolContent.boundingBox();

                if (contentBox) {
                    // The content should start at least where the banner ends
                    expect(contentBox.y).toBeGreaterThanOrEqual(bannerBox.y + bannerBox.height);
                }
            }

            // Dismiss it
            await page.getByRole('button', { name: 'Continue Anyway' }).click();

            // Should be hidden
            await expect(bannerTitle).toBeHidden();
        });
    }

    test('Persists dismissal per-page (isolation)', async ({ page }) => {
        // 1. Visit Number Line and dismiss
        await page.goto('/mathematics/number-line');
        await expect(page.getByText('Experimental Feature')).toBeVisible();
        await page.getByRole('button', { name: 'Continue Anyway' }).click();
        await expect(page.getByText('Experimental Feature')).toBeHidden();

        // 2. Visit Fraction Wall (should still show banner)
        await page.goto('/mathematics/fraction-wall');
        await expect(page.getByText('Experimental Feature')).toBeVisible();

        // 3. Dismiss Fraction Wall too
        await page.getByRole('button', { name: 'Continue Anyway' }).click();
        await expect(page.getByText('Experimental Feature')).toBeHidden();

        // 4. Return to Number Line (should still be dismissed)
        await page.goto('/mathematics/number-line');
        await expect(page.getByText('Experimental Feature')).toBeHidden();
    });

    test('Stable tool does not show banner', async ({ page }) => {
        await page.goto(stableTool);
        await expect(page.getByText('Experimental Feature')).toBeHidden();
    });
});
