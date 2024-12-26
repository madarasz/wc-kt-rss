import axios from 'axios';
import fs from 'fs/promises';
import { generateRSSFeed } from './helper';

interface KillTeamDownload {
    title: string;
    game_systems: string;
    download_languages: string;
    download_categories: {
        slug: string;
        order: number | null;
        open_by_default: boolean;
        title: string;
    }[];
    topics: string[];
    locale: string;
    date: number | string;
    id: {
        title: string;
        slug: string;
        file: string;
        file_size: string;
        last_updated: string;
        new: boolean;
    };
}

interface ApiResponse {
    hits: KillTeamDownload[];
    totalHits: number;
    totalPages: number;
}

function parseUKDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
    // Create date in UTC directly
    const date = new Date(Date.UTC(year, month - 1, day, 9, 0, 0));
    return date;
}

async function main() {
    try {
        const response = await axios.post<ApiResponse>(
            'https://www.warhammer-community.com/api/search/downloads/',
            {
                index: "downloads",
                searchTerm: "",
                locale: "en-gb",
                gameSystem: "kill-team",
                language: "british-english"
            },
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.warhammer-community.com/en-gb/downloads/kill-team/',
                    'Origin': 'https://www.warhammer-community.com',
                    'Content-Type': 'application/json'
                }
            }
        );

        const articles = response.data.hits.map(item => ({
            title: item.id.title,
            link: `https://assets.warhammer-community.com/${item.id.file}`,
            description: `${item.id.title} - Last updated: ${item.id.last_updated}${item.id.new ? ' (NEW)' : ''}`,
            pubDate: parseUKDate(item.id.last_updated).toUTCString()
        }));

        const rssXml = await generateRSSFeed(
            articles,
            'https://www.warhammer-community.com/en-gb/downloads/kill-team/',
            'Warhammer Community Kill Team Downloads',
            'Latest Kill Team downloads from Warhammer Community'
        );

        await fs.writeFile('kill-team-downloads.xml', rssXml);
        console.log('RSS feed generated successfully!');

    } catch (error: any) {
        if (error?.response) {  // Axios error with response
            console.error('Error fetching data:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        } else if (error?.request) {  // Axios error without response
            console.error('Error making request:', error.message);
        } else {  // Non-Axios error
            console.error('Error:', error);
        }
    }
}

main();