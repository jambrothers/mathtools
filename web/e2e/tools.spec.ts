import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Tools catalog page.
 * Tests verify tool cards, navigation to tools, and page sections.
 */
test.describe('Tools Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tools');
    });

    test('should display the page heading', async ({ page }) => {
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Tools');
    });

    test('should display the page description', async ({ page }) => {
        const description = page.locator('p').filter({
            hasText: /curated collection of digital manipulatives/
        });
        await expect(description).toBeVisible();
    });

    test('should display Mathematics section heading', async ({ page }) => {
        const mathHeading = page.locator('h2').filter({ hasText: 'Mathematics' });
        await expect(mathHeading).toBeVisible();
    });

    test('should display Computing section heading', async ({ page }) => {
        const computingHeading = page.locator('h2').filter({ hasText: 'Computing' });
        await expect(computingHeading).toBeVisible();
    });

    test('should display Algebra Tiles tool card', async ({ page }) => {
        const algebraTilesCard = page.locator('text=Algebra Tiles').first();
        await expect(algebraTilesCard).toBeVisible();

        // Check for description
        const description = page.locator('text=Visualize algebraic concepts');
        await expect(description).toBeVisible();
    });

    test('should display Double Sided Counters tool card', async ({ page }) => {
        const countersCard = page.locator('text=Double Sided Counters').first();
        await expect(countersCard).toBeVisible();

        // Check for description
        const description = page.locator('text=Explore integer and algebraic operations');
        await expect(description).toBeVisible();
    });

    test('should display Circuit Designer tool card', async ({ page }) => {
        const circuitCard = page.locator('text=Circuit Designer').first();
        await expect(circuitCard).toBeVisible();

        // Check for description
        const description = page.locator('text=Build and simulate logic circuits');
        await expect(description).toBeVisible();
    });

    test('should navigate to Algebra Tiles when clicking its card', async ({ page }) => {
        await page.click('a:has-text("Algebra Tiles")');
        await expect(page).toHaveURL('/mathematics/algebra-tiles');
    });

    test('should navigate to Double Sided Counters when clicking its card', async ({ page }) => {
        await page.click('a:has-text("Double Sided Counters")');
        await expect(page).toHaveURL('/mathematics/double-sided-counters');
    });

    test('should navigate to Circuit Designer when clicking its card', async ({ page }) => {
        await page.click('a:has-text("Circuit Designer")');
        await expect(page).toHaveURL('/computing/circuit-designer');
    });

    test('Mathematics section should contain correct number of tools', async ({ page }) => {
        const mathSection = page.locator('#mathematics');
        const toolCards = mathSection.locator('a[href^="/mathematics"]');
        await expect(toolCards).toHaveCount(6); // Algebra Tiles, Counters, Bar Model, Linear Equations, Percentage Grid, Sequences
    });

    test('Computing section should contain correct number of tools', async ({ page }) => {
        const computingSection = page.locator('#computing');
        const toolCards = computingSection.locator('a[href^="/computing"]');
        await expect(toolCards).toHaveCount(1); // Circuit Designer
    });
});
