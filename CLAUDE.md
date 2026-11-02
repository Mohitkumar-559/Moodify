# Moodify — React Native app

Mood-prompt-to-playlist music app. Phase 1 MVP.

See @docs/requirements.md for the full functional requirements, SLD (performance/availability targets), technical resources, and deployment platform.
See @docs/design-system.md for colors, typography, shape language, and the Phase 1 screen list.

## Quick facts Claude Code should always have loaded
- Stack: React Native (client), FastAPI/Python (backend), Postgres + pgvector, Redis, Spotify/Apple Music Web API for track source (see requirements.md §8 — no unlicensed downloads)
- Design tokens: dark ground #14121F, accent-energy #FF6B4A, accent-calm #35C9A6, Fraunces (display) + Sora (UI)
- Phase 1 screens: Mood select → Playlist result → Now playing, plus Library/home
- Phase 1 must-haves are tagged "Must" in requirements.md §4 — build those first; "Should"/"Could" items are Phase 2+

## Conventions
- Client app lives in `app/` — Expo (managed) + TypeScript, React Navigation (`@react-navigation/native-stack` for the Mood select → Playlist result → Now playing flow, `@react-navigation/bottom-tabs` for Home/Search/Library/Profile)
- `app/src/theme/tokens.ts` is the single source of truth for colors/spacing/radii/fonts — mirrors docs/design-system.md, do not hardcode hex values in screens/components
- Fonts loaded via `@expo-google-fonts/fraunces` + `@expo-google-fonts/sora` (see `app/src/theme/useAppFonts.ts`)
- Icons: inline stroke SVGs only (`app/src/components/icons.tsx`, via `react-native-svg`) — no emoji, no icon font libraries, per design-system.md
- Client is wired to the real backend API (`app/src/api/*.ts`) — auth (JWT via `AuthContext`, token persisted in AsyncStorage), mood-select → generate playlist, Home/Library, and FR-07 like/dislike/skip feedback all hit real endpoints. `app/src/data/mockData.ts` is now only used by the not-yet-backed Search/Library screens and the `MOOD_CHIPS`/`formatDuration` helpers.
- `app/.env`'s `EXPO_PUBLIC_API_BASE_URL` points the client at the backend (default `http://localhost:8000`; Android emulator needs `10.0.2.2`, physical device needs a LAN IP — see `app/.env.example`)
- Real audio playback via `expo-audio`'s `useAudioPlaylist`/`useAudioPlaylistStatus` in `NowPlayingScreen.tsx` — only tracks with a `preview_url` are actually playable (see backend's demo catalog below); others show a "no preview available" state
- Dev server: `cd app && npm run web` (or `npm run android`/`npm run ios`)
- Typecheck: `cd app && npx tsc --noEmit`
- Backend lives in `backend/` — FastAPI + SQLAlchemy 2.0 + Alembic, Postgres (pgvector) + Redis (see `backend/README.md` for both the Docker and native-Postgres setup paths)
- `backend/app/models/` mirrors the schema 1:1 with FR IDs noted in comments — check there before adding new backend requirements/tables
- `backend/app/core/config.py`'s `embedding_dim` (currently 32, placeholder) must match the `Vector(...)` dimension in `backend/alembic/versions/9ec92c153db6_initial_schema.py` — changing one requires a new migration
- New backend migration: `cd backend && alembic revision -m "..."` — autogenerate needs a running Postgres (run `alembic upgrade head` first); hand-write otherwise
- This dev machine has no Docker; the local `moodify` DB runs on native Postgres 18 (`localhost:5432`, user `postgres`) with pgvector 0.8.6 built from source (see `backend/README.md` Option B) — `backend/.env` is already configured for this and migrations have been applied
- Demo catalog: `backend/scripts/download_demo_tracks.py` + `seed_dev_data.py` seed 25 tracks, 8 of which are real playable CC BY 3.0 MP3s by Broke For Free (attribution shown on the client's Profile screen) served from `backend/media/` via a StaticFiles mount in `app/main.py` — see `backend/README.md`'s "Demo catalog" section before adding/changing catalog content
- Admin panel: server-rendered Jinja2 pages at `/admin` (`backend/app/admin/`) — user management, song CRUD (incl. audio file upload), active/inactive toggles, and a trending/most-liked report off `track_feedback`. Cookie-session auth (`admin_session`), separate from the mobile client's JWT. Bootstrap an admin via `backend/scripts/create_admin.py <email> <password>`. See `backend/README.md`'s "Admin panel" section for behavior notes (e.g. deleting a track doesn't yet clean up its media file).
