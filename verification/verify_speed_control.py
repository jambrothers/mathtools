
import os
from playwright.sync_api import sync_playwright

def verify_speed_control():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to Double Sided Counters page which uses SpeedControl
        page.goto("http://localhost:3000/mathematics/double-sided-counters")

        try:
            # Click "Slow" button to enable sequential mode and show SpeedControl
            page.get_by_role("button", name="Slow").click()

            # Wait for SpeedControl to appear.
            # It has text "Animation Speed"
            speed_control = page.get_by_text("Animation Speed")
            speed_control.wait_for(timeout=5000)

            print("SpeedControl found.")

            # Take a screenshot of the whole page
            page.screenshot(path="/home/jules/verification/speed_control_page.png")

            # Locate the slider input and verifying its accessibility attributes via Playwright logic isn't visual,
            # but we can check if it exists.
            slider = page.get_by_label("Animation Speed")
            if slider.count() > 0:
                print("Accessible slider found.")
            else:
                print("Accessible slider NOT found.")

            # Take component screenshot
            # XPath to find the FloatingPanel containing "Animation Speed"
            panel = page.locator("//span[contains(text(), 'Animation Speed')]/../..")
            if panel.count() > 0:
                panel.first.screenshot(path="/home/jules/verification/speed_control_component.png")
                print("SpeedControl component screenshot captured.")

        except Exception as e:
            print(f"Error finding SpeedControl: {e}")
            page.screenshot(path="/home/jules/verification/error_page.png")

        browser.close()

if __name__ == "__main__":
    os.makedirs("/home/jules/verification", exist_ok=True)
    verify_speed_control()
