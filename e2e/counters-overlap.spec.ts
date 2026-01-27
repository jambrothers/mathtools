import { test, expect } from '@playwright/test';

test('Counters Toolbar: verify input and add button visibility at tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto('/mathematics/double-sided-counters');

    // Wait for toolbar
    const addButton = page.getByRole('button', { name: 'Add', exact: true });
    const select = page.getByTestId('counter-type-select'); // Use testId if available, or combobox

    // Check Add button width
    const addButtonBox = await addButton.boundingBox();
    expect(addButtonBox).not.toBeNull();
    // Icon only button is small (~26px), so allow > 20px
    expect(addButtonBox!.width).toBeGreaterThan(20);

    // Check Select width
    const selectBox = await select.boundingBox();
    expect(selectBox).not.toBeNull();
    expect(selectBox!.width).toBeGreaterThan(50);

    // Check wrapping/overlap
    // Find a button from the 'Action Group' (e.g., Number Line)
    const numberLineButton = page.getByRole('button', { name: 'Number Line' }).first();
    const numberLineBox = await numberLineButton.boundingBox();

    if (numberLineBox && addButtonBox) {
        // Verify they do NOT intersect
        const intersect = (
            addButtonBox.x < numberLineBox.x + numberLineBox.width &&
            addButtonBox.x + addButtonBox.width > numberLineBox.x &&
            addButtonBox.y < numberLineBox.y + numberLineBox.height &&
            addButtonBox.y + addButtonBox.height > numberLineBox.y
        );
        expect(intersect).toBe(false);

        // At 800px, we expect wrapping, so Number Line should ideally be below Add Button
        // or at least not strictly to the left of it on the same line if squashed.
        // But intersection check is the key validation for "disappear behind".
    }
});
