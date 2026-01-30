import { test, expect } from '@playwright/test';

/**
 * E2E tests for cross-cutting navigation functionality.
 * Tests verify navbar, footer, theme toggle, and page-to-page navigation.
 */
test.describe('Navigation', () => {
    test('navbar should be visible on home page', async ({ page }) => {
        await page.goto('/');
        const navbar = page.locator('nav').first();
        await expect(navbar).toBeVisible();
    });

    test('navbar should be visible on about page', async ({ page }) => {
        await page.goto('/about');
        const navbar = page.locator('nav').first();
        await expect(navbar).toBeVisible();
    });

    test('navbar should be visible on tools page', async ({ page }) => {
        await page.goto('/tools');
        const navbar = page.locator('nav').first();
        await expect(navbar).toBeVisible();
    });

    test('navbar should be visible on algebra tiles page', async ({ page }) => {
        await page.goto('/mathematics/algebra-tiles');
        const navbar = page.locator('nav').first();
        await expect(navbar).toBeVisible();
    });

    test('navbar should be visible on double sided counters page', async ({ page }) => {
        await page.goto('/mathematics/double-sided-counters');
        const navbar = page.locator('nav').first();
        await expect(navbar).toBeVisible();
    });

    test('navbar should be visible on circuit designer page', async ({ page }) => {
        await page.goto('/computing/circuit-designer');
        const navbar = page.locator('nav').first();
        await expect(navbar).toBeVisible();
    });

    test('should navigate from home to all main pages', async ({ page }) => {
        // Start at home
        await page.goto('/');
        await expect(page).toHaveURL('/');

        // Navigate to About
        await page.goto('/about');
        await expect(page).toHaveURL('/about');

        // Navigate to Tools
        await page.goto('/tools');
        await expect(page).toHaveURL('/tools');

        // Navigate to Algebra Tiles
        await page.goto('/mathematics/algebra-tiles');
        await expect(page).toHaveURL('/mathematics/algebra-tiles');

        // Navigate to Double Sided Counters
        await page.goto('/mathematics/double-sided-counters');
        await expect(page).toHaveURL('/mathematics/double-sided-counters');

        // Navigate to Circuit Designer
        await page.goto('/computing/circuit-designer');
        await expect(page).toHaveURL('/computing/circuit-designer');
    });

    test('logo/brand link in navbar should navigate to home', async ({ page }) => {
        await page.goto('/about');
        // Click the brand/logo link (typically contains "MathTools" text or is first link in nav)
        const brandLink = page.locator('nav a').first();
        await brandLink.click();
        await expect(page).toHaveURL('/');
    });

    test('theme toggle should switch between light and dark mode', async ({ page }) => {
        await page.goto('/');

        // Find the theme toggle button by its aria-label
        const themeToggle = page.locator('button[aria-label="Toggle theme"]');

        // Button should exist
        await expect(themeToggle).toBeVisible();

        // Get initial theme state
        const html = page.locator('html');
        const initialClass = await html.getAttribute('class');

        // Click theme toggle
        await themeToggle.click();
        await page.waitForTimeout(300); // Allow for theme transition

        // Theme should have changed (class should be different now)
        const newClass = await html.getAttribute('class');
        // Either initially had 'dark' and now doesn't, or vice versa
        const themeChanged = initialClass !== newClass;
        expect(themeChanged || initialClass?.includes('dark') !== newClass?.includes('dark')).toBeTruthy();
    });
});

test.describe('Footer', () => {
    test('should display social links on home page', async ({ page }) => {
        await page.goto('/');
        // Check for social link icons (GitHub, LinkedIn, Bluesky)
        const socialLinks = page.locator('footer a, nav a').filter({ has: page.locator('svg') });
        // Should have at least some social links
        const count = await socialLinks.count();
        expect(count).toBeGreaterThan(0);
    });
});
