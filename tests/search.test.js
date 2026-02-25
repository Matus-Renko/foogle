const request = require('supertest');
const express = require('express');

const serpApiService = require('../src/services/serpApi');
const searchRouter = require('../src/routes/search');

function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use('/api', searchRouter);
    return app;
}

describe('GET /api/search', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns 400 when query param q is missing', async () => {
        const app = createTestApp();

        const res = await request(app).get('/api/search');

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: 'Missing search request.'
        });
    });

    it('returns normalized payload from service', async () => {
        const app = createTestApp();

        vi.spyOn(serpApiService, 'searchGoogleOrganic').mockResolvedValue({
            query: 'kubernetes vs docker',
            results: [
                {
                    position: 1,
                    title: 'Example result',
                    url: 'https://example.com',
                    snippet: 'Example snippet'
                }
            ],
            source: 'serpapi',
            fetchedAt: '2026-02-25T12:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/search')
            .query({ q: 'kubernetes vs docker' });

        expect(serpApiService.searchGoogleOrganic).toHaveBeenCalledWith('kubernetes vs docker');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            query: 'kubernetes vs docker',
            results: [
                {
                    position: 1,
                    title: 'Example result',
                    url: 'https://example.com',
                    snippet: 'Example snippet'
                }
            ]
        });
    });

    it('returns 502 when external API error is detected (error.response exists)', async () => {
        const app = createTestApp();

        const error = new Error('External API failed');
        error.response = { status: 500 };

        vi.spyOn(serpApiService, 'searchGoogleOrganic').mockRejectedValue(error);

        const res = await request(app)
            .get('/api/search')
            .query({ q: 'test' });

        expect(res.status).toBe(502);
        expect(res.body).toEqual({
            error: 'Could not get results from external API.'
        });
    });

    it('returns 500 for generic internal error', async () => {
        const app = createTestApp();

        vi.spyOn(serpApiService, 'searchGoogleOrganic').mockRejectedValue(new Error('Missing SERPAPI_KEY in .env file.'));

        const res = await request(app)
            .get('/api/search')
            .query({ q: 'test' });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            error: 'Missing SERPAPI_KEY in .env file.'
        });
    });
});