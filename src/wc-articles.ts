import { assetPrefix, baseUrl, requestHeaders } from './utils/constants';
import { generateData } from './utils/data-handling'
import { NewsApiResponse } from './utils/input-parameters';
import { parseMonthWithLettersDate } from './utils/parse-date';

const jsonUrl = 'https://www.warhammer-community.com/api/search/news/';
const requestBody = {
    "sortBy": "date_desc",
    "category": "",
    "collections": [
        "articles",
        "videos"
    ],
    "game_systems": [
        "kill-team"
    ],
    "index": "news",
    "locale": "en-gb",
    "page": 0,
    "perPage": 12,
    "topics": []
};
const pageUrl = 'https://www.warhammer-community.com/en-gb/kill-team/';
export const rssTitle = 'Warhammer Community Kill Team News';
export const rssFileName = 'output/kill-team-news.xml';

export async function main() {
    await generateData<NewsApiResponse>({
        jsonUrl: jsonUrl,
        pageUrl: pageUrl,
        requestBody: requestBody,
        requestHeaders: requestHeaders,
        conversionFunction: (data) => data.news.map(item => ({
            title: item.title,
            link: `${baseUrl}${item.uri}`,
            description: `<img src="${assetPrefix}${item.image.path}"/><p>${item.excerpt}}</p>`,
            pubDate: parseMonthWithLettersDate(item.date).toUTCString()
        })),
        rssFileName: rssFileName,
        rssTitle: rssTitle,
        rssDescription: `Latest ${rssTitle} articles`
    });
}

if (require.main === module) {
    main();
}