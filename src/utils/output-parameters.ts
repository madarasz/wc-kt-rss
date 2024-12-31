// RSS feed structure
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
