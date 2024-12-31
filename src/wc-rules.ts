import { generateData } from './utils/data-handling';
import { requestHeaders, assetPrefix } from './utils/constants';
import { parseNumericDate } from './utils/parse-date';
import { DownloadsApiResponse } from './utils/input-parameters';

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
            pubDate: parseNumericDate(item.id.last_updated).toUTCString()
        })),
        rssFileName: rssFileName,
        rssTitle: rssTitle,
        rssDescription: `Latest ${rssTitle} updates`
    });
}

if (require.main === module) {
    main();
}
