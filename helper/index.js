// Import Dependencies
require('dotenv').config();
const cheerio = require('cheerio');

// Import Local Dependecies
const {
    loader
} = require('./fetch_site');

// Environment Variable
const indoxxi_ip = process.env.TARGET;

// Helper Class
class Helper {

    // Get Genre List
    async get_genre_list() {
        let html = await loader('/genre');
        let $ = cheerio.load(html);
        let genres = [];
        $('.ml-title.ml-title-page-genre span a').each(function () {
            let text = $(this).text().toLowerCase().trim();
            if (!genres.includes(text)) genres.push(text);
        });
        return genres;
    }

    // Get Country List
    async get_country_list() {
        let html = await loader('/negara');
        let $ = cheerio.load(html);
        let countries = [];
        $('.ml-title.ml-title-page-negara span a').each(function () {
            let text = $(this).text().toLowerCase().split(' ').join('_').trim();
            if (!countries.includes(text)) countries.push(text);
        });
        return countries;
    }

    // Search by Keyword
    /**
     *
     * @param {String} keyword
     * @param {Number} limit
     */
    async #search_movie(keyword, limit = 1) {
        let html = await loader(`/dutaxxi.com/search.php?keyword=${keyword}&limit=${limit}`);
        let $ = cheerio.load(html);

