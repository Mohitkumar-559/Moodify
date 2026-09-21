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
- No backend yet — screens run against `app/src/data/mockData.ts` until the FastAPI endpoints for FR-02/FR-03 (mood interpreter, recommendation engine) exist
- Dev server: `cd app && npm run web` (or `npm run android`/`npm run ios`)
- Typecheck: `cd app && npx tsc --noEmit`
