import { test, expect } from '@playwright/test';

/**
 * E2E tests for the About page.
 * Tests verify page content and structure.
 */
test.describe('About Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/about');
    });

    test('should display the page heading', async ({ page }) => {
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('About');
        await expect(heading).toContainText('MathTools');
    });

    test('should display the introduction paragraph', async ({ page }) => {
        const intro = page.locator('p').filter({
            hasText: /collection of interactive digital tools/
        });
        await expect(intro).toBeVisible();
    });

    test('should display the Our Mission section', async ({ page }) => {
        const missionHeading = page.locator('h2').filter({ hasText: 'Our Mission' });
        await expect(missionHeading).toBeVisible();

        const missionContent = page.locator('p').filter({
            hasText: /every student deserves access/
        });
        await expect(missionContent).toBeVisible();
    });

    test('should have proper page structure with card styling', async ({ page }) => {
        // The mission section should be within a styled card
        const missionCard = page.locator('div').filter({ has: page.locator('h2:text("Our Mission")') }).first();
        await expect(missionCard).toBeVisible();
    });
});
