# Moodify backend

FastAPI + Postgres (pgvector) + Redis, per [docs/requirements.md §6](../docs/requirements.md).

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
copy .env.example .env        # macOS/Linux: cp .env.example .env
```

## Local Postgres + Redis

**Option A — Docker (recommended when available):**

```bash
docker compose up -d
```

This starts `pgvector/pgvector:pg16` (Postgres with the pgvector extension preinstalled) on `localhost:5433` and Redis on `localhost:6379`. Port 5433 (not 5432) so it doesn't collide with a native Postgres install already listening on 5432. Point `.env`'s `DATABASE_URL` at `moodify:moodify@localhost:5433/moodify` (the `.env.example` default) when using this.

**Option B — native Postgres + a locally built pgvector (no Docker):**

If Docker isn't available, pgvector can be compiled against an existing native Windows Postgres install instead. Requires: Visual Studio (with the "Desktop development with C++" workload, for `nmake`/`cl`) and the Postgres install's dev headers (included by the standard EDB Windows installer).

```bat
:: from an elevated (Run as Administrator) Command Prompt / PowerShell
git clone --branch v0.8.6 --depth 1 https://github.com/pgvector/pgvector.git
cd pgvector
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
set "PGROOT=C:\Program Files\PostgreSQL\18"
nmake /f Makefile.win
nmake /f Makefile.win install
```

`nmake ... install` copies `vector.dll` into Postgres's `lib\` and the extension's `.control`/`.sql` files into `share\extension\` — this step needs admin rights since it writes under `Program Files`. Then create the database and point `.env` at your native instance, e.g.:

```sql
CREATE DATABASE moodify;
```
```
DATABASE_URL=postgresql+psycopg2://<user>:<password>@127.0.0.1:5432/moodify
```

Either option works — `alembic upgrade head` (below) is identical either way. This repo's dev machine currently runs Option B (native Postgres 18 + pgvector 0.8.6 built from source), since Docker Desktop wasn't installable at the time.

## Run migrations

```bash
alembic upgrade head
```

This creates all Phase 1 tables (`users`, `moods`, `tracks`, `track_moods`, `playlists`, `playlist_tracks`, `track_feedback`) and seeds the six mood chips (Chill, Focus, Happy, Workout, Romantic, Sad).

To preview the SQL without a database connection:

```bash
alembic upgrade head --sql
```

## Demo catalog (dev only)

There's no real Spotify/Apple catalog yet, so the app is exercised against a small seeded catalog:

```bash
python scripts/download_demo_tracks.py   # fetches ~35MB of real audio into media/tracks/ (gitignored)
python scripts/seed_dev_data.py          # inserts Track/TrackMood rows, incl. the ones above
```

- 17 tracks are placeholder metadata only (no audio) — enough to exercise the recommendation engine without real files.
- 8 tracks are real, playable MP3s by **Broke For Free** ("Directionless EP" and "Layers" albums), licensed **CC BY 3.0** — free to use/redistribute with attribution. Attribution is shown in the app on the Profile screen. Files are served locally via `/media/tracks/*.mp3` (mounted in `app/main.py`) and referenced by `Track.preview_url`; `Track.license_type` is set to `creative_commons` for these.
- `download_demo_tracks.py` is the reproducible source of truth for those files — re-run it on a fresh clone rather than committing the MP3s to git.
- If the API isn't reachable at `http://localhost:8000` from the client (e.g. Android emulator, physical device), set `PUBLIC_BASE_URL` in `.env` to match `app/.env`'s `EXPO_PUBLIC_API_BASE_URL` *before* seeding, so `preview_url` points somewhere the client can actually reach.

## Admin panel

Server-rendered (Jinja2) pages at `/admin` — no separate frontend project. Covers user management (view/edit/suspend/delete/promote), song management (add via file upload or URL, edit, activate/deactivate, delete, set mood weights), and a trending/most-liked report built from `track_feedback`.

Bootstrap the first admin (promotes an existing user, or creates a new one):

```bash
python scripts/create_admin.py you@example.com "SomePassword123" "Your Name"
```

Then visit `http://localhost:8000/admin/login`. Notes:

- Auth is a separate cookie-based session (`admin_session`, HttpOnly + SameSite=Lax) from the mobile client's JWT bearer tokens — logging into `/admin` doesn't log you into the app and vice versa.
- Suspending a user (`is_active=false`) blocks login on **both** the admin panel and the mobile API immediately — checked in `/auth/login` and on every authenticated request via `get_current_user`.
- Deactivating a track (`is_active=false`) removes it from `/playlists/generate` results immediately but keeps it in the catalog/existing playlists — deleting a track instead cascades and removes it from any playlist it's already in.
- Uploaded audio files land in `media/tracks/` (gitignored, same as the demo catalog) with a random filename; deleting a track's DB row does **not** delete its file from disk yet — a known gap, fine for an internal MVP tool, worth a cleanup job before this goes further.
- No CSRF token machinery — acceptable for an internal-only admin tool on a trusted network, not for a public deployment.

## Schema overview

| Table | Purpose |
| --- | --- |
| `users` | FR-05 accounts/auth. `is_active` (suspend) and `is_admin` (admin panel access) added for the admin panel. |
| `moods` | Canonical mood tags (FR-01 chips); FR-02's LLM interpreter maps prompts onto these |
| `tracks` | Catalog songs, incl. `audio_features` (JSONB) and `embedding` (pgvector) for FR-03. `is_active` added for the admin panel (excluded from recommendations when false). |
| `track_moods` | Track↔mood match strength, used by the recommendation engine |
| `playlists` | Generated/saved mood playlists |
| `playlist_tracks` | Ordered track list per playlist (FR-04 queue) |
| `track_feedback` | Like/dislike/skip/completed events feeding FR-07's recommendation loop — also the source of the admin panel's trending/most-liked report |

## New migration

```bash
alembic revision -m "describe the change"
```

Autogenerate (`alembic revision --autogenerate -m "..."`) requires a running Postgres — start `docker compose up -d` and run `alembic upgrade head` first so it has a baseline to diff against.
