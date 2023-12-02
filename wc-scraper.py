from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from feedgen.feed import FeedGenerator
import time

# URL of the website to scrape
url = 'https://www.warhammer-community.com/kill-team/'

# Set up Chrome options for headless mode
chrome_options = Options()
# chrome_options.add_argument("--headless")
# chrome_options.add_argument("--no-sandbox")  # Required if running as root (not recommended)

# Initialize WebDriver in headless mode
driver = webdriver.Chrome(options=chrome_options)

# Load the page
driver.get(url)
# Wait for JavaScript to load
time.sleep(5)  # Adjust the sleep time as necessary

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
    fe = fg.add_entry()
    fe.title(title)
    fe.link(href=link)
    fe.description(description)
    #fe.pubdate = item.find('p', class_='post-item__date'.text)

# Save the RSS feed to a file
fg.rss_file('wc-killteam-feed.xml')
