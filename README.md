# Foogle - Google Organic Results Extractor

A small web application that takes a search query, fetches **Google first-page organic results** (via a SERP API on the backend), displays them in the browser, and lets you download the results in a **machine-readable structured format** (`JSON` and `CSV`).

## Live Demo

The app is deployed here:

**https://foogle-013t.onrender.com**

---

## What the app does

- Accepts a keyword / search phrase in a single input field
- Calls a backend API endpoint (`/api/search`)
- Fetches search results through **SerpAPI**
- Filters / normalizes **organic (natural) search results only**
- Displays results in the UI
- Allows exporting results as:
    - `JSON`
    - `CSV`

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **External API:** SerpAPI (Google Search results)
- **Testing:** Vitest, Supertest
- **Containerization:** Docker + Docker Compose

---

## Environment Variables

This project requires a **SerpAPI API key** for real search functionality.

Create a `.env` file in the project root:

```env
PORT=3000
SERPAPI_KEY=your_serpapi_key_here
```

### Important

`.env` is not included in the repository (and should not be committed).

If someone clones this project, they must provide their own `SERPAPI_KEY`.

---

## Run Locally (Node.js)

1) Install dependencies

```
npm install
```

3) Create `.env`. Create a `.env` file and add your SerpAPI key (see above).
3) Start the app

```
npm run dev
```

5) Open in browser `http://localhost:3000`

---

## Run with Docker

### Requirements
- Docker
- Docker Compose (or Docker desktop with `docker compose`)

1) Create `.env`. Create a `.env` file and add your SerpAPI key (see above).
2) Build and run

```
docker compose up --build
```

3) Open in browser `http://localhost:3000`

- Stop containers
```
doker compose down
```