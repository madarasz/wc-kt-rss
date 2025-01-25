import axios from 'axios';
import { fetchFeed, combinedFeedTemplate } from '../src/youtube-merge';

jest.mock('axios');
jest.mock('fs/promises');

const mockFeed = {
  feed: {
    link: [{ '@_rel': 'self', '@_href': 'test-url' }],
    id: 'test-channel',
    'yt:channelId': 'test123',
    title: 'Test Channel',
    author: {
      name: 'Test Author',
      uri: 'test-uri'
    },
    published: '2024-01-01T00:00:00Z',
    entry: [{
      id: 'video1',
      'yt:videoId': 'abc123',
      'yt:channelId': 'test123',
      title: 'Test Video',
      link: { '@_rel': 'alternate', '@_href': 'test-video-url' },
      author: {
        name: 'Test Author',
        uri: 'test-uri'
      },
      published: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      'media:group': {
        'media:title': 'Test Video',
        'media:content': {
          '@_url': 'test-content-url',
          '@_type': 'video/mp4',
          '@_width': '1920',
          '@_height': '1080'
        },
        'media:thumbnail': {
          '@_url': 'test-thumb-url',
          '@_width': '480',
          '@_height': '360'
        },
        'media:description': 'Test description',
        'media:community': {
          'media:starRating': {
            '@_count': '100',
            '@_average': '5.0',
            '@_min': '1',
            '@_max': '5'
          },
          'media:statistics': {
            '@_views': '1000'
          }
        }
      }
    }]
  }
};

describe('YouTube RSS Feed Combiner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchFeed', () => {
    it('should fetch and parse RSS feed successfully', async () => {
      const mockResponse = { data: '<feed>test</feed>' };
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      await fetchFeed('test-url');
      
      expect(axios.get).toHaveBeenCalledWith('test-url');
    });

    it('should throw error on failed fetch', async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      await expect(fetchFeed('test-url')).rejects.toThrow('Network error');
    });
  });

  describe('combinedFeedTemplate', () => {
    it('should combine multiple feeds correctly', () => {
      const feeds = [mockFeed, mockFeed];
      const result = combinedFeedTemplate(feeds);

      expect(result.feed.entry).toHaveLength(2);
      expect(result.feed.title).toBe('Combined YouTube Feeds');
    });

    it('should sort entries by published date', () => {
      const feed1 = JSON.parse(JSON.stringify(mockFeed));
      const feed2 = JSON.parse(JSON.stringify(mockFeed));
      
      feed1.feed.entry[0].published = '2024-01-01T00:00:00Z';
      feed2.feed.entry[0].published = '2024-01-02T00:00:00Z';
      
      const result = combinedFeedTemplate([feed1, feed2]);
      
      expect(new Date(result.feed.entry[0].published).getTime())
        .toBeGreaterThan(new Date(result.feed.entry[1].published).getTime());
    });

    it('should return null for empty feeds array', () => {
      const result = combinedFeedTemplate([]);
      expect(result).toBeNull();
    });
  });
});