const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const searchRouter = require('./routes/search');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// static files (frontend)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', searchRouter);

// health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// fallback on index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server runs on http://localhost:${PORT}`);
});