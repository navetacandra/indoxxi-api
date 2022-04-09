const express = require('express');
const router = express.Router();

const { search_movie, genre_search, country_search, get_detail } = require('../controller/index');

// Root path
router.get('/', (req, res) => {
    res.send('ok');
});

// Detail path
router.get('/detail', get_detail);

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