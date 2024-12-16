import { PuppeteerCrawler, Dataset } from 'crawlee';
import fs from 'fs/promises';
import { RSSItem, generateRSSFeed, puppeteerSettings } from './helper';

const crawler = new PuppeteerCrawler({
    ...puppeteerSettings,
    
    async requestHandler({ page, request }) {
        console.log('### Loading Warhammer Community Articles page');
        
        // Wait for the news grid to be visible
        await page.waitForSelector('section.shared-newsGridThree article');
        await page.screenshot({
            path: 'screenshot-wc.png',
            fullPage: true
        });
        
        const articles: RSSItem[] = [];
        
        // Extract articles using page.evaluate
        const extractedArticles = await page.evaluate(() => {
            const articleElements = document.querySelectorAll('section.shared-newsGridThree article');
            
            return Array.from(articleElements).map(article => {
                const titleEl = article.querySelector('div > a h3');
                const linkEl = article.querySelector('div > a');
                const dateEl = article.querySelector('time.whitespace-nowrap');
                const imgEl = article.querySelector('figure > img');
                
                return {
                    title: titleEl?.textContent?.trim().split(/ [|]+ /)[0] || '',
                    link: linkEl?.getAttribute('href') || '',
                    description: titleEl?.textContent?.trim(),
                    dateStr: dateEl?.textContent?.trim() || '',
                    image: imgEl?.getAttribute('src') || ''
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
                    link: 'https://www.warhammer-community.com' + article.link,
                    description: article.description || '',
                    pubDate: parseDate(article.dateStr),
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

function parseDate(dateStr: string): string {
    const [day, month, year] = dateStr.split(' ');
    
    const months: { [key: string]: string } = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const fullYear = `20${year}`;
    const isoDate = `${fullYear}-${months[month]}-${day.padStart(2, '0')}`;
    // console.log(`*** isodate: ${isoDate}, datestr: ${dateStr}`)
    
    return new Date(isoDate).toUTCString();
}

async function main() {
    const url = 'https://www.warhammer-community.com/en-gb/setting/kill-team/';
    await crawler.run([url]);
    
    const dataset = await Dataset.open();
    const { articles } = (await dataset.getData()).items[0] as { articles: RSSItem[] };
    
    const rssXml = await generateRSSFeed(articles, url, 'Warhammer Community Kill Team news', 'Warhammer Community Kill Team news');
    await fs.writeFile('kill-team-news.xml', rssXml);
    
    console.log('RSS feed generated successfully!');
}

main().catch(console.error);