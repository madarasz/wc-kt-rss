from scraper import Scraper
from datetime import datetime

# URL of the website to scrape
url = 'https://www.goonhammer.com/category/core-games/kill-team/'

scraper_instance = Scraper(headless=True, url=url)
soup = scraper_instance.get_soup("screenshot-gh", "div.td-big-grid-post")
fg = scraper_instance.get_fg('Goonhammer - Kill Team', 'Kill Team posts')

# Extract news items
news_items = soup.find_all('div', class_='td-big-grid-post')

for item in news_items:
    title = item.find('a')['title'] if item.find('a') else 'No Title'
    link = item.find('a')['href']
    image_url = item.find('img', class_='entry-thumb')['src']

    soup = scraper_instance.get_soup('', 'time.entry-date', link)

    div_elements = soup.find_all('div', class_='tdb-block-inner')
    for div in div_elements:
        time_element = div.find('time', class_='entry-date')
        if time_element:
            pub_date_str = time_element['datetime']
            pub_date = datetime.fromisoformat(pub_date_str)
            break

    scraper_instance.add_item(title, link, '', image_url, pub_date)

# Save the RSS feed to a file
fg.rss_file('feed-gh-killteam.xml')
scraper_instance.close

