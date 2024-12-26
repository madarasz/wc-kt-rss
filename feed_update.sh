cd /opt/wc-kt-rss/
find ./ -name '*.log' -size +1M -exec rm {} \;
npx ts-node wc-rules.ts
npx ts-node wc-articles.ts
cp *.xml /var/www/alwaysberunning/public/