        // returning movie list
        return get_movie_list($);
    }

    // Get Movie from Genre
    /**
     *
     * @param {String} genre
     * @param {Number} limit
     * @returns
     */
    async #get_movie_from_genre(genre, limit = 1) {
        let html = await loader(`/dutaxxi.com/listing.php?list=genre&value=${genre}&limit=${limit}`);
        let $ = cheerio.load(html);

        // returning movie list
        return get_movie_list($);
    }

    // Get Movie from Country
    /**
     *
     * @param {String} country
     * @param {Number} limit
     * @returns
     */
    async #get_movie_from_country(country, limit = 1) {
        let html = await loader(`/dutaxxi.com/listing.php?list=negara&value=${country}&limit=${limit}`);
        let $ = cheerio.load(html);

        // returning movie list
        return get_movie_list($);
    }

    // Get Detail
    /**
     *
     * @param {String} id - Movie id
     */
    async #get_detail(id) {
        let html = await loader(`/${id}/play`);
        let $ = cheerio.load(html);

        // Get details
        let raw = get_details($);
        if (!raw.title) return [];

        let sorted_obj = Object.keys(raw).sort().reduce(function (result, key) {
            result[key] = raw[key];
            return result;
        }, {});

        return sorted_obj;
    }

    // Get Embed Link
    /**
     * @param {String} id - Movie id
     */
    async #get_embed(id) {
        let html = await loader(`/${id}/play`);
        let $ = cheerio.load(html);
        let sources;

        // Get details
        let raw = get_details($);

        if(!raw.title) return [];

        // If it has eps
        let is_series = $('#list-eps').html() ? true : false;
        
        // Execute if is movie
        if (!is_series) {
            // Get default play embed
            let play_embed = html.split(`$('#vidframe').attr('src','`)[1].split(`');`)[0];

            sources = await get_source_embed(play_embed);
        }
        // Execute if is series
        else {
            let eps_list = [];
            // Get backdrop
            let backdrop = html.split("imgbkr ='")[1].split("';")[0];
            // Get title
            let _title_ = encodeURIComponent($('[itemprop="name"]').attr('content'));

            // Loop btn-eps
            $('.btn-eps').each(function () {
                // Get url data
                let data = $(this).attr('onclick').replace("loadVideo(", "").replace(")", "").replace(/'/g, "").split(',');
                data.shift();
                let svr = data[0],
                    eps = data[1],
                    nno = data[2],
                    slug = data[3],
                    tmdb = data[4];
                // Set url
                let url = `http://104.248.67.9/dutaxxi.com/playertv/index.php?title=${_title_}&site=http://104.248.67.9/dutaxxi.com&backdrop=${backdrop}&slug=${slug}&svr=${svr}&nno=${nno}&epi=${eps}&tmdb=${tmdb}`;
                // push url to eps_list
                eps_list.push(url);
            });

            sources = eps_list.map(async v => {
                return await get_source_embed(v);
            });
            sources = await Promise.all(sources);
        }

        raw.source = sources;
        // Sorting Raw Data Object by Keys
        let sorted_obj = Object.keys(raw).sort().reduce(function (result, key) {
            result[key] = raw[key];
            return result;
        }, {});

        return sorted_obj;
    }

    // Get All Pagination Result
    /**
     *
     * @param {'search' | 'genre_search' | 'country_search'} type - Helper type
     * @param {Object} params - Parameter for helper
     * @param {String} params.genre - Genre for searching
     * @param {String} params.country - Country for searching
     * @param {String} params.keyword - Keyword for searching
     * @returns
     */
    async get_all_pagination_result(type, params = {}) {
        let helper_list = {
            search: {
                func: this.#search_movie,
                params_list: ['keyword'],
                params_type: {
                    keyword: 'string'
                }
            },
            genre_search: {
                func: this.#get_movie_from_genre,
                params_list: ['genre'],
                params_type: {
                    genre: 'string'
                }
            },
            country_search: {
                func: this.#get_movie_from_country,
                params_list: ['country'],
                params_type: {
                    country: 'string'
                }
            }
        };

        // Declare Array of Number
        let number_list = Array(100).fill(0).map((_, i) => (i + 1));

        // Get Helper by type
        let help = helper_list[type];

        // Validate params Value
        help.params_list.forEach((el, i) => {
            let params_val = params[el];
            if (typeof params_val !== help.params_type[el])
                console.log(`${el} must be ${help.params_type[el]}!`);
        });

        // Loop Array of number
        let raw_data = await Promise.all(number_list.map(async function (el) {
            try {
                // returning Helper results
                return await help.func(params[help.params_list[0]], el);
            } catch (e) {
                return undefined;
            }
        }));

        raw_data = raw_data.filter(v => v !== undefined).filter(v => v.length >= 1).flat();
        let data = [],
            temp_id = [];

        // Delete duplicate items
        raw_data.forEach(el => {
            if (!temp_id.includes(el.link))
                data.push(el);
            temp_id.push(el.link);
        });

        // returning data
        if (data.length < 1)
            return undefined;
        else
            return data;
    }

    /**
     *
     * @param {'search' | 'genre_search' | 'country_search' | 'get_detail' | 'get_embed'} helper - Helper name
     * @param {Object} params - Parameter for helper
     * @param {String} params.genre - Genre for searching
     * @param {String} params.country - Country for searching
     * @param {String} params.keyword - Keyword for searching
     * @param {String} params.id - Id for get detail
     * @param {Number} params.limit - Limit for paginate
     * @returns
     */
    async use_helper(helper, params = {}) {
        let helper_list = {
            search: {
                func: this.#search_movie,
                params_list: ['keyword'],
                params_type: {
                    keyword: 'string'
                }
            },
            genre_search: {
                func: this.#get_movie_from_genre,
                params_list: ['genre'],
                params_type: {
                    genre: 'string'
                }
            },
            country_search: {
                func: this.#get_movie_from_country,
                params_list: ['country'],
                params_type: {
                    country: 'string'
                }
            },
            get_detail: {
                func: this.#get_detail,
                params_list: ['id'],
                params_type: {
                    id: 'string'
                }
            },
            get_embed: {
                func: this.#get_embed,
                params_list: ['id'],
                params_type: {
                    id: 'string'
                }
            }
        };

        let help = helper_list[helper];

        // Validate params Value
        help.params_list.forEach((el, i) => {
            let params_val = params[el];
            if (typeof params_val !== help.params_type[el])
                console.log(`${el} must be ${help.params_type[el]}!`);
        });

        let run_func = await help.func(
            params[help.params_list[0]],
            params[help.params_list[1]],
            params[help.params_list[2]],
            params[help.params_list[3]],
            params[help.params_list[4]]
        );
        if (run_func.length < 1)
            return undefined;
        else
            return run_func;
    }
};

//PUBLIC_URI https://indoxxi-api1.herokuapp.com
//TARGET http://104.248.67.9

function get_movie_list($ = cheerio.load()) {
    // Declare Zero Array
    let movie_list = [];

    // Loop Movie List
    $('.ml-item a').each(function () {
        // Get Link
        let link = $(this).attr('href');
        // Get Thumbnail Address
        let img = $(this).find('img').attr('data-original');
        // Get Duration
        let duration = $(this).find('.rating-durasi .mli-durasi').text();
        // Get Rating
        let rating = $(this).find('.rating-durasi .mli-rating').text().replace('menit', '').trim();
        // Get Raw Title
        let title = $(this).find('.mli-info h2').text() || '-';
        // Split Raw Title by Space
        title = title.split(' ');

        // Check is Title Include Year
        let is_year = /\(|\)/.test(title[title.length - 1]) ?
            !isNaN(title[title.length - 1].replace(/\(|\)| /g, '')) :
            false;
        // Get Year
        let year = is_year ? title.pop().replace(/\(|\)| /g, '') : '-';
        // Joining Splitted Title
        title = title.join(' ');

        // Spliting Id and Type from Link
        let id = link.split('/');
        id.shift()
        let type = id.shift();
        id = id[id.length - 1];

        // Raw Data Object
        let raw = {
            title: title,
            link: link,
            img: img,
            id: id,
            type: type,
            duration: duration,
            rating: rating,
            year: year
        };

        // If it Has Eps
        if ($(this).find('.mli-eps').text())
            raw.eps = $(this).find('.mli-eps').text().toLowerCase().replace('eps', '');
        // If it Has Quality
        if ($(this).find('.mli-quality').text())
            raw.quality = $(this).find('.mli-quality').text() || 'TRAILER';

        // Sorting Object by Key
        let sorted_obj = Object.keys(raw).sort().reduce(function (result, key) {
            result[key] = raw[key];
            return result;
        }, {});

        // Push Sorted Objeck to movie_list
        movie_list.push(sorted_obj);
    });

    // returning movie_list
    return movie_list;
}

