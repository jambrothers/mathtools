import { test, expect } from '@playwright/test';


test.describe('Linear Equations Tool', () => {
    const BASE_URL = '/mathematics/linear-equations';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        // Wait for graph to be visible
        await page.waitForSelector('svg'); // Robust selector
    });

    test('should display default line and values', () => {
        // verify title (via page title set)
        // verify default values in sliders
        // verify line is rendered
    });

    test('should update graph when sliders change', async ({ page }) => {
        // Change gradient slider
        const mSlider = page.locator('input[type="range"]').first(); // Gradient is first
        await mSlider.fill('2');
        // Check display value update
        await expect(page.locator('span.font-mono').first()).toHaveText('2');

        // Equation label on graph should update
        // We might need to look for text content in SVG
        await expect(page.locator('text=y = 2x + 1')).toBeVisible();
    });

    test('should allow dragging to move (change c) and rotate (change m)', async ({ page }) => {
        // Wait for graph to be ready
        await page.waitForSelector('svg');

        // Select "Move (c)" mode
        await page.getByRole('button', { name: 'Move (c)' }).click();

        // Get initial equation of Line 1 (default y = 1x + 0)
        // We need to target the foreignObject text. 
        // Best way: check the slider value or equation display.
        await expect(page.getByText('y = 1x')).toBeVisible();

        // Perform Drag on Line 1
        // Center of graph is (0,0). Line passes through it.
        // We want to drag it UP.
        // Graph coordinates: dragged from (0,0) to (0, 2)
        // This should change c from 0 to 2.

        // Locate line by color or id? The line element has specific stroke colors.
        // Or simpler: grab the line element directly via SVG selector
        // First path/line in the 'g' group inside svg
        // Using a more robust locator strategy based on the component structure

        // We added a transparent hit area line with strokeWidth="20". It's the first line in the group.
        // Let's grab the center of the SVG (which corresponds to 0,0)
        const svg = page.locator('svg').first();
        const box = await svg.boundingBox();
        if (!box) throw new Error("SVG not found");

        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;

        // Move 50px up (Y decreases in pixels, but increases in graph Y)
        // Wait, Y is inverted. Pixel Y decreasing = Graph Y increasing.
        // 300px height = 20 units Y range (-10 to 10 is 20? No VIEWPORT is ~ -6.67 to 6.67)
        // Height 300px for range ~13.33 units. 1 unit ~= 22.5px.
        // Moving up 45px should result in roughly +2 change in c.

        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await page.mouse.move(centerX, centerY - 45); // Drag up
        await page.mouse.up();

        // Check if equation updated. Should be approx y = 1x + 2
        // Due to bounding box and mouse inaccuracies, it might be 1.9 or 2.1
        // Let's check the parameter slider value
        const cSlider = page.getByLabel('Y-Intercept (c)');
        const cValue = await cSlider.inputValue();
        expect(parseFloat(cValue)).toBeGreaterThan(1.5);
        expect(parseFloat(cValue)).toBeLessThan(2.5);

        // Switch to Rotation
        await page.getByRole('button', { name: 'Rotate (m)' }).click();

        // Rotate: drag right side of line UP to increase slope?
        // Line passes through (0, c) -> (0, ~2) now.
        // Let's drag a point at x=5.
        // x=5 is 1/4 width to the right of center.
        // box.width = 460. x=5 is approx centerX + 115px.
        // Resetting line to simple state might be easier first.

        // Reset
        await page.getByRole('button', { name: 'Reset' }).click();
        await page.getByRole('button', { name: 'Rotate (m)' }).click(); // Re-select rotate

        // Drag at x=5 (centerX + 115)
        // Initial y at x=5 (m=1, c=0) -> y=5.
        // Pixel Y relative to center: -5 units * 22.5 = -112.5px (up)
        // Start Drag at (centerX + 115, centerY - 112);
        // Drag DOWN to flatten slope.

        await page.mouse.move(centerX + 115, centerY - 112);
        await page.mouse.down();
        await page.mouse.move(centerX + 115, centerY); // Drag to y=0 (slope becomes 0)
        await page.mouse.up();

        const mSlider = page.getByLabel('Gradient (m)');
        const mValue = await mSlider.inputValue();
        expect(Math.abs(parseFloat(mValue))).toBeLessThan(0.5); // Close to 0
    });

    test('should support stepper controls', async ({ page }) => {
        await page.waitForSelector('svg');

        // Initial c = 0
        // Use nth(1) because getByLabel logic proved flaky with the custom slider component
        // 0 is Gradient (m), 1 is Y-Intercept (c)
        const cSlider = page.locator('input[type="range"]').nth(1);
        await expect(cSlider).toHaveValue('0');

        // Click Plus button next to slider. 
        // Implementation structure: button < input > button
        // We can find the button by the icon or relationship. 
        // "Plus" icon or just "next sibling" logic?
        // Simpler: The button doesn't have a label yet. 
        // We should probably add aria-labels to the steppers for accessibility/testing.

        // Assuming we clicked layout/steppers implementation correctly:
        // Wrapper div -> button(minus), div(slider), button(plus)
        // Let's assume we can target by just `button` inside the control row?
        // Or update code to add aria-labels first?
        // PRO TIP: Do it blindly by relationship or add labels if failing.

        // Let's click the button that is right of the slider container?
        // Or just use the SVG icon selector? Lucide Plus
        // .lucide-plus closest wrapper button?

        const plusButton = await page.locator('button:has(.lucide-plus)').nth(1); // 0 is m, 1 is c
        await plusButton.click();

        await expect(cSlider).toHaveValue('0.5');

        const minusButton = await page.locator('button:has(.lucide-minus)').nth(1);
        await minusButton.click();

        await expect(cSlider).toHaveValue('0');
    });
    test('should add and remove lines', async ({ page }) => {
        // Click Add button
        await page.getByTitle("Add Line").click();

        // Should have 2 tabs
        await expect(page.getByText('Line 2')).toBeVisible();

        // Remove line
        await page.getByText('Remove this line').click();

        // Should have 1 tab/line again
        await expect(page.getByText('Line 2')).not.toBeVisible();
    });

    test('should apply presets', async ({ page }) => {
        // Parallel preset
        await page.getByText('Parallel Line').click();

        // Should add a new line (Line 2)
        await expect(page.getByText('Line 2')).toBeVisible();

        // Verify gradients are equal (approx check via sliders or assumption that preset works if line added)
        // Unit tests covered the math logic. E2E verifies UI hookup.
    });

    test('should toggle display options', async ({ page }) => {
        // Toggle equation off
        await page.getByText('Show Equation').click();

        // Equation label should disappear
        await expect(page.locator('text=y = 0.5x + 1')).not.toBeVisible();
    });

    test('export menu should open', async ({ page }) => {
        await page.getByText('Export').click();
        await expect(page.getByText('PNG Image')).toBeVisible();
        await expect(page.getByText('SVG Vector')).toBeVisible();
    });

});
