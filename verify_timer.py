from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Retry connection loop
        for i in range(10):
            try:
                print(f"Attempting to connect (try {i+1}/10)...")
                page.goto("http://localhost:3000/games/pointless")
                break
            except Exception as e:
                print(f"Connection failed: {e}")
                time.sleep(2)

        try:
            # Wait for the TimerWidget to be visible
            print("Waiting for TimerWidget...")
            page.wait_for_selector('text="00:00"', timeout=10000)

            # Set timer to 30s using preset
            preset_30s = page.get_by_label("Set timer for 30 seconds")
            preset_30s.click()
            print("Clicked 30s preset")

            # Click Start (using new aria-label)
            start_button = page.get_by_label("Start timer")
            if start_button.is_visible():
                print("Found Start button")
                start_button.click()
                print("Clicked Start")
            else:
                print("Start button not found!")

            # Wait for 2 seconds to see time change
            page.wait_for_timeout(2000)

            # Take screenshot of running timer
            page.screenshot(path="verification_timer_running.png")
            print("Screenshot saved: verification_timer_running.png")

            # Verify Pause button appears (same element, new label)
            pause_button = page.get_by_label("Pause timer")
            if pause_button.is_visible():
                print("Found Pause button")
                pause_button.click()
                print("Clicked Pause")
            else:
                print("Pause button not found!")

            # Take screenshot of paused timer
            page.screenshot(path="verification_timer_paused.png")
            print("Screenshot saved: verification_timer_paused.png")

            # Take a screenshot of the completed state
            page.screenshot(path="verification_timer_complete.png")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
