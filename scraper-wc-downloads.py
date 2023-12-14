
from scraper import Scraper

# URL of the website to scrape
url = 'https://www.warhammer-community.com/kill-team-downloads/'


scraper_instance = Scraper(headless=True, url=url)
soup = scraper_instance.get_soup("screenshot-wcd.png", "div.resources-groups")
fg = scraper_instance.get_fg('Warhammer Community - Kill Team Balance Dataslate', 'Kill Team Balance Dataslate')

# Extract Balance Dataslate
items = soup.find_all('li', class_='resources-list__item')
intrests = ['The Balance Dataslate', 'Core Rules']

for item in items:
    title = item.find('h3').text.strip()
    if title in intrests:
        link = item.find('a', class_='resources-button')['href']
        image_url = item.find('img')['src']
        date_str = item.find('p', class_='resources-list__date').get_text(strip=True)[-10:]
        pub_date = scraper_instance.date_from_string(date_str, '%d/%m/%Y')
        scraper_instance.add_item(f"{title} - {date_str}" , link, '', image_url, pub_date) 

# Save the RSS feed to a file
fg.rss_file('feed-wc-dataslate.xml')
scraper_instance.print_timer()

scraper_instance.close()
