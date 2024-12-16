cd /opt/wc-kt-rss/
find ./ -name '*.log' -size +1M -exec rm {} \;
npx ts-node goonhammer-news.ts
npx ts-node wc-downloads.ts
npx ts-node wc-news.ts
cp *.xml /var/www/alwaysberunning/public/
