from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the game page where the timer is used
        print("Navigating to http://localhost:3000/games/pointless")
        page.goto("http://localhost:3000/games/pointless")

        # Wait for timer to be visible
        print("Waiting for timer widget...")
        page.wait_for_selector('role=timer')

        # Click "30s" button (aria-label: Set timer for 30 seconds)
        print("Setting timer to 30 seconds...")
        # Since 30s is too long for a quick test, I'll check if I can modify the state or just wait.
        # Actually, let's just use the 30s preset. It's the shortest.
        # Wait, if I want to test completion quickly, maybe I can use `page.evaluate` to modify React state? No, encapsulated.
        # I'll stick to waiting.

        try:
            page.get_by_label("Set timer for 30 seconds").click()
        except:
            print("Could not find button by label, trying text content '30s'")
            page.get_by_role("button", name="30s").click()

        # Verify time is set
        print("Verifying time is 00:30")
        page.wait_for_function("document.querySelector('[role=timer]').textContent.includes('00:30')")

        # Click Start (aria-label: Start timer)
        print("Starting timer...")
        try:
            page.get_by_label("Start timer").click()
        except:
            print("Could not find start button by label, trying icon/class")
            page.locator("button:has(.lucide-play)").click()

        # Wait for 31 seconds
        print("Waiting 31 seconds for timer to finish...")
        time.sleep(31)

        # Verify visual feedback
        # The timer should be 00:00 and have red text class
        print("Verifying completion state...")
        timer_el = page.locator('[role=timer]')
        classes = timer_el.get_attribute("class")
        print(f"Timer classes: {classes}")

        if "text-red-600" in classes:
            print("SUCCESS: Timer has red text class.")
        else:
            print("FAILURE: Timer does not have red text class.")

        if "animate-pulse" in classes:
             print("SUCCESS: Timer is pulsing.")
        else:
             print("FAILURE: Timer is not pulsing.")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification_timer_complete.png")

        browser.close()

if __name__ == "__main__":
    run()
