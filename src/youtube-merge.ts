import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import fs from 'fs/promises';
import { YTFeed, YTEntry } from './utils/input-parameters';
import yaml from 'js-yaml';

export const youtubeOutputFile = 'output/kt-combined-youtube.xml';
const youtubeConfigFile = 'yt-channels.yml';

async function loadConfig(): Promise<string[]> {
    const configFile = await fs.readFile(youtubeConfigFile, 'utf8');
    const config = yaml.load(configFile) as { channels: string[] };
    return config.channels;
  }

const XML_PARSER_OPTIONS = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
};

export async function fetchFeed(url: string): Promise<YTFeed> {
    try {
        const response = await axios.get<string>(url);
        const parser = new XMLParser(XML_PARSER_OPTIONS);
        return parser.parse(response.data);
    } catch (error) {
        console.error(`Error fetching feed from ${url}:`, error);
        throw error;
    }
}

export function combinedFeedTemplate(feeds: YTFeed[]): any {
    if (feeds.length === 0) return null;
    const allEntries: YTEntry[] = feeds.flatMap(feed => feed.feed.entry);

    // Sort entries by published date, newest first
    allEntries.sort((a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime()
    );

    return {
        feed: {
            '@_xmlns:yt': 'http://www.youtube.com/xml/schemas/2015',
            '@_xmlns:media': 'http://search.yahoo.com/mrss/',
            '@_xmlns': 'http://www.w3.org/2005/Atom',
            link: {
                '@_rel': 'self',
                '@_href': 'combined-youtube-feed'
            },
            id: 'combined-youtube-feed',
            title: 'Combined YouTube Feeds',
            updated: new Date().toISOString(),
            entry: allEntries
        }
    };
}

export async function main() {
    try {
        const channels = await loadConfig();
        const feeds = await Promise.all(
            channels.map(url => fetchFeed(url))
        );

        const combinedFeed = combinedFeedTemplate(feeds);
        const builder = new XMLBuilder({
            ignoreAttributes: false,
            format: true,
            attributeNamePrefix: '@_'
        });

        const xmlContent = builder.build(combinedFeed);
        await fs.writeFile(youtubeOutputFile, xmlContent);
        console.log(`Combined feed written to ${youtubeOutputFile}`);
    } catch (error) {
        console.error('Error combining feeds:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}