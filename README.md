# Moodify

Mood-prompt-to-playlist music app. Phase 1 MVP — see [docs/requirements.md](docs/requirements.md) for full functional requirements and [docs/design-system.md](docs/design-system.md) for the design tokens and screen list.

## Stack

- **Client** (`app/`): React Native via Expo + TypeScript, React Navigation
- **Backend** (not yet scaffolded): FastAPI (Python), Postgres + pgvector, Redis
- **Track source**: Spotify/Apple Music Web API (see [docs/requirements.md §8](docs/requirements.md) — no unlicensed downloads)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm
- [Expo Go](https://expo.dev/go) app on your phone (optional, for testing on a physical device) or an Android/iOS simulator
- A modern web browser (to run the app in web mode, no simulator required)

## Setup

```bash
cd app
npm install
```

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
├── docs/                 # Requirements, design system
├── Screen/                # Design mockups (PNG)
└── CLAUDE.md              # Project instructions for Claude Code
```

## Current status

The client is scaffolded with all four Phase 1 screens (Mood select → Playlist result → Now playing, plus Library/home) wired to mock data. The FastAPI backend (auth, mood interpreter, recommendation engine — FR-02/FR-03 in requirements.md) has not been built yet.
