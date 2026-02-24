const express = require('express');
const { searchGoogleOrganic } = require('../services/serpApi');

const router = express.Router();

router.get('/search', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!q) {
        return res.status(400).json({
            error: 'Missing search request.'
        });
    }

    // if (q.length > 200) {
    //     return res.status(400).json({
    //         error: 'Too long request.'
    //     });
    // }

    try {
        const payload = await searchGoogleOrganic(q);

        return res.json({
            query: payload.query,
            results: payload.results
        });
    } catch (error) {
        console.error('Search route error:', error.message);

        if (error.response) {
            return res.status(502).json({
                error: 'Could not get results from external API.'
            });
        }

        return res.status(500).json({
            error: error.message || 'Internal server error.'
        });
    }
});

module.exports = router;