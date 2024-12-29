import { create } from 'xmlbuilder2';

export interface RSSItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
}

interface RSSChannel {
    title: string[];
    link: string[];
    description: string[];
    channel: Array<{
        item: RSSItem[];
    }>;
}

export interface RSSFeed {
    rss: {
        channel: RSSChannel[];
    };
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