// Import local dependencies
const Helper = require('./helper/index');

const helper = new Helper();

(async function () {
    console.table(await helper.get_all_pagination_result('search', {
        keyword: 'war game'
    }));
})();