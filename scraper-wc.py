
from scraper import Scraper

# URL of the website to scrape
url = 'https://www.warhammer-community.com/kill-team/'


scraper_instance = Scraper(headless=True, url=url)
soup = scraper_instance.get_soup("screenshot-wc", "a.post-item")
fg = scraper_instance.get_fg('Warhammer Community - Kill Team', 'Kill Team posts')

# Extract news items
news_items = soup.find_all('a', class_='post-item')

for item in news_items:
    title = item.find('h3').text.strip()
    link = item['href']
    description = item.find('div', class_='post-feed__excerpt').text.strip()
    image_url = scraper_instance.image_url_from_css_background(item.find('div', class_='post-item__img-container'))
    pub_date = scraper_instance.date_from_string(item.find('p', class_='post-item__date').get_text(strip=True))

    scraper_instance.add_item(title, link, description, image_url, pub_date)   

# Save the RSS feed to a file
fg.rss_file('feed-wc-killteam.xml')

scraper_instance.close()