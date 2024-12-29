import { assetPrefix, baseUrl, requestHeaders } from './constants';
import { generateData } from './data-handling'

interface NewsArticle {
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    uri: string;
    collection: 'articles' | 'videos';
    topics: { title: string; slug: string; }[];
    image: {
        path: string;
    }
}

interface NewsApiResponse {
    news: NewsArticle[];
    paginate: {
        total_items: number;
        items_per_page: number;
        total_pages: number;
        current_page: number;
    };
}

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

function parseUKDate(dateStr: string): Date {
    // Format is like "13 Dec 24"
    const [day, month, year] = dateStr.split(' ');
    const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const date = new Date(Date.UTC(2000 + parseInt(year), months[month], parseInt(day), 9, 0, 0));
    return date;
}

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
            pubDate: parseUKDate(item.date).toUTCString()
        })),
        rssFileName: rssFileName,
        rssTitle: rssTitle,
        rssDescription: `Latest ${rssTitle} articles`
    });
}

if (require.main === module) {
    main();
}