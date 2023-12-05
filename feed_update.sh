cd /opt/wc-kt-rss/
python3 wc-scraper.py
python3 goonhammer-scraper.py
cp wc-killteam-feed.xml /var/www/alwaysberunning/public/
cp gh-killteam-feed.xml /var/www/alwaysberunning/public/
