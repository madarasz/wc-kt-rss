from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium import webdriver
from bs4 import BeautifulSoup
from feedgen.feed import FeedGenerator
import re
from datetime import datetime
import time
import pytz

class Scraper:

    def __init__(self, headless=True, url=""):
        self.url=url
        self.options = Options()
        if headless:
            self.options.add_argument("--headless")
        self.options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")
        profile = webdriver.FirefoxProfile()
        profile.set_preference("permissions.default.image", 2)
        profile.set_preference("javascript.enabled", False)
        self.options.profile = profile
        self.driver = webdriver.Firefox(options=self.options)

    def get_driver(self):
        return self.driver

    def close(self):
        self.driver.quit()

    def get_soup(self, name="", wait_element="", new_url="", debug=False):
        self.timer = time.time()
        if new_url != "": self.url = new_url
        self.driver.get(self.url)
        if name != "": 
            self.driver.save_screenshot(f"{name}.png") 
            self.name = name
        if wait_element !="": self.wait_element(wait_element, debug)
        return BeautifulSoup(self.driver.page_source, 'html.parser')
    
    def print_timer(self):
        duration = time.time() - self.timer
        print(f"{self.get_timestamp()} - Scraped page: {self.url} ({duration:.2f} sec)")

    def get_timestamp(self):
        return datetime.now().strftime('%Y.%m.%d. %H:%M:%S')
    
    def get_fg(self, title="", description=""):
        self.fg = FeedGenerator()
        self.fg.title(title)
        self.fg.description(description)
        self.fg.link(href=self.url, rel='alternate')
        return self.fg
    
    def image_url_from_css_background(self, img_container):
        if img_container and 'style' in img_container.attrs:
            style = img_container.attrs['style']
            match = re.search(r"url\('([^']*)'\)", style)
            if match:
                image_url = match.group(1)
            else:
                image_url = ''
        else:
            image_url = ''
        return image_url
    
    def date_from_string(self, date_str, format="%d %b %y"):
        # Convert date string to datetime object (adjust format as necessary)
        # Example format: '18 Nov 23'
        try:
            pub_date = datetime.strptime(date_str, format)
            pub_date = pub_date.replace(tzinfo=pytz.UTC)  # Set timezone to UTC
        except ValueError:
            pub_date = None  # In case of parsing failure
        return pub_date

    def add_item(self, title, url, description, image_url, pub_date, debug=False):
        fe = self.fg.add_entry()
        fe.title(title)
        fe.link(href=url)
        description = f'<img src="{image_url}"/><p>{description}</p>' if image_url != '' else description
        fe.description(description)
        if pub_date:
            fe.published(pub_date)
        if debug: print(f"- added entry: {title} ({pub_date})")

    def wait_element(self, element, debug=False):
        try:
            WebDriverWait(self.driver, 10).until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, element))
        )
        except TimeoutException:
            print("Timed out waiting for page to load")
            self.driver.quit()
        duration = time.time() - self.timer 
        if debug: print(f"{self.get_timestamp()} - Opened page: {self.url} ({duration:.2f} sec)")

