import axios from 'axios';
import fs from 'fs/promises';
import { generateRSSFeed } from './helper';

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

async function main() {
    try {
        const response = await axios.post<NewsApiResponse>(
            'https://www.warhammer-community.com/api/search/news/',
            {
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
            },
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.warhammer-community.com/en-gb/kill-team/',
                    'Origin': 'https://www.warhammer-community.com',
                    'Content-Type': 'application/json'
                }
            }
        );

        const articles = response.data.news.map(item => {
            const description = `<img src="https://assets.warhammer-community.com/${item.image.path}"/><p>${item.excerpt}}</p>`;
            const pubDate = parseUKDate(item.date);

            return {
                title: item.title,
                link: `https://www.warhammer-community.com${item.uri}`,
                description,
                pubDate: pubDate.toUTCString()
            };
        });

        const rssXml = await generateRSSFeed(
            articles,
            'https://www.warhammer-community.com/en-gb/kill-team/',
            'Warhammer Community Kill Team News',
            'Latest Kill Team news from Warhammer Community'
        );

        await fs.writeFile('kill-team-news.xml', rssXml);
        console.log('RSS feed generated successfully!');

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

main();