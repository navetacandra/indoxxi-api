// Import local dependencies
const Helper = require('./helper/index');

const helper = new Helper();

(async function () {
    console.log(await helper.use_helper('get_embed', {
        id: '/film-seri/the-spectacular-spider-man-season-1-2008-2z2s1'
    }));
    console.log(await helper.use_helper('get_embed', {
        id: '/movie/spider-man-fh'
    }));
})();