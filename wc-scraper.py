from selenium import webdriver
from selenium.webdriver.chrome.options import Options
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

# URL of the website to scrape
url = 'https://www.warhammer-community.com/kill-team/'

# Set up Chrome options for headless mode
chrome_options = Options()
# chrome_options.add_argument("--headless") TODO: fix this
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")

# Initialize WebDriver in headless mode
driver = webdriver.Chrome(options=chrome_options)

# Load the page
driver.get(url)

try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a.post-item"))
    )
except TimeoutException:
    print("Timed out waiting for page to load")
    driver.quit()

# Get page source and close the driver
source = driver.page_source
driver.quit()

# Parse with BeautifulSoup
soup = BeautifulSoup(source, 'html.parser')

# Extract news items
news_items = soup.find_all('a', class_='post-item')

# Create RSS feed
fg = FeedGenerator()
fg.title('Warhammer Community - Kill Team')
fg.description('Kill Team posts')
fg.link(href=url, rel='alternate')

for item in news_items:
    title = item.find('h3').text if item.find('h3') else 'No Title'
    link = item['href']
    description = item.find('div', class_='post-feed__excerpt').text if item.find('div', class_='post-feed__excerpt') else 'No Description'
    
    # Extract image URL from the background-image style
    img_container = item.find('div', class_='post-item__img-container')
    if img_container and 'style' in img_container.attrs:
        style = img_container.attrs['style']
        match = re.search(r"url\('([^']*)'\)", style)
        if match:
            image_url = match.group(1)
        else:
            image_url = ''
    else:
        image_url = ''

    # Extract publication date
    date_str = item.find('p', class_='post-item__date').get_text(strip=True) if item.find('p', class_='post-item__date') else ''
    
    # Convert date string to datetime object (adjust format as necessary)
    # Example format: '18 Nov 23'
    try:
        pub_date = datetime.strptime(date_str, '%d %b %y')
        pub_date = pub_date.replace(tzinfo=pytz.UTC)  # Set timezone to UTC
    except ValueError:
        pub_date = None  # In case of parsing failure

    fe = fg.add_entry()
    fe.title(title)
    fe.link(href=link)
    fe.description(f'<img src="{image_url}"/><p>{description}</p>')
    if pub_date:
        fe.published(pub_date)

# Save the RSS feed to a file
fg.rss_file('wc-killteam-feed.xml')
