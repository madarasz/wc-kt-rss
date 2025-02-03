[![Nightly E2E Tests](https://github.com/madarasz/wc-kt-rss/actions/workflows/nightly-e2e.yml/badge.svg)](https://github.com/madarasz/wc-kt-rss/actions/workflows/nightly-e2e.yml)
[![codecov](https://codecov.io/gh/madarasz/wc-kt-rss/branch/main/graph/badge.svg)](https://codecov.io/gh/madarasz/wc-kt-rss)

## Purpose
Generates the RSS feed for 
- [Warhammer Community Kill Team articles](https://www.warhammer-community.com/en-gb/kill-team/)
- [Warhammer Community Kill Team downloads](https://www.warhammer-community.com/en-gb/downloads/kill-team/)
- Combines various YouTube RSS feeds into a single file. List of YouTube feeds is in `yt-channels.yml`.

The output is regularly being uploaded to:
- [https://alwaysberunning.net/kt-rss/kill-team-news.xml](https://alwaysberunning.net/kt-rss/kill-team-news.xml)
- [https://alwaysberunning.net/kt-rss/kill-team-downloads.xml](https://alwaysberunning.net/kt-rss/kill-team-downloads.xml)
- [https://alwaysberunning.net/kt-rss/kt-combined-youtube.xml](https://alwaysberunning.net/kt-rss/kt-combined-youtube.xml)

## Install requirements
```
npm install
```
## Run
```
npx ts-node src/wc-rules.ts
npx ts-node src/wc-articles.ts
npx ts-node src/youtube-merge.ts
```
## Test
```
npx jest
```
with coverage:
```
npx jest --coverage
```
