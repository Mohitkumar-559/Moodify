from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mood import Mood
from app.models.track import Track, TrackMood

MAX_PLAYLIST_TRACKS = 20

# design-system.md accent tokens, rotated per mood for playlist cover art.
MOOD_ACCENT_COLORS: dict[str, str] = {
    "chill": "#35C9A6",
    "focus": "#FF6B4A",
    "happy": "#FFC24B",
    "workout": "#C97BFF",
    "romantic": "#C97BFF",
    "sad": "#35C9A6",
}
DEFAULT_ACCENT_COLOR = "#FF6B4A"


def recommend_tracks(db: Session, mood: Mood, limit: int = MAX_PLAYLIST_TRACKS) -> list[Track]:
    """FR-03: match a mood to catalog tracks via the track_moods weight join.

    Placeholder for pgvector similarity search — once tracks have real
    embeddings, this should rank by cosine distance against the mood-prompt
    embedding instead of/in addition to the track_moods weight.
    """
    stmt = (
        select(Track)
        .join(TrackMood, TrackMood.track_id == Track.id)
        .where(TrackMood.mood_id == mood.id, Track.is_active.is_(True))
        .order_by(TrackMood.weight.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def accent_color_for_mood(mood_slug: str) -> str:
    return MOOD_ACCENT_COLORS.get(mood_slug, DEFAULT_ACCENT_COLOR)
