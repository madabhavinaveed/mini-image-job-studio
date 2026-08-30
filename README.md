# Mini Image Job Studio

A small full-stack app for creating one children’s-book illustration at a time: fill a request, queue it, process it asynchronously, and review the generated image.

## What you need

- Node.js 20.9 or later
- Docker (for Redis)
- npm

## Run locally

### 1. Redis

```bash
cd backend
docker compose up -d
```

Redis listens on `127.0.0.1:6379`.

### 2. Backend API

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API: [http://localhost:4000](http://localhost:4000)

Jobs are stored in SQLite at `backend/data/occibo.sqlite`. The file is created on first start.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
```

To talk to the live API, set this in `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Leave it empty to use the in-browser mock queue (no backend required).

```bash
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Use **Load sample** on the form for the Biscuit / Bea example from the assignment.

## Environment variables

### Backend (`backend/.env.example`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API port |
| `SQLITE_PATH` | `data/occibo.sqlite` | SQLite database file |
| `REDIS_URL` | `redis://127.0.0.1:6379` | BullMQ connection |
| `PUBLIC_BASE_URL` | `http://localhost:4000` | Base URL used in generated image links |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `IMAGE_API_KEY` | empty | When set, use the real image provider. When empty, use the mock SVG generator |
| `IMAGE_API_URL` | empty | Optional Hugging Face-style inference endpoint (needs `IMAGE_API_KEY`) |

Do not commit `.env` files or API keys.

### Frontend (`frontend/.env.example`)

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | empty | Backend origin. Empty = mock API in the browser |

Restart `npm run dev` after changing `NEXT_PUBLIC_*` values.

## Image generation

The backend hides generation behind `ImageGenerationService`:

- **MockImageProvider** — default. Writes an SVG placeholder that includes the stored prompt. No paid service needed.
- **RealImageProvider** — used when `IMAGE_API_KEY` is set. Calls the Pollinations public image API, or `IMAGE_API_URL` if you provide a Hugging Face-style endpoint. If the real call fails, it falls back to the mock provider.

## API

| Method | Path | Result |
|---|---|---|
| `POST` | `/api/jobs` | Create a job, status `queued` (`201`) |
| `GET` | `/api/jobs` | List jobs, newest first |
| `GET` | `/api/jobs/:jobId` | Job detail: request, generated prompt, image URL, error |

Statuses: `queued` → `processing` → `completed` or `failed`.

A BullMQ worker on Redis picks up each job, generates (or mocks) the image, and stores the result in SQLite. The frontend polls until the job finishes.

Put `[fail]` in the book title or scene text to force a failed job (useful for checking the error state).

## Tests

```bash
cd frontend
npm test
npm run test:e2e
```

Vitest + React Testing Library live under `frontend/tests/`. Playwright covers the studio flow.

## Project layout

```
frontend/                 Next.js App Router + Tailwind
  src/app/                Page entry
  src/components/jobs/    Form, list, detail
  src/components/ui/      Reusable fields and buttons
  src/lib/                Types, validation, API clients
  tests/                  Unit, component, and e2e tests
backend/                  Express + TypeScript
  src/index.ts            Process bootstrap
  src/app.ts              HTTP app (CORS, static files, routers)
  src/lib/                Shared types and validation
  src/db/                 SQLite client and schema
  src/jobs/               Routes, service, and repository
  src/queue/              Redis, BullMQ queue, and worker
  src/promptGeneration/   Structured illustration prompt
  src/imageGeneration/    Real + mock providers and page composition
```
