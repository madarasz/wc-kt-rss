
from scraper import Scraper

# URL of the website to scrape
baseurl = 'https://www.warhammer-community.com'
url = baseurl + '/en-gb/setting/kill-team/'


scraper_instance = Scraper(headless=True, url=url)
soup = scraper_instance.get_soup("screenshot-wc", "section.shared-newsGridThree")
fg = scraper_instance.get_fg('Warhammer Community - Kill Team', 'Kill Team posts')

# Extract news items
news_items = soup.find_all('article')

for item in news_items:
    title = item.find('h3').text.strip()
    link = item.find('a')['href']
    image_url = ''
    img_figure = item.find('figure')
    if img_figure:
        image_tag = img_figure.find('img')
        if image_tag:
            image_url = image_tag['src']  # Get the 'src' attribute for the image URL
    pub_date = scraper_instance.date_from_string(item.find('time', class_='whitespace-nowrap').get_text(strip=True))

    scraper_instance.add_item(title, baseurl + link, '', baseurl + image_url, pub_date)   

# Save the RSS feed to a file
fg.rss_file('feed-wc-killteam.xml')
scraper_instance.print_timer()

scraper_instance.close()