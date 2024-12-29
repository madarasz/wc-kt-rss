import axios from 'axios';
import fs from 'fs/promises';
import { generateRSSFeed, RSSItem } from './helper';

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
export const baseUrl = 'https://www.warhammer-community.com';
const requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': pageUrl,
    'Origin': baseUrl,
    'Content-Type': 'application/json'
};
export const assetPrefix = 'https://assets.warhammer-community.com/';
export const rssTitle = 'Warhammer Community Kill Team News';
export const rssFileName = 'kill-team-news.xml';

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

function articleToRSSItem(item: NewsArticle): RSSItem {
    const description = `<img src="${assetPrefix}${item.image.path}"/><p>${item.excerpt}}</p>`;
    const pubDate = parseUKDate(item.date);

    return {
        title: item.title,
        link: `${baseUrl}${item.uri}`,
        description,
        pubDate: pubDate.toUTCString()
    };
}

interface RSSGenerationParameters {
    jsonUrl: string;
    pageUrl: string;
    requestBody: Object;
    requestHeaders: Object;
    conversionFunction: Function;
    rssFileName: string;
    rssTitle: string;
    rssDescription: string;
}

export async function generateNewsRSS(params: RSSGenerationParameters) {
    try {
        const response = await axios.post<NewsApiResponse>(
            params.jsonUrl,
            params.requestBody,
            {
                headers: params.requestHeaders
            }
        );

        const articles = response.data.news.map(item => params.conversionFunction(item));

        const rssXml = await generateRSSFeed(
            articles,
            params.pageUrl,
            params.rssTitle,
            params.rssDescription
        );

        await fs.writeFile(params.rssFileName, rssXml);
        console.log(`${params.rssTitle} RSS feed generated successfully!`);

    } catch (error: any) {
        if (error?.response) {
            console.error('Error fetching data:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        } else if (error?.request) {
            console.error('Error making request:', error.message);
        } else {
            console.error('Error:', error);
        }
    }
}

export async function main() {
    await generateNewsRSS({
        jsonUrl: jsonUrl,
        pageUrl: pageUrl,
        requestBody: requestBody,
        requestHeaders: requestHeaders,
        conversionFunction: articleToRSSItem,
        rssFileName: rssFileName,
        rssTitle: rssTitle,
        rssDescription: `Latest ${rssTitle} articles`
    });
}

if (require.main === module) {
    main();
}