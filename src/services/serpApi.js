const axios = require('axios');

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

function normalizeOrganicResults(organicResults = []) {
    return organicResults
        .filter((item) => item && item.link && item.title)
        .map((item, index) => ({
            position: Number.isFinite(item.position) ? item.position : index + 1,
            title: String(item.title || '').trim(),
            url: String(item.link || '').trim(),
            snippet: String(item.snippet || '').trim()
        }));
}

async function searchGoogleOrganic(query) {
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
        throw new Error('Missing SERPAPI_KEY in .env file.');
    }

    const response = await axios.get(SERPAPI_BASE_URL, {
        params: {
            engine: 'google',
            q: query,
            api_key: apiKey,
            num: 10,          // first page, usually 10
            hl: 'en',
            google_domain: 'google.com'
        },
        timeout: 15000
    });

    const data = response.data || {};

    const organicResults = Array.isArray(data.organic_results)
        ? data.organic_results
        : [];

    const results = normalizeOrganicResults(organicResults);

    return {
        query,
        results,
        source: 'serpapi',
        fetchedAt: new Date().toISOString()
    };
}

module.exports = {
    searchGoogleOrganic,
    normalizeOrganicResults
};