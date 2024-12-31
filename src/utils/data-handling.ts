import { create } from 'xmlbuilder2';
import axios from 'axios';
import fs from 'fs/promises';
import { RSSItem } from './output-parameters';

export interface RSSGenerationParameters<T> {
    jsonUrl: string;
    pageUrl: string;
    requestBody: Object;
    requestHeaders: Object;
    conversionFunction: (data: T) => Array<RSSItem>;
    rssFileName: string;
    rssTitle: string;
    rssDescription: string;
}

export async function generateData<T>(params: RSSGenerationParameters<T>) {
    try {
        const response = await axios.post<T>(
            params.jsonUrl,
            params.requestBody,
            {
                headers: params.requestHeaders
            }
        );

        const articles = params.conversionFunction(response.data);

        const rssXml = await generateRSSFeed(
            articles,
            params.pageUrl,
            params.rssTitle,
            params.rssDescription
        );

        await fs.writeFile(params.rssFileName, rssXml);
        console.log(`${params.rssTitle} RSS feed generated successfully!`);

    } catch (error: any) {
        if (error?.response) {
            console.error('Error fetching data:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        } else if (error?.request) {
            console.error('Error making request:', error.message);
        } else {
            console.error('Error:', error);
        }
    }
}

export async function generateRSSFeed(articles: RSSItem[], url: string, title: string, description: string) {
    const feed = create({ version: '1.0' })
        .ele('rss', { version: '2.0' })
            .ele('channel')
                .ele('title').txt(title).up()
                .ele('link').txt(url).up()
                .ele('description').txt(description).up()
                .ele('lastBuildDate').txt(new Date().toUTCString()).up();

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