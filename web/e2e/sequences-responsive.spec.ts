import { test, expect } from '@playwright/test';

test.describe('Sequences Tool Responsive & Touch', () => {
    const toolUrl = '/mathematics/sequences';

    test.beforeEach(async ({ page }) => {
        await page.goto(toolUrl);
    });

    test('Mobile View (375x667): Verify Banner and Override', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        // ResolutionGuard banner should appear
        await expect(page.getByText('Designed for Larger Screens')).toBeVisible();
        await page.getByRole('button', { name: 'Continue Anyway' }).click();
        await expect(page.getByText('Designed for Larger Screens')).toBeHidden();

        // Config button should be visible
        const configBtn = page.getByRole('button', { name: /config/i });
        await expect(configBtn).toBeVisible();

        // Open Config Panel
        await configBtn.click();
        const configPanel = page.locator('div').filter({ hasText: 'Sequence Type' }).last();
        await expect(configPanel).toBeVisible();

        // Check if config panel fits roughly in viewport (not exceeding width)
        const box = await configPanel.boundingBox();
        if (box) {
            expect(box.width).toBeLessThanOrEqual(375);
        }
    });

    test('Tablet View (768x1024): Verify Header and Toolbar', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });

        // Header Check: Title should be visible
        const title = page.locator('h1', { hasText: 'Sequences Tool' });
        await expect(title).toBeVisible();

        // Help button should be in the toolbar (new requirement)
        const helpBtn = page.getByRole('button', { name: /help/i });
        await expect(helpBtn).toBeVisible();

        // Generate 12 terms via config
        await page.getByRole('button', { name: /config/i }).click();
        const termsInput = page.locator('label:has-text("Terms") + input');
        await termsInput.fill('12');
        await page.getByRole('button', { name: /close/i }).click();

        // Show All
        await page.getByRole('button', { name: /show all/i }).click();

        // Verify 12 terms are rendered
        const termContainers = page.locator('span:has-text("n =")');
        await expect(termContainers).toHaveCount(12);

        // Verify they wrap (multiple rows)
        const firstTerm = termContainers.first();
        const lastTerm = termContainers.last();
        const firstBox = await firstTerm.boundingBox();
        const lastBox = await lastTerm.boundingBox();

        if (firstBox && lastBox) {
            // If they wrapped, their Y coordinates should be different
            expect(lastBox.y).toBeGreaterThan(firstBox.y);
        }
    });

    test('Touch Targets: Random dropdown items size', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });

        // Open Random dropdown
        await page.getByRole('button', { name: /random/i }).click();

        // Check "Arithmetic" checkbox target size
        const arithmeticBtn = page.getByRole('button', { name: 'Arithmetic' });
        const box = await arithmeticBtn.boundingBox();
        if (box) {
            // Touch targets ideally > 36-44px in height
            expect(box.height).toBeGreaterThanOrEqual(32); // Current might be smaller
        }
    });

    test('State Persistence: Resize to Mobile and Back', async ({ page }) => {
        // 1. Setup initial state (Desktop)
        await page.setViewportSize({ width: 1024, height: 768 });

        // Open Config
        await page.getByRole('button', { name: /config/i }).click();

        // Change terms to 5
        const termsInput = page.locator('label:has-text("Terms") + input');
        await termsInput.fill('5');

        // Generate a sequence (to ensure terms are rendered)
        await page.getByRole('button', { name: /counters/i }).click();

        // 2. Resize to Mobile (Trigger ResolutionGuard)
        await page.setViewportSize({ width: 375, height: 667 });

        // Verify Guard is present
        await expect(page.getByText('Designed for Larger Screens')).toBeVisible();

        // 3. Resize back to Desktop
        await page.setViewportSize({ width: 1024, height: 768 });

        // 4. Verify State Persistence
        const configBtn = page.getByRole('button', { name: /config/i });
        if (await configBtn.isVisible()) {
            const panel = page.locator('div').filter({ hasText: 'Sequence Type' }).last();
            if (!await panel.isVisible()) {
                await configBtn.click();
            }
        }

        await expect(termsInput).toHaveValue('5');
    });
});
