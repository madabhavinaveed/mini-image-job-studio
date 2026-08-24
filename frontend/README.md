# Frontend

Next.js App Router UI for Occibo Mini Image Job Studio.

Full setup (backend, Redis, env vars) is in the [root README](../README.md).

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Leave `NEXT_PUBLIC_API_BASE_URL` empty to use the in-browser mock queue, or set it to `http://localhost:4000` to use the live API.
