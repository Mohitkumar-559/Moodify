import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Mood(Base):
    """
    Canonical mood tags (FR-01 chips: Chill, Focus, Happy, Workout, Romantic, Sad).
    FR-02's LLM mood interpreter maps free-text prompts onto these + audio-feature tags.
    """

    __tablename__ = "moods"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(60), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    track_links: Mapped[list["TrackMood"]] = relationship(back_populates="mood", cascade="all, delete-orphan")
    playlists: Mapped[list["Playlist"]] = relationship(back_populates="primary_mood")
