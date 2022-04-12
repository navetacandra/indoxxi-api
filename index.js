// Import dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Env Variable
const PORT = process.env.PORT || 5000;

const app = express();

// Setup cors and body-parser
app.use(cors({ origin: '*', methods: 'GET', allowHeaders: 'Origin, X-Requested-With, Content-Type, Accept' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Search path
app.get('/search', require('./routes/index'))
app.get('/search/:keyword', require('./routes/index'))

// Genre Search path
app.get('/genre', require('./routes/index'))
app.get('/genre/:genre', require('./routes/index'))

// Country Search path
app.get('/country', require('./routes/index'))
app.get('/country/:country', require('./routes/index'))

// Detail path
app.get('/detail', require('./routes/index'));

// Get Embed path
app.get('/embed', require('./routes/index'));

// Random path
app.get('**', require('./routes/index'))

// Run express server
app.listen(PORT, console.log('Running on port:', PORT));