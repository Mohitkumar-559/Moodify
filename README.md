# Moodify

Mood-prompt-to-playlist music app. Phase 1 MVP — see [docs/requirements.md](docs/requirements.md) for full functional requirements and [docs/design-system.md](docs/design-system.md) for the design tokens and screen list.

## Stack

- **Client** (`app/`): React Native via Expo + TypeScript, React Navigation
- **Backend** (`backend/`): FastAPI (Python), Postgres + pgvector (SQLAlchemy + Alembic), Redis
- **Track source**: Spotify/Apple Music Web API (see [docs/requirements.md §8](docs/requirements.md) — no unlicensed downloads)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm (client)
- Python 3.11+ and pip (backend)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (backend — local Postgres + Redis)
- [Expo Go](https://expo.dev/go) app on your phone (optional, for testing on a physical device) or an Android/iOS simulator
- A modern web browser (to run the client in web mode, no simulator required)

## Setup

**Client:**

```bash
cd app
npm install
```

**Backend:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
copy .env.example .env        # macOS/Linux: cp .env.example .env
```

Then set up Postgres (pgvector) + Redis — via Docker, or a native Postgres install with pgvector built from source if Docker isn't available — and run `alembic upgrade head` to create the tables and seed the 6 mood chips. See [backend/README.md](backend/README.md) for both paths, the schema, and migration details.

## Run the app

From the `app/` directory:

```bash
npm run web       # run in the browser — fastest way to preview
npm run android   # run on an Android emulator/device
npm run ios       # run on an iOS simulator (macOS only)
```

`npm run web`/`android`/`ios` start the Expo dev server; scan the printed QR code with Expo Go to open the app on your phone, or press `w`/`a`/`i` in the terminal to launch web/Android/iOS directly.

## Typecheck

```bash
cd app
npx tsc --noEmit
```

## Project structure

```
Moodify/
├── app/                  # React Native (Expo) client
│   └── src/
│       ├── components/   # Shared UI (buttons, chips, icons, BlobShape)
│       ├── data/         # Mock data (stands in for the backend for now)
│       ├── navigation/   # React Navigation stack + tabs
│       ├── screens/      # Mood select, Playlist result, Now playing, Home, Search, Library, Profile
│       └── theme/        # Design tokens (colors, type, spacing) + font loading
├── backend/              # FastAPI backend
│   ├── alembic/          # DB migrations
│   └── app/
│       ├── core/         # Settings (.env-backed)
│       ├── db/           # SQLAlchemy engine/session/Base
│       └── models/       # User, Mood, Track, Playlist, TrackFeedback, etc.
├── docs/                 # Requirements, design system
├── Screen/                # Design mockups (PNG)
└── CLAUDE.md              # Project instructions for Claude Code
```

## Deploy to Render (free tier)

[`render.yaml`](render.yaml) is a Render Blueprint that creates three free resources:

| Resource | Type | Notes |
| --- | --- | --- |
| `moodify-db` | Postgres | pgvector is enabled by the initial migration |
| `moodify-api` | Python web service | Downloads the demo MP3s at build time. On every boot it runs `alembic upgrade head`, then the seed, then the optional admin bootstrap ([`backend/scripts/render_start.sh`](backend/scripts/render_start.sh)) |
| `moodify-web` | Static site | `expo export --platform web`, which bakes in the API host at build time |

1. Push this repo to GitHub.
2. In the Render dashboard, go to **New → Blueprint**, pick the repo, and click **Apply**.
3. Optional: set `ADMIN_EMAIL` and `ADMIN_PASSWORD` on `moodify-api` to get an `/admin` login.
4. Open the `moodify-web` URL.

Free-tier caveats:
- The API sleeps after about 15 minutes idle. The first request after that takes about 1 minute (cold start).
- Free Postgres expires 30 days after creation unless upgraded.
- The disk is ephemeral. Audio uploaded through `/admin` is lost on redeploy or restart. The 8 seeded demo tracks are re-downloaded on every build, so they survive.
- If you rename `moodify-api` or Render assigns a different hostname, redeploy `moodify-web` so it picks up the new host.

## Current status

The client is scaffolded with all four Phase 1 screens (Mood select → Playlist result → Now playing, plus Library/home) wired to mock data. The backend has its Postgres schema and initial migrations (users, moods, tracks, playlists, feedback) but no API routes yet — FR-02/FR-03 (mood interpreter, recommendation engine) and FastAPI endpoints are the next step.
