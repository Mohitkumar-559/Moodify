"""
Seeds a small demo catalog so /playlists/generate is testable locally without
a real Spotify/Apple Music import. Not an Alembic migration on purpose —
this is throwaway fixture data, not schema or canonical reference data.

Usage: cd backend && .venv\\Scripts\\python.exe scripts\\seed_dev_data.py
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

# Import the full model registry (not just Mood/Track/TrackMood) — their
# relationships reference Playlist/User/etc. by string name, which SQLAlchemy
# can only resolve if those classes have been imported somewhere first.
from app.core.config import settings  # noqa: E402
from app.db.base import Mood, Track, TrackMood  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402

# title, artist, duration_sec, {mood_slug: weight}
TRACKS = [
    ("Slow Static", "Marina Voss", 204, {"focus": 1.0, "chill": 0.6}),
    ("Grey Window", "Halden", 178, {"focus": 0.9}),
    ("Low Light", "Runa Park", 242, {"focus": 0.8, "chill": 0.7}),
    ("Keystrokes", "Oberon Fields", 191, {"focus": 1.0}),
    ("Cold Coffee", "Marina Voss", 227, {"chill": 0.9, "focus": 0.5}),
    ("Signal Path", "Halden", 213, {"focus": 1.0}),
    ("Underline", "Runa Park", 199, {"focus": 0.85}),
    ("Harbor Light", "Oberon Fields", 231, {"chill": 1.0}),
    ("Soft Static", "Marina Voss", 208, {"chill": 0.95}),
    ("Redline", "Halden", 176, {"workout": 1.0}),
    ("Overdrive", "Runa Park", 189, {"workout": 0.95}),
    ("Window Seat", "Marina Voss", 219, {"sad": 0.9, "chill": 0.6}),
    ("Grey Hour", "Oberon Fields", 201, {"sad": 1.0}),
    ("Golden Hour", "Halden", 195, {"happy": 1.0}),
    ("Sunlit Steps", "Runa Park", 182, {"happy": 0.9, "workout": 0.4}),
    ("Slow Dance", "Oberon Fields", 224, {"romantic": 1.0}),
    ("Candlelight", "Marina Voss", 210, {"romantic": 0.95, "chill": 0.3}),
]

# Real, licensed, actually-playable tracks (see download_demo_tracks.py).
# title, filename, duration_sec (from mutagen — keep in sync with the file),
# {mood_slug: weight}. Weighted high so they surface near the top of
# generated playlists ahead of the silent placeholder tracks above.
ARTIST = "Broke For Free"
REAL_TRACKS = [
    ("Night Owl", "night-owl.mp3", 194, {"chill": 1.0}),
    ("My Always Mood", "my-always-mood.mp3", 189, {"focus": 1.0}),
    ("Day Bird", "day-bird.mp3", 223, {"happy": 1.0}),
    ("Mell's Parade", "mells-parade.mp3", 198, {"workout": 0.9, "happy": 0.4}),
    ("As Colourful As Ever", "as-colourful-as-ever.mp3", 235, {"happy": 0.9}),
    ("Knock Knock", "knock-knock.mp3", 156, {"focus": 0.9}),
    ("Spellbound", "spellbound.mp3", 175, {"romantic": 1.0}),
    ("Murmur", "murmur.mp3", 249, {"sad": 1.0, "chill": 0.5}),
]


def _slug(title: str, artist: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", f"{title}-{artist}".lower()).strip("-")


def _seed_track(db, moods_by_slug, *, title, artist, duration_sec, mood_weights, extra_fields=None) -> bool:
    """Returns True if a new Track row was created."""
    source_track_id = _slug(title, artist)
    track = db.scalar(
        select(Track).where(Track.source == "royalty_free", Track.source_track_id == source_track_id)
    )
    created = track is None
    if track is None:
        track = Track(
            title=title,
            artist=artist,
            duration_sec=duration_sec,
            source="royalty_free",
            source_track_id=source_track_id,
            **(extra_fields or {}),
        )
        db.add(track)
        db.flush()

    for mood_slug, weight in mood_weights.items():
        mood = moods_by_slug.get(mood_slug)
        if mood is None:
            print(f"WARNING: unknown mood slug '{mood_slug}', skipping link for '{title}'")
            continue
        link = db.get(TrackMood, {"track_id": track.id, "mood_id": mood.id})
        if link is None:
            db.add(TrackMood(track_id=track.id, mood_id=mood.id, weight=weight))

    return created


def main() -> None:
    db = SessionLocal()
    try:
        moods_by_slug = {m.slug: m for m in db.scalars(select(Mood))}
        created_tracks = 0

        for title, artist, duration_sec, mood_weights in TRACKS:
            if _seed_track(db, moods_by_slug, title=title, artist=artist, duration_sec=duration_sec, mood_weights=mood_weights):
                created_tracks += 1

        for title, filename, duration_sec, mood_weights in REAL_TRACKS:
            created = _seed_track(
                db,
                moods_by_slug,
                title=title,
                artist=ARTIST,
                duration_sec=duration_sec,
                mood_weights=mood_weights,
                extra_fields={
                    "preview_url": f"{settings.public_base_url}/media/tracks/{filename}",
                    "is_downloadable": True,
                    "license_type": "creative_commons",
                },
            )
            if created:
                created_tracks += 1

        db.commit()
        total = len(TRACKS) + len(REAL_TRACKS)
        print(f"Seeded {created_tracks} new tracks ({total} tracks defined total, "
              f"{len(REAL_TRACKS)} with real playable audio).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
