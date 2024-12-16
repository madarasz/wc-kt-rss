import { PuppeteerCrawler, Dataset } from 'crawlee';
import fs from 'fs/promises';
import { RSSItem, generateRSSFeed, puppeteerSettings } from './helper';

const crawler = new PuppeteerCrawler({
    ...puppeteerSettings,
    
    async requestHandler({ page, request }) {
        console.log('### Loading Warhammer Community Downloads page');
        
        // Wait for the categories to be visible
        await page.waitForSelector('button[data-testid="downloads-accordionBtn"]');
        await page.screenshot({
            path: 'screenshot-wcd.png',
            fullPage: true
        });
        await page.$$eval('button[data-testid="downloads-accordionBtn"]', ($categories) => {
            $categories.forEach(($category) => {
                $category.click();
            })
        })
        
        const rules: RSSItem[] = [];
        
        // Extract articles using page.evaluate
        const extractedArticles = await page.evaluate(() => {
            const articleElements = document.querySelectorAll('div.shared-downloadCard');
            
            return Array.from(articleElements).map(article => {
                const titleEl = article.querySelector('div.p-15 a');
                const dateEl = article.querySelector('span.ml-5');
                
                return {
                    title: titleEl?.textContent?.trim() || '',
                    link: titleEl?.getAttribute('href') || '',
                    description: titleEl?.textContent?.trim() || '',
                    dateStr: dateEl?.textContent?.trim() || ''
                };
            });
        });
        
        console.log(`### Found ${extractedArticles.length} articles`);
        
        // Process the extracted articles
        for (const article of extractedArticles) {
            if (article.title && article.link && article.dateStr) {
                rules.push({
                    title: article.title,
                    link: article.link,
                    description: `Rules update - ${article.dateStr} - ${article.description}` || '',
                    pubDate: parseDate(article.dateStr),
                });
            }
        }
        
        // Save to dataset for processing
        await Dataset.pushData({
            url: request.url,
            rules
        });
    }
});

function parseDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    
    // Create date string in ISO format: YYYY-MM-DD
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Convert to UTC string for RSS feed
    return new Date(isoDate).toUTCString();
}

async function main() {
    const url = 'https://www.warhammer-community.com/en-gb/downloads/kill-team/';
    await crawler.run([url]);
    
    const dataset = await Dataset.open();
    const { rules } = (await dataset.getData()).items[0] as { rules: RSSItem[] };
    const rssXml = await generateRSSFeed(rules, url, 'Kill Team rules', 'Kill Team rules');
    await fs.writeFile('kill-team-downloads.xml', rssXml);
    
    console.log('RSS feed generated successfully!');
}

main().catch(console.error);