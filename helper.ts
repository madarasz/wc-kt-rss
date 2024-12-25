import { create } from 'xmlbuilder2';
import { PuppeteerCrawlerOptions } from 'crawlee';
import { Page } from 'puppeteer';

export interface RSSItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    imgSrc?: string;
}

export const puppeteerSettings: PuppeteerCrawlerOptions = { 
    launchContext: {
        launcher: require('puppeteer-firefox'),
        launchOptions: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--memory-pressure-off',
                '--single-process',
                '--max-old-space-size=256'
            ]
        }
    },
    maxRequestsPerCrawl: 1
}

export async function generateRSSFeed(articles: RSSItem[], url: string, title: string, description: string) {
    const feed = create({ version: '1.0' })
        .ele('rss', { version: '2.0' })
            .ele('channel')
                .ele('title').txt(title).up()
                .ele('link').txt(url).up()
                .ele('description').txt(description).up();

    articles.forEach(article => {
        feed.ele('channel')
            .ele('item')
                .ele('title').txt(article.title).up()
                .ele('link').txt(article.link).up()
                .ele('description').txt(article.description).up()
                .ele('pubDate').txt(article.pubDate).up()
            .up();
    });

    return feed.end({ prettyPrint: true });
}

export async function skipResources(page: Page) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
            req.abort();
        } else {
            req.continue();
        }
    });
}