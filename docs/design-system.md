# Moodify — Phase 1 design system

Source: Design canvas — https://claude.ai/artifact/QyJChZwwuP8uErspUKj9rp (5 artboards: Logo, Mood select, Playlist result, Now playing, Library/home)

## Colors
| Token | Hex | Use |
| --- | --- | --- |
| `ground` | `#14121F` | App background (dark mode only for Phase 1) |
| `surface` | `#1E1B2E` | Cards, inputs, chips |
| `border` | `#322D45` | Hairline borders |
| `divider` | `#241F35` | List row dividers |
| `text-primary` | `#F5F3F7` | Headlines, primary labels |
| `text-muted` | `#9A94AA` | Secondary text, captions |
| `accent-energy` | `#FF6B4A` | Primary actions, "energetic" mood accent |
| `accent-calm` | `#35C9A6` | "Calm" mood accent, secondary highlights |
| `accent-alt-1` | `#C97BFF` | Playlist cover variety (purple) |
| `accent-alt-2` | `#FFC24B` | Playlist cover variety (amber) |

## Typography
- Display / headlines: **Fraunces** (serif), weight 600 — used for the wordmark and screen titles
- UI / body: **Sora** (sans-serif), weights 400–700 — used for all labels, buttons, body text
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Sora:wght@400;500;600;700&display=swap`

## Shape language
- Organic "blob" shape for album art and mood-adjacent visuals: `border-radius: 58% 42% 46% 54% / 50% 46% 54% 50%` (vary the percentages per instance for visual variety)
- Standard corner radius: 16px (cards), 26–28px (pill buttons/inputs), 50% (avatars, icon buttons)
- No gradients, no left-border cards, no emoji as icons — inline stroke SVG icons only

## Screens (Phase 1 flow)
1. **Mood select** — free-text prompt input + 6 mood chips (Chill, Focus, Happy, Workout, Romantic, Sad) → "Generate playlist"
2. **Playlist result** — hero card (cover, title, track/duration count) + track list with like action + "Play all"
3. **Now playing** — album art, progress bar, transport controls, mood tag, explainability line, like/dislike (feeds FR-07 feedback loop)
4. **Library/home** — grid of saved mood playlists + bottom nav (Home, Search, Library, Profile)

## Accessibility notes carried into implementation
- All interactive elements are real `<button>`/`<a>`/`<input>` + `<label>`, min touch target 44px
- Icon-only buttons need `aria-label`
- Text on `ground`/`surface` must hold 4.5:1 contrast — `text-muted` (#9A94AA) on `#14121F` and `#1E1B2E` was checked against this
