import { PuppeteerCrawler, Dataset } from 'crawlee';
import fs from 'fs/promises';
import { RSSItem, generateRSSFeed, puppeteerSettings, skipResources } from './helper';

const crawler = new PuppeteerCrawler({
    ...puppeteerSettings,
    
    async requestHandler({ page, request }) {
        console.log('### Loading Goonhammer Articles page');
        await skipResources(page);
        
        // Wait for the news grid to be visible
        await page.waitForSelector('div.td_module_1');
        await page.screenshot({
            path: 'screenshot-gh.png',
            fullPage: true
        });
        
        const articles: RSSItem[] = [];
        
        // Extract articles using page.evaluate
        const extractedArticles = await page.evaluate(() => {
            const articleElements = document.querySelectorAll('div.td_module_1');
            
            return Array.from(articleElements).map(article => {
                const titleEl = article.querySelector('h3 a');
                const dateEl = article.querySelector('time.entry-date');
                const imgEl = article.querySelector('img.entry-thumb');
                
                return {
                    title: titleEl?.textContent?.trim() || '',
                    link: titleEl?.getAttribute('href') || '',
                    description: titleEl?.textContent?.trim() || '',
                    dateStr: dateEl?.getAttribute('datetime') || '',
                    image: imgEl?.getAttribute('data-src') || ''
                };
            });
        });
        
        console.log(`### Found ${extractedArticles.length} articles`);
        
        // Process the extracted articles
        for (const article of extractedArticles) {
            if (article.title && article.link && article.dateStr) {
                if (article.image) {
                    article.description = `<img src="${article.image}"/><p>${article.description}</p>`
                }
                articles.push({
                    title: article.title,
                    link: article.link,
                    description: article.description,
                    pubDate: new Date(article.dateStr).toUTCString(),
                });
            }
        }
        
        // Save to dataset for processing
        await Dataset.pushData({
            url: request.url,
            articles
        });
    }
});

async function main() {
    const url = 'https://www.goonhammer.com/killteam/';
    await crawler.run([url]);
    
    const dataset = await Dataset.open();
    const { articles } = (await dataset.getData()).items[0] as { articles: RSSItem[] };
    
    const rssXml = await generateRSSFeed(articles, url, 'Goonhammer Kill Team news', 'Goonhammer Kill Team news');
    await fs.writeFile('goonhammer-news.xml', rssXml);
    
    console.log('RSS feed generated successfully!');
}

main().catch(console.error);