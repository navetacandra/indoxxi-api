// Import Dependecies
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args)).catch(console.log);

// Declare Variabel
const indoxxi = process.env.TARGET;

// Loader Function
async function loader(path = '/') {
    try {
        let res = await fetch(`${indoxxi}${encodeURI(path)}`);
        let html = await res.text();
        return html;
    } catch(err) {
        return err;
    }
}

// Export Loader
module.exports = { loader };