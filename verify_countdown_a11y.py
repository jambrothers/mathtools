
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to Countdown game...")
        # Navigate to the Countdown game page
        page.goto("http://localhost:3000/games/countdown")

        # Wait for the page to load
        page.wait_for_load_state("networkidle")

        print("Checking for accessible elements...")

        # Check for Min/Max inputs by label
        try:
            min_input = page.get_by_label("Minimum target value")
            max_input = page.get_by_label("Maximum target value")

            expect(min_input).to_be_visible()
            expect(max_input).to_be_visible()
            print("✅ Min/Max inputs found by aria-label")
        except Exception as e:
            print(f"❌ Failed to find Min/Max inputs: {e}")
            page.screenshot(path="verification_failure.png")
            raise

        # Check for Large Numbers buttons by label
        try:
            zero_large = page.get_by_label("Set 0 large numbers")
            random_large = page.get_by_label("Set random large numbers")

            expect(zero_large).to_be_visible()
            expect(random_large).to_be_visible()
            print("✅ Large number buttons found by aria-label")
        except Exception as e:
            print(f"❌ Failed to find Large Number buttons: {e}")
            raise

        # Check aria-pressed state
        # By default, maybe 1 large number is selected? Let's click 0 and check
        zero_large.click()
        expect(zero_large).to_have_attribute("aria-pressed", "true")
        print("✅ Large number button has aria-pressed='true' after click")

        # Check operations
        # Assuming Addition is enabled by default. "Addition" text is inside a span inside the button.
        # But `name="Addition"` should work if button text is "Addition".
        # The button has complex children. Let's see if get_by_role("button", name="Addition") works.
        try:
            add_btn = page.get_by_role("button", name="Addition")
            expect(add_btn).to_be_visible()

            # Check initial state (should be pressed if enabled by default)
            # We don't know default config for sure, but usually + is enabled.
            # If not, we can check attribute exists.

            initial_pressed = add_btn.get_attribute("aria-pressed")
            print(f"Initial state of Addition button: aria-pressed={initial_pressed}")

            # Click to toggle
            add_btn.click()

            # Verify state flipped
            expected_state = "false" if initial_pressed == "true" else "true"
            expect(add_btn).to_have_attribute("aria-pressed", expected_state)
            print(f"✅ Operation button toggles aria-pressed state to {expected_state}")

        except Exception as e:
             print(f"❌ Failed to verify operation buttons: {e}")
             raise

        # Take a screenshot for visual confirmation
        page.screenshot(path="verification_countdown.png")
        print("📸 Screenshot saved to verification_countdown.png")

        browser.close()

if __name__ == "__main__":
    run()
