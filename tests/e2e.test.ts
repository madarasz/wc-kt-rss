import { promises as fs } from 'fs';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { main, rssFileName, rssTitle, assetPrefix } from '../wc-articles';  // You'll need to export main
import { RSSFeed } from '../helper';

const parseXml = promisify(parseString);

describe('Warhammer Community Articles RSS Generator E2E', () => {
    it('should generate valid RSS feed with at least 5 articles', async () => {
        // Clean up any existing file first
        try {
            await fs.unlink(rssFileName);
        } catch (error) {
            // Ignore error if file doesn't exist
        }

        // Run the main function
        await main();

        // Read the generated file
        const rssContent = await fs.readFile(rssFileName, 'utf-8');
        
        // Parse the XML
        const result = await parseXml(rssContent) as RSSFeed;
        
        // Basic RSS structure checks
        expect(result.rss).toBeDefined();
        expect(result.rss.channel).toBeDefined();
        
        // Check channel metadata
        const channel = result.rss.channel[0];
        expect(channel.title[0]).toBe(rssTitle);
        
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
        expect(firstItem.link[0]).toMatch(/^https:\/\/www\.warhammer-community\.com/);
        expect(firstItem.description[0]).toMatch(new RegExp(`<img src="${assetPrefix}`));
    }, 30000);  // Increase timeout to 30s for network request
});