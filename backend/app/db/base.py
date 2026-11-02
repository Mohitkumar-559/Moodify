"""
Imports every model so Base.metadata is fully populated — Alembic's env.py
targets this module rather than app.db.base_class directly.
"""

from app.db.base_class import Base  # noqa: F401
from app.models.feedback import TrackFeedback  # noqa: F401
from app.models.mood import Mood  # noqa: F401
from app.models.playlist import Playlist, PlaylistTrack  # noqa: F401
from app.models.track import Track, TrackMood  # noqa: F401
from app.models.user import User  # noqa: F401
