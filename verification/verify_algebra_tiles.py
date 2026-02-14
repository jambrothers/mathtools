from playwright.sync_api import sync_playwright
import time

def verify_algebra_tiles(page):
    page.goto("http://localhost:3000/mathematics/algebra-tiles")

    # Wait for the sidebar to load
    page.wait_for_selector('button:has-text("1")')

    # Add a tile (click on the sidebar button)
    page.click('button:has-text("1")')

    # Wait for tile to appear on canvas
    tile = page.wait_for_selector('[data-testid="tile"]')

    # Get initial position
    initial_box = tile.bounding_box()
    print(f"Initial position: {initial_box}")

    # Drag the tile
    # We need to simulate mouse events
    page.mouse.move(initial_box['x'] + 10, initial_box['y'] + 10)
    page.mouse.down()
    page.mouse.move(initial_box['x'] + 100, initial_box['y'] + 100)

    # Take a screenshot while dragging
    page.screenshot(path="verification/dragging.png")

    page.mouse.up()

    # Wait for settling
    time.sleep(0.5)

    # Take a final screenshot
    page.screenshot(path="verification/verification.png")

    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_algebra_tiles(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
