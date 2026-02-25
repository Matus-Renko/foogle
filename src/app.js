const path = require('path');
const express = require('express');
const searchRouter = require('./routes/search');

const app = express();

app.use(express.json());

// static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// API
app.use('/api', searchRouter);

// health
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// fallback
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;