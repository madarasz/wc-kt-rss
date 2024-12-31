import axios from 'axios';
import fs from 'fs/promises';
import { create } from 'xmlbuilder2';
import { generateData, generateRSSFeed, RSSGenerationParameters } from '../src/utils/data-handling';
import { RSSItem } from '../src/utils/output-parameters';

type AxiosResponse<T = any> = {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
};

// Mock external dependencies
jest.mock('axios');
jest.mock('fs/promises');
jest.mock('xmlbuilder2');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('RSS Generator', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateRSSFeed', () => {
        it('should generate RSS XML with correct structure', async () => {
            const mockCreate = create as jest.MockedFunction<typeof create>;
            const mockElement = {
                ele: jest.fn().mockReturnThis(),
                txt: jest.fn().mockReturnThis(),
                up: jest.fn().mockReturnThis(),
                end: jest.fn().mockReturnValue('<rss>test</rss>')
            };
            mockCreate.mockReturnValue(mockElement as any);

            const articles: RSSItem[] = [{
                title: 'Test Article',
                link: 'https://test.com/article',
                description: 'Test Description',
                pubDate: 'Thu, 01 Jan 2024 09:00:00 GMT'
            }];

            await generateRSSFeed(articles, 'https://test.com', 'Test Feed', 'Test Description');

            // Verify RSS structure creation
            expect(mockCreate).toHaveBeenCalledWith({ version: '1.0' });
            expect(mockElement.ele).toHaveBeenCalledWith('rss', { version: '2.0' });
            expect(mockElement.ele).toHaveBeenCalledWith('channel');
            expect(mockElement.ele).toHaveBeenCalledWith('lastBuildDate');
        });
    });

    describe('generateData', () => {
        const mockParams: RSSGenerationParameters<{ data: string }> = {
            jsonUrl: 'https://api.test.com',
            pageUrl: 'https://test.com',
            requestBody: { test: true },
            requestHeaders: { 'Content-Type': 'application/json' },
            conversionFunction: (data) => [{
                title: data.data,
                link: 'https://test.com',
                description: 'Test',
                pubDate: new Date().toUTCString()
            }],
            rssFileName: 'test.xml',
            rssTitle: 'Test RSS',
            rssDescription: 'Test Description'
        };

        it('should fetch data and generate RSS file', async () => {
            const mockApiResponse: AxiosResponse = {
                data: { data: 'Test Data' },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            };

            mockAxios.post.mockResolvedValue(mockApiResponse);

            await generateData(mockParams);

            expect(mockAxios.post).toHaveBeenCalledWith(
                mockParams.jsonUrl,
                mockParams.requestBody,
                { headers: mockParams.requestHeaders }
            );

            expect(fs.writeFile).toHaveBeenCalledWith(
                mockParams.rssFileName,
                expect.any(String)
            );
        });

        it('should handle API error with response', async () => {
            const consoleSpy = jest.spyOn(console, 'error');
            const mockError = {
                response: {
                    status: 404,
                    statusText: 'Not Found',
                    data: 'Error data'
                }
            };

            mockAxios.post.mockRejectedValue(mockError);

            await generateData(mockParams);

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error fetching data:',
                expect.objectContaining({
                    status: 404,
                    statusText: 'Not Found'
                })
            );
        });

        it('should handle API error without response', async () => {
            const consoleSpy = jest.spyOn(console, 'error');
            const mockError = {
                request: {},
                message: 'Network Error'
            };

            mockAxios.post.mockRejectedValue(mockError);

            await generateData(mockParams);

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error making request:',
                'Network Error'
            );
        });

        it('should handle generic error', async () => {
            const consoleSpy = jest.spyOn(console, 'error');
            const mockError = new Error('Generic Error');

            mockAxios.post.mockRejectedValue(mockError);

            await generateData(mockParams);

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error:',
                expect.any(Error)
            );
        });
    });
});