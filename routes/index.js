const express = require('express');
const router = express.Router();

const { search_movie, genre_search, country_search, get_detail, get_embed } = require('../controller/index');

// Root path
router.get('**', (req, res) => {
    res.json({
        author: 'navetacandra',
        github: 'https://github.com/navetacandra/indoxxi-api',
        message: 'see documentation in github.'
    });
});

// Detail path
router.get('/detail', get_detail);

// Get Embed path
router.get('/embed', get_embed);

// Search path
router.get('/search', search_movie);
router.get('/search/:keyword', search_movie);

// Genre Search path
router.get('/genre', genre_search);
router.get('/genre/:genre', genre_search);

// Country Search path
router.get('/country', country_search);
router.get('/country/:country', country_search);

module.exports = router;