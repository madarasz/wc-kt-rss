cd /opt/wc-kt-rss/
find ./ -name '*.log' -size +1M -exec rm {} \;
python3 scraper-wc.py
python3 scraper-goonhammer.py
python3 scraper-wc-downloads.py
cp feed-wc-killteam.xml /var/www/alwaysberunning/public/
cp feed-gh-killteam.xml /var/www/alwaysberunning/public/
cp feed-wc-dataslate.xml /var/www/alwaysberunning/public/
pkill -f firefox-esr
