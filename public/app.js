const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const searchBtn = document.getElementById('searchBtn');

const downloadJsonBtn = document.getElementById('downloadJsonBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');

const statusEl = document.getElementById('status');
const resultsSection = document.getElementById('resultsSection');
const metaEl = document.getElementById('meta');
const resultsList = document.getElementById('resultsList');

let lastSearchPayload = null;

function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.classList.toggle('error', isError);
}

function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? 'Loading...' : 'Search';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderResults(payload) {
    const results = payload?.results ?? [];
    const query = payload?.query ?? '';
    const count = results.length;

    resultsList.innerHTML = '';

    if (count === 0) {
        resultsSection.classList.remove('hidden');
        metaEl.textContent = `• 0 results`;
        resultsList.innerHTML = '<li>No results found, sorry.</li>';
        return;
    }

    results.forEach((item) => {
        const li = document.createElement('li');

        li.innerHTML = `
      <p class="result-title">${escapeHtml(item.position)}. ${escapeHtml(item.title)}</p>
      <a class="result-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(item.url)}
      </a>
      <p class="result-snippet">${escapeHtml(item.snippet || '')}</p>
    `;

        resultsList.appendChild(li);
    });

    resultsSection.classList.remove('hidden');
    metaEl.textContent = `• ${count} results`;
}

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
}

function toCsv(rows) {
    const header = ['position', 'title', 'url', 'snippet'];

    const escapeCsv = (value) => {
        const str = String(value ?? '');
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
    };

    const lines = [
        header.join(','),
        ...rows.map((row) =>
            [
                row.position,
                row.title,
                row.url,
                row.snippet
            ].map(escapeCsv).join(',')
        )
    ];

    return lines.join('\n');
}

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = queryInput.value.trim();
    if (!query) {
        setStatus('Give me a keyword.', true);
        return;
    }

    setLoading(true);
    setStatus('Searching...');
    resultsSection.classList.add('hidden');
    downloadJsonBtn.disabled = true;
    downloadCsvBtn.disabled = true;

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            let message = `Server error (${response.status})`;
            try {
                const err = await response.json();
                if (err?.error) message = err.error;
            } catch (_) {
                // ignore JSON parse error
            }
            throw new Error(message);
        }

        const payload = await response.json();

        if (!payload || !Array.isArray(payload.results)) {
            throw new Error('Wrong format from server.');
        }

        lastSearchPayload = payload;

        renderResults(payload);
        setStatus(`Found ${payload.results.length} Results.`);
        downloadJsonBtn.disabled = false;
        downloadCsvBtn.disabled = false;
    } catch (error) {
        console.error(error);
        setStatus(error.message || 'There was an error while searching.', true);
    } finally {
        setLoading(false);
    }
});

downloadJsonBtn.addEventListener('click', () => {
    if (!lastSearchPayload) return;

    const safeQuery = (lastSearchPayload.query || 'search')
        .replace(/[^\w\-]+/g, '_')
        .slice(0, 40);

    const content = JSON.stringify(lastSearchPayload, null, 2);
    downloadFile(content, `${safeQuery}_google_results.json`, 'application/json');
});

downloadCsvBtn.addEventListener('click', () => {
    if (!lastSearchPayload) return;

    const safeQuery = (lastSearchPayload.query || 'search')
        .replace(/[^\w\-]+/g, '_')
        .slice(0, 40);

    const csv = toCsv(lastSearchPayload.results);
    downloadFile(csv, `${safeQuery}_google_results.csv`, 'text/csv;charset=utf-8;');
});