import { generateData } from './data-handling';
import { requestHeaders, assetPrefix } from './constants';

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

interface DownloadsApiResponse {
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

const jsonUrl = 'https://www.warhammer-community.com/api/search/downloads/';
const pageUrl = 'https://www.warhammer-community.com/en-gb/downloads/kill-team/';
const requestBody = {
    index: "downloads",
    searchTerm: "",
    locale: "en-gb",
    gameSystem: "kill-team",
    language: "british-english"
};
export const rssFileName = 'output/kill-team-downloads.xml';
export const rssTitle = 'Warhammer Community Kill Team Downloads';

export async function main() {
    await generateData<DownloadsApiResponse>({
        jsonUrl: jsonUrl,
        pageUrl: pageUrl,
        requestBody: requestBody,
        requestHeaders: requestHeaders,
        conversionFunction: (data) => data.hits.map(item => ({
            title: item.id.title,
            link: `${assetPrefix}${item.id.file}`,
            description: `${item.id.title} - Last updated: ${item.id.last_updated}${item.id.new ? ' (NEW)' : ''}`,
            pubDate: parseUKDate(item.id.last_updated).toUTCString()
        })),
        rssFileName: rssFileName,
        rssTitle: rssTitle,
        rssDescription: `Latest ${rssTitle} updates`
    });
}

if (require.main === module) {
    main();
}
