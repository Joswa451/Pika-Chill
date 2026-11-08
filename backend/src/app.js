const express = require('express');
const cors = require('cors');
const routes = require('./routes');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');
// Render/most hosts terminate TLS at a proxy; this lets rate limiting key on
// the real client IP instead of the proxy address.
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
// Cache CORS preflights so browsers do not send an OPTIONS request before
// every authenticated API call.
app.use(cors({ maxAge: 86400 }));

app.use('/api', routes);

module.exports = app;