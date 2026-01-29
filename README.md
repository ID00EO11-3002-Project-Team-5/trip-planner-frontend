# Trip Planner Frontend

A Next.js + TypeScript web app to help groups of friends plan trips collaboratively: shared map planning, real-time sync, expense splitting, and a shared vault.

## Features

- Planner: Mapbox-powered shared map with click-to-add markers (realtime-ready)
- Expenses: Equal split calculator using precise Decimal math
- Vault: Simple file uploader (requires Supabase Storage configuration)
- Supabase integration: client and realtime channel placeholder
- Tailwind CSS for styling
- CI: GitHub Actions to lint, test, and build

## Getting Started

1. Copy env vars and fill them in:

```bash
cp .env.example .env.local
```

Required vars:

- `NEXT_PUBLIC_MAPBOX_TOKEN`: Mapbox access token
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (optional for realtime & storage)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key (optional)

2. Install and run in development:

```bash
npm install
npm run dev
```

3. Open http://localhost:3000

## Scripts

- `npm run dev`: Start dev server
- `npm run build`: Production build
- `npm start`: Start production server
- `npm run lint`: ESLint checks
- `npm test`: Run Vitest unit tests

## Supabase Notes

- Realtime: The planner uses a channel `trip:demo` to broadcast `marker-added` events if Supabase is configured.
- Storage: To enable uploads in Vault, create a public bucket named `vault` and configure RLS/policies appropriately.

## Tech Stack

- Next.js (App Router), React 18, TypeScript
- Tailwind CSS
- Mapbox GL JS
- Supabase JS
- Decimal.js-light
- Vitest + Testing Library (unit tests)
