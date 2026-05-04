from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(2000)
    
    # Login
    page.get_by_role("textbox", name="Email Address").fill("test@example.com")
    page.get_by_placeholder("Password").fill("password")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_timeout(3000)

    # Dashboard page - Need to click Go to Dashboard
    page.get_by_role("button", name="Go to Dashboard").click()
    page.wait_for_timeout(3000)

    # Screenshot of dashboard
    page.screenshot(path="/home/jules/verification/screenshots/map_initial.png")
    page.wait_for_timeout(500)

    map_elem = page.locator(".map")
    
    # Check if map is there
    if map_elem.is_visible():
        map_elem.hover()
        page.wait_for_timeout(1000)
        page.screenshot(path="/home/jules/verification/screenshots/map_hover.png")

        # Click in the middle of the map (roughly Centre region)
        map_elem.click(position={"x": 140, "y": 200})
        page.wait_for_timeout(1000)
        
        # Screenshot after clicking
        page.screenshot(path="/home/jules/verification/screenshots/map_clicked.png")
        page.wait_for_timeout(1000)
    else:
        print("Map not visible")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
