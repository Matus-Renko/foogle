const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const searchBtn = document.getElementById('searchBtn');

const downloadJsonBtn = document.getElementById('downloadJsonBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');

const statusEl = document.getElementById('status');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');

let lastSearchPayload = null;

function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.classList.toggle('error', isError);
}

function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? 'Searching...' : 'Search';
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
    const count = results.length;

    resultsList.innerHTML = '';

    if (count === 0) {
        resultsSection.classList.remove('hidden');
        resultsList.innerHTML = '<li>No results found, sorry.</li>';
        return;
    }

    results.forEach((item) => {
        const li = document.createElement('li');

        li.innerHTML = `
      <a class="result-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(item.title)}
      </a>
      <p class="result-snippet">${escapeHtml(item.snippet || '')}</p>
    `;

        resultsList.appendChild(li);
    });

    resultsSection.classList.remove('hidden');
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

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = queryInput.value.trim();
    if (!query) {
        setStatus('Give me a keyword.', true);
        return;
    }

    setLoading(true);
    setStatus('Waiting for results...');
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

    const csv = window.csvUtils.toCsv(lastSearchPayload.results);
    downloadFile(csv, `${safeQuery}_google_results.csv`, 'text/csv;charset=utf-8;');
});