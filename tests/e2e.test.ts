import { promises as fs } from 'fs';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { generateNewsRSS } from '../wc-articles';  // You'll need to export main
import { RSSFeed } from '../helper';

const parseXml = promisify(parseString);

describe('Warhammer Community Articles RSS Generator E2E', () => {
    it('should generate valid RSS feed with at least 5 articles', async () => {
        // Clean up any existing file first
        try {
            await fs.unlink('kill-team-news.xml');
        } catch (error) {
            // Ignore error if file doesn't exist
        }

        // Run the main function
        await generateNewsRSS();

        // Read the generated file
        const rssContent = await fs.readFile('kill-team-news.xml', 'utf-8');
        
        // Parse the XML
        const result = await parseXml(rssContent) as RSSFeed;
        
        // Basic RSS structure checks
        expect(result.rss).toBeDefined();
        expect(result.rss.channel).toBeDefined();
        
        // Check channel metadata
        const channel = result.rss.channel[0];
        expect(channel.title[0]).toBe('Warhammer Community Kill Team News');
        
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
        expect(firstItem.description[0]).toMatch(/<img src="https:\/\/assets\.warhammer-community\.com/);
    }, 30000);  // Increase timeout to 30s for network request
});