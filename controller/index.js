const Helper = require('../helper/index');
const helper = new Helper();

// Search controller
const search_movie = async function (req, res) {
    let keyword = req.params.keyword;

    if(keyword) {
        let result = await helper.get_all_pagination_result('search', { keyword: keyword });
        res.json({
            status: 'success',
            keyword: keyword,
            result: result
        });
    } else {
        res.json({
            status: 'error',
            message: 'no keyword'
        });
    }
}

// Genre controller
const genre_search = async function (req, res) {
    let genre = req.params.genre;

    if(genre) {
        let result = await helper.get_all_pagination_result('genre_search', { genre: genre });

        if (result) {
            res.json({
                status: 'success',
                genre: genre,
                result: result
            });
        } else {
            res.json({
                status: 'error',
                genre: genre,
                message: 'no results found'
            })
        }
    } else {
        res.json({
            status: 'error',
            message: 'no genre'
        });
    }
}

const country_search = async function (req, res) {
    let country = req.params.country;

    if(country) {
        country = country.split('_').join(' ');
        let result = await helper.get_all_pagination_result('country_search', { country: country });

        if (result) {
            res.json({
                status: 'success',
                country: country,
                result: result
            });
        } else {
            res.json({
                status: 'error',
                country: country,
                message: 'no results found'
            });
        }
    } else {
        res.json({
            status: 'error',
            message: 'no country'
        });
    }
}

// Get detail controller
const get_detail = async function (req, res) {
    let id = req.query.id;

    if(id) {
        id = id.startsWith('/') ? id.slice(1) : id;

        let result = await helper.use_helper('get_detail', { id: id });
        if (result) {
            res.json({
                status: 'success',
                result: result
            });
        } else {
            res.json({
                status: 'error',
                message: 'no details found'
            })
        }
    } else {
        res.json({
            status: 'error',
            message: 'no id'
        });
    }
}

// Get embed controller
const get_embed = async function (req, res) {
    let id = req.query.id;

    if(id){
        id = id.startsWith('/') ? id.slice(1) : id;

        let result = await helper.use_helper('get_embed', { id: id });
        if(result) {
            res.json({
                status: 'success',
                result: result
            });
        } else {
            res.json({
                status: 'error',
                message: 'no embed founds'
            });
        }
    } else {
        res.json({
            status: 'error',
            message: 'no id'
        });
    }
}

module.exports = {
    search_movie,
    genre_search,
    country_search,
    get_detail,
    get_embed
};