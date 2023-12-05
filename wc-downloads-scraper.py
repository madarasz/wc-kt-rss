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
url = 'https://www.warhammer-community.com/kill-team-downloads/'

firefox_options = Options()
firefox_options.add_argument("--headless")
firefox_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")

driver = webdriver.Firefox(options=firefox_options)

# Load the page
driver.get(url)
driver.save_screenshot("screenshot-wcd.png")
wait_element("resources-groups")

# Get page source and close the driver
source = driver.page_source

# Parse with BeautifulSoup
soup = BeautifulSoup(source, 'html.parser')

# Extract news items
keyres = soup.find('div', class_='resources-groups')
items = keyres.find_all('div', class_='resources-list__item')

# Create RSS feed
fg = FeedGenerator()
fg.title('Balance Dataslate - Kill Team')
fg.description('Balance dataslate update')
fg.link(href=url, rel='alternate')

for item in items:
    print("meg")
    # title = item.find('a')['title'] if item.find('a') else 'No Title'
    # link = item.find('a')['href']
    # image_url = item.find('img', class_='entry-thumb')['src']

    # driver.get(link)
    # wait_element('time.entry-date')
    # source = driver.page_source
    # soup = BeautifulSoup(source, 'html.parser')
    # div_element = soup.find('div', class_='tdb-block-inner')
    # time_element = div_element.find('time', class_='entry-date')
    # print(time_element)
    # pub_date_str = time_element['datetime']
    # print(pub_date_str)
    # pub_date = datetime.fromisoformat(pub_date_str)


    # fe = fg.add_entry()
    # fe.title(title)
    # fe.link(href=link)
    # fe.description(f'<img src="{image_url}"/>')
    # fe.published(pub_date)

# Save the RSS feed to a file
fg.rss_file('balance-feed.xml')
driver.quit()

