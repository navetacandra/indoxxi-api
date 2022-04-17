// Import local dependencies
const Helper = require('./helper/index');

const helper = new Helper();

(async function () {
    console.log(await helper.use_helper('get_detail', {
        id: 'movie/spider-man-homecoming-6rjn'
    }));
})();