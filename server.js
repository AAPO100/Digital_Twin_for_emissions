require('dotenv').config();
const express = require('express');
const { PORT } = require('./config.js');

let app = express();
app.use(express.static('client'));
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/models', require('./routes/models.js'));
app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });