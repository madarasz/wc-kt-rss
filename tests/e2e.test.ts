import { promises as fs } from 'fs';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { main as articlesMain, rssFileName as articlesRssFileName, rssTitle as articlesRssTitle} from '../src/wc-articles';
import { main as rulesMain, rssFileName as rulesRssFileName, rssTitle as rulesRssTitle} from '../src/wc-rules';
import { main as youtubeMain, youtubeOutputFile } from '../src/youtube-merge';
import { assetPrefix, baseUrl } from '../src/utils/constants';
import { RSSFeed } from '../src/utils/output-parameters';
import { YTFeed } from '../src/utils/input-parameters';

const parseXml = promisify(parseString);

describe('Warhammer Community Articles RSS Generator E2E', () => {
    it('should generate valid RSS feed with at least 5 articles', async () => {
        // Clean up any existing file first
        try {
            await fs.unlink(articlesRssFileName);
        } catch (error) {
            // Ignore error if file doesn't exist
        }

        // Run the main function
        await articlesMain();

        // Read the generated file
        const rssContent = await fs.readFile(articlesRssFileName, 'utf-8');
        
        // Parse the XML
        const result = await parseXml(rssContent) as RSSFeed;
        
        // Basic RSS structure checks
        expect(result.rss).toBeDefined();
        expect(result.rss.channel).toBeDefined();
        
        // Check channel metadata
        const channel = result.rss.channel[0];
        expect(channel.title[0]).toBe(articlesRssTitle);
        
        // Check items
        const items = channel.channel.map(ch => ch.item[0]);
        expect(items.length).toBeGreaterThanOrEqual(5);
        
        // Check first item structure
        const firstItem = items[0];
        expect(firstItem.title).toBeDefined();
        expect(firstItem.link).toBeDefined();
        expect(firstItem.description).toBeDefined();
        expect(firstItem.pubDate).toBeDefined();
        
        // Check item content
        expect(firstItem.link[0]).toMatch(new RegExp(baseUrl));
        expect(firstItem.description[0]).toMatch(new RegExp(`<img src="${assetPrefix}`));
    }, 30000);  // Increase timeout to 30s for network request
});

describe('Warhammer Community Downloads RSS Generator E2E', () => {
    it('should generate valid RSS feed with at least 5 articles', async () => {
        // Clean up any existing file first
        try {
            await fs.unlink(rulesRssFileName);
        } catch (error) {
            // Ignore error if file doesn't exist
        }

        // Run the main function
        await rulesMain();

        // Read the generated file
        const rssContent = await fs.readFile(rulesRssFileName, 'utf-8');
        
        // Parse the XML
        const result = await parseXml(rssContent) as RSSFeed;
        
        // Basic RSS structure checks
        expect(result.rss).toBeDefined();
        expect(result.rss.channel).toBeDefined();
        
        // Check channel metadata
        const channel = result.rss.channel[0];
        expect(channel.title[0]).toBe(rulesRssTitle);
        
        // Check items
        const items = channel.channel.map(ch => ch.item[0]);
        expect(items.length).toBeGreaterThanOrEqual(5);
        
        // Check first item structure
        const firstItem = items[0];
        expect(firstItem.title).toBeDefined();
        expect(firstItem.link).toBeDefined();
        expect(firstItem.description).toBeDefined();
        expect(firstItem.pubDate).toBeDefined();
        
        // Check item content
        expect(firstItem.link[0]).toMatch(new RegExp(assetPrefix));
    }, 30000);  // Increase timeout to 30s for network request
});

describe('Youtube RSS merger E2E', () => {
    it('should generate valid RSS feed with at least 5 items', async () => {
        // Clean up any existing file first
        try {
            await fs.unlink(youtubeOutputFile);
        } catch (error) {
            // Ignore error if file doesn't exist
        }

        // Run the main function
        await youtubeMain();

        // Read the generated file
        const rssContent = await fs.readFile(youtubeOutputFile, 'utf-8');

        // Parse the XML
        const result = await parseXml(rssContent) as YTFeed;
        
        // Basic RSS structure checks
        expect(result.feed).toBeDefined();
        expect(result.feed.entry).toBeDefined();
        
        // Check feed metadata
        const feed = result.feed;
        expect(feed.title).toBeDefined();
        
        // Check items
        expect(feed.entry.length).toBeGreaterThanOrEqual(5);
        
        // Check first item structure
        const firstItem = feed.entry[0];
        expect(firstItem.title).toBeDefined();
        expect(firstItem.link).toBeDefined();
    })
});