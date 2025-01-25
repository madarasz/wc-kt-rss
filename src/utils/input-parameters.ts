// Warhammer Community Articles
interface NewsArticle {
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    uri: string;
    collection: 'articles' | 'videos';
    topics: { title: string; slug: string; }[];
    image: {
        path: string;
    };
}

export interface NewsApiResponse {
    news: NewsArticle[];
    paginate: {
        total_items: number;
        items_per_page: number;
        total_pages: number;
        current_page: number;
    };
}

// Warhammer Community Downloads
interface KillTeamDownload {
    title: string;
    game_systems: string;
    download_languages: string;
    download_categories: {
        slug: string;
        order: number | null;
        open_by_default: boolean;
        title: string;
    }[];
    topics: string[];
    locale: string;
    date: number | string;
    id: {
        title: string;
        slug: string;
        file: string;
        file_size: string;
        last_updated: string;
        new: boolean;
    };
}

export interface DownloadsApiResponse {
    hits: KillTeamDownload[];
    totalHits: number;
    totalPages: number;
}

// Youtube
export interface YTFeed {
    feed: {
        link: Array<{
            '@_rel': string;
            '@_href': string;
        }>;
        id: string;
        'yt:channelId': string;
        title: string;
        author: {
            name: string;
            uri: string;
        };
        published: string;
        entry: Array<YTEntry>;
    };
}

export interface YTEntry {
    id: string;
    'yt:videoId': string;
    'yt:channelId': string;
    title: string;
    link: {
        '@_rel': string;
        '@_href': string;
    };
    author: {
        name: string;
        uri: string;
    };
    published: string;
    updated: string;
    'media:group': {
        'media:title': string;
        'media:content': {
            '@_url': string;
            '@_type': string;
            '@_width': string;
            '@_height': string;
        };
        'media:thumbnail': {
            '@_url': string;
            '@_width': string;
            '@_height': string;
        };
        'media:description': string;
        'media:community': {
            'media:starRating': {
                '@_count': string;
                '@_average': string;
                '@_min': string;
                '@_max': string;
            };
            'media:statistics': {
                '@_views': string;
            };
        };
    };
}