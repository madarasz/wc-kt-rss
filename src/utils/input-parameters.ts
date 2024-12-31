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