function get_details($ = cheerio.load()) {
    if (!$('h3[itemprop="name"]').text().trim()) {
        return {};
    }

    let genres = [],
        actors = [],
        directors = [],
        countries = [],
        sinopsis = $('div[itemprop="description"].desc span').text().trim() || '',
        raw_title = $('h3[itemprop="name"]').text().trim() || '';
        thumbnail = $('.thumb.mvic-thumb').find('meta[itemprop="image"]').attr('content').trim() || ';'

    // Get Genre List
    $('span[itemprop="genre"]').each(function () {
        genres.push($(this).text().toLowerCase());
    });

    // Get Actor List
    $('span[itemprop="actor"] a span[itemprop="name"]').each(function () {
        actors.push($(this).text());
    });

    // Get Director List
    $('span[itemprop="director"] a span[itemprop="name"]').each(function () {
        directors.push($(this).text());
    });

    // Get Country List
    $('.mvici-right p').eq(2).find('a span').each(function () {
        countries.push($(this).text().toLowerCase());
    });

    // Splitting string not splitted
    genres = genres.map(v => v.split(',')).flat();
    actors = actors.map(v => v.split(',')).flat();
    directors = directors.map(v => v.split(',')).flat();
    countries = countries.map(v => v.split(',')).flat();

    // Spliting title and year
    let title = raw_title.split(' ');
    title.pop();
    // Get Year
    let year = $('h3[itemprop="name"] a').attr('href').includes('tahun') ?
        $('h3[itemprop="name"] a').text().trim() :
        '-';
    // Joining Splitted Title
    title = title.join(' ');

    // Raw Data Object
    let raw = {
        genre: genres,
        actor: actors,
        director: directors,
        // Get Duration
        duration: $('.mvici-right p').eq(0).text().split(':')[1].trim().replace('menit', ''),
        // Get Quality
        quality: $('span.quality').text().trim(),
        country: countries,
        // Get Rating
        rating: $('span[itemprop="ratingValue"].irank-voters').text().trim(),
        sinopsis: sinopsis,
        title: title,
        year: year,
        thumbnail: thumbnail
    };

    return raw;
}

async function get_source_embed(url) {
    let html = await loader(`${url.replace(indoxxi_ip, '')}`);

    let sources;
    let caption = [];
    let links = [];

    // If sources encrypt to base64
    if (html.includes(`datasources = atob('`)) {
        sources = html.split(`datasources = atob('`)[1].split(`');`)[0];
        // decrypt sources
        sources = Buffer.from(sources, 'base64').toString('binary');
        // parsing sources
        sources = JSON.parse(sources);
    }
    // If sources not encrypted
    else {
        // parsing sources
        sources = html.split(`datasources = '`)[1].split(`';`)[0];
        sources = JSON.parse(sources);
    }

    // If sources has length
    if (sources.length) {
        // Get caption sources
        caption = sources.filter(v => v.length ?
                v.filter(x => x.kind == 'captions') :
                false)
            .flat().filter(v => v.id !== 'off');
        // Modified caption value
        caption = caption.map(v => {
            delete v.kind;
            return v;
        })
        // Filter sources if has meta
        sources = sources.filter(v => v.meta !== undefined || null);
        // Filter cdn provider
        sources = sources.filter(v => !/drive|vidsrc|mp4s|blogspot|cvideo/i.test(v.meta.type));
        // Push Links if Sources not 0
        if (sources.length > 0) {
            sources.forEach(v => {
                links.push(v.sources[0].file)
            });
        }
    }

    // return link and caption
    return {
        links: links.length > 0 ? links : 'links not found',
        caption: caption.length > 0 ? caption : 'caption not found'
    };
}

// Export Helper
module.exports = Helper;