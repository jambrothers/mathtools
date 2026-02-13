import { test, expect } from '@playwright/test';

test.describe('Percentage Grid', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/mathematics/percentage-grid');
    });

    test('should render grid and controls', async ({ page }) => {
        await expect(page.getByRole('grid')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Fill 10%' })).toBeVisible();
    });

    test('should toggle squares on click', async ({ page }) => {
        const grid = page.getByRole('grid');
        const squares = grid.getByRole('button');
        const firstSquare = squares.nth(0);

        await expect(firstSquare).toHaveAttribute('aria-pressed', 'false');
        await firstSquare.click();
        await expect(firstSquare).toHaveAttribute('aria-pressed', 'true');
    });

    test('should select multiple squares on drag', async ({ page }) => {
        const grid = page.getByRole('grid');
        const squares = grid.getByRole('button');

        // Wait for grid to be stable
        await expect(squares).toHaveCount(100);

        // Start drag on square 0
        const box0 = await squares.nth(0).boundingBox();
        const box4 = await squares.nth(4).boundingBox(); // Box in same row

        if (!box0 || !box4) throw new Error('Could not find squares');

        await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2);
        await page.mouse.down();
        await page.mouse.move(box4.x + box4.width / 2, box4.y + box4.height / 2);
        await page.mouse.up();

        await expect(squares.nth(0)).toHaveAttribute('aria-pressed', 'true');
        await expect(squares.nth(1)).toHaveAttribute('aria-pressed', 'true');
        await expect(squares.nth(4)).toHaveAttribute('aria-pressed', 'true');
    });

    test('should resize grid when viewport changes', async ({ page }) => {
        const grid = page.getByRole('grid');

        // Initial Size (Desktop) - Large enough to hit max width constraint
        await page.setViewportSize({ width: 1200, height: 1400 });
        // Wait for layout to settle
        await page.waitForTimeout(200);

        const box1 = await grid.boundingBox();
        if (!box1) throw new Error('Grid not visible');

        // Resize to Tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(200);

        const box2 = await grid.boundingBox();
        if (!box2) throw new Error('Grid not visible after resize');

        // Check reasonable constraints
        // At 1200px width, grid should cap at around 1000px
        expect(box1.width).toBeGreaterThan(900);
        expect(box1.width).toBeLessThanOrEqual(1005); // 1000 + border variance

        // At 768px width, grid should be constrained by width: 768 - 48(padding) = 720
        expect(box2.width).toBeLessThan(750);
        expect(box2.width).toBeGreaterThan(650);

        // Box 2 should be smaller than Box 1
        expect(box2.width).toBeLessThan(box1.width);
    });
});
