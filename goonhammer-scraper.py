from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from bs4 import BeautifulSoup
from feedgen.feed import FeedGenerator
import time
import re
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from datetime import datetime
import pytz

def wait_element(element):
    try:
        WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, element))
    )
    except TimeoutException:
        print("Timed out waiting for page to load")
        driver.quit()

# URL of the website to scrape
url = 'https://www.goonhammer.com/category/core-games/kill-team/'

firefox_options = Options()
firefox_options.add_argument("--headless")

driver = webdriver.Firefox(options=firefox_options)

# Load the page
driver.get(url)
driver.save_screenshot("screenshot-gh.png")
wait_element("div.td-big-grid-post")

# Get page source and close the driver
source = driver.page_source

# Parse with BeautifulSoup
soup = BeautifulSoup(source, 'html.parser')

# Extract news items
news_items = soup.find_all('div', class_='td-big-grid-post')

# Create RSS feed
fg = FeedGenerator()
fg.title('Goonhammer - Kill Team')
fg.description('Kill Team posts')
fg.link(href=url, rel='alternate')

for item in news_items:
    title = item.find('a')['title'] if item.find('a') else 'No Title'
    link = item.find('a')['href']
    image_url = item.find('img', class_='entry-thumb')['src']

    driver.get(link)
    wait_element('time.entry-date')
    source = driver.page_source
    soup = BeautifulSoup(source, 'html.parser')
    div_elements = soup.find_all('div', class_='tdb-block-inner')
    for div in div_elements:
        time_element = div.find('time', class_='entry-date')
        if time_element:
            pub_date_str = time_element['datetime']
            pub_date = datetime.fromisoformat(pub_date_str)
            break

    fe = fg.add_entry()
    fe.title(title)
    fe.link(href=link)
    fe.description(f'<img src="{image_url}"/>')
    fe.published(pub_date)

# Save the RSS feed to a file
fg.rss_file('gh-killteam-feed.xml')
driver.quit()

