// Import local dependencies
const Helper = require('./helper/index');

const helper = new Helper();

(async function () {
    console.log(await helper.get_country_list());
})();