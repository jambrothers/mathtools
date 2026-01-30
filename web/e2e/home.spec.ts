import { test, expect } from '@playwright/test';

/**
 * E2E tests for the MathTools homepage.
 * Tests verify page structure, content, and navigation.
 */
test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display the page title', async ({ page }) => {
        await expect(page).toHaveTitle(/MathTools/);
    });

    test('should display the hero heading', async ({ page }) => {
        // Check for the main headline
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Bridging the gap');
        await expect(heading).toContainText('Exposition & Understanding');
    });

    test('should display the hero description', async ({ page }) => {
        const description = page.locator('p').filter({ hasText: /Interactive digital tools/ });
        await expect(description).toBeVisible();
    });

    test('should display Explore Tools CTA button', async ({ page }) => {
        const exploreButton = page.getByRole('link', { name: 'Explore Tools' });
        await expect(exploreButton).toBeVisible();
        await expect(exploreButton).toHaveAttribute('href', '/tools');
    });

    test('should display Learn More CTA button', async ({ page }) => {
        const learnMoreButton = page.getByRole('link', { name: 'Learn More' });
        await expect(learnMoreButton).toBeVisible();
        await expect(learnMoreButton).toHaveAttribute('href', '/about');
    });

    test('should navigate to Tools page when clicking Explore Tools', async ({ page }) => {
        await page.click('text=Explore Tools');
        await expect(page).toHaveURL('/tools');
        await expect(page.locator('h1')).toContainText('Tools');
    });

    test('should navigate to About page when clicking Learn More', async ({ page }) => {
        await page.click('text=Learn More');
        await expect(page).toHaveURL('/about');
        await expect(page.locator('h1')).toContainText('About');
    });

    test('should display hero visual/image section', async ({ page }) => {
        // The hero visual contains an image - check for either light or dark mode version
        const heroVisualLight = page.locator('img[alt="Mathematical Tools Illustration"]').first();
        const heroVisualDark = page.locator('img[alt="Mathematical Tools Illustration"]').last();

        // At least one should be in the DOM (visibility depends on theme)
        const lightCount = await heroVisualLight.count();
        const darkCount = await heroVisualDark.count();
        expect(lightCount + darkCount).toBeGreaterThan(0);
    });
});
