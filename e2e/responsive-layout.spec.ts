import { test, expect } from '@playwright/test';

const TOOLS = [
    '/mathematics/double-sided-counters',
    '/mathematics/bar-model',
    '/mathematics/algebra-tiles'
];

test.describe('Responsive Breakpoint Policy', () => {
    for (const toolUrl of TOOLS) {
        test.describe(`${toolUrl}`, () => {

            test('Desktop (>= 1024px): Full experience with labels', async ({ page }) => {
                await page.setViewportSize({ width: 1024, height: 768 });
                await page.goto(toolUrl);

                // Wait for toolbar to load
                const undoButton = page.getByRole('button', { name: /undo/i });
                await expect(undoButton).toBeVisible();

                // Specific checks for labels based on tool might be needed if generic check fails
                // But our ToolbarButton implementation uses 'hidden lg:inline' on span containing label.
                // Playwright's getByRole('button', { name: 'Undo' }) matches if 'Undo' is visible text.
                // If it was hidden, it wouldn't match or would be hidden.
                // Let's verify specifically that text is visible.

                // We expect buttons to have visible labels
                // Use a common button like 'Undo' or 'Clear'
                const clearButton = page.getByRole('button', { name: /clear/i });
                await expect(clearButton).toBeVisible();
            });

            test('Tablet (768px - 1023px): Compact mode (Icon only)', async ({ page }) => {
                await page.setViewportSize({ width: 800, height: 600 });
                await page.goto(toolUrl);

                // Wait for load
                await page.waitForTimeout(500); // minor wait for hydration/layout

                // The button itself is visible (the icon)
                // But the TEXT should be hidden. 
                // Playwright might still match name if it's in the DOM but hidden? 
                // Standard check: verify the span with class 'hidden lg:inline' is hidden.

                // We'll select by icon to ensure button is there
                // Then check if it contains visible text "Undo"
                // Actually, checking if the text node is visible is better.

                const undoBtn = page.locator('button').filter({ hasText: 'Undo' }).first();
                // The span inside should be hidden
                const label = undoBtn.locator('span', { hasText: 'Undo' });
                await expect(label).toBeHidden();
            });

            test('Mobile (< 768px): Banner active and Override flow', async ({ page }) => {
                await page.setViewportSize({ width: 375, height: 667 });
                await page.goto(toolUrl);

                // Banner should be visible
                await expect(page.getByText('Designed for Larger Screens')).toBeVisible();
                await expect(page.getByText('Please use a larger device')).toBeVisible();

                // Tool buttons should NOT be interactive/visible under the backdrop?
                // The content is rendered but covered.

                // Dismiss banner
                await page.getByRole('button', { name: 'Continue Anyway' }).click();

                // Banner should disappear
                await expect(page.getByText('Designed for Larger Screens')).toBeHidden();

                // Tool should be usable
                // Buttons should be icon-only (inheriting tablet rules)
                const undoBtn = page.locator('button').filter({ hasText: 'Undo' }).first();
                const label = undoBtn.locator('span', { hasText: 'Undo' });
                await expect(label).toBeHidden();

                // Check for wrapping? 
                // Hard to assert "wrapping" without visual regression, but we can check CSS
                // or check positions of elements.
                // For now, functionality is key (it shouldn't be broken).
            });
        });
    }
});
