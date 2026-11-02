import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import settings
from app.db.base_class import Base


class Track(Base):
    """A song sourced from Spotify/Apple Music or the royalty-free catalog (requirements.md §8)."""

    __tablename__ = "tracks"
    __table_args__ = (
        UniqueConstraint("source", "source_track_id", name="uq_tracks_source_source_track_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    artist: Mapped[str] = mapped_column(String(255), nullable=False)
    album: Mapped[str | None] = mapped_column(String(255), nullable=True)
    duration_sec: Mapped[int] = mapped_column(Integer, nullable=False)
    # 'spotify' | 'apple_music' | 'royalty_free'
    source: Mapped[str] = mapped_column(String(30), nullable=False)
    source_track_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    preview_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # FR-08: offline access limited to legally licensed/owned content.
    is_downloadable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # Set only when is_downloadable: 'royalty_free' | 'creative_commons' | 'artist_opt_in'
    license_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    # Admin panel: inactive tracks are excluded from recommendations/search but kept in the catalog.
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # FR-02: raw audio-feature tags (energy, valence, tempo, danceability, ...) from the source API.
    audio_features: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # FR-03: embedding for pgvector similarity search against mood-prompt embeddings.
    embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.embedding_dim), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    mood_links: Mapped[list["TrackMood"]] = relationship(back_populates="track", cascade="all, delete-orphan")


class TrackMood(Base):
    """Many-to-many Track<->Mood with a match strength, used by the FR-03 recommendation engine."""

    __tablename__ = "track_moods"

    track_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tracks.id", ondelete="CASCADE"), primary_key=True
    )
    mood_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("moods.id", ondelete="CASCADE"), primary_key=True
    )
    weight: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)

    track: Mapped["Track"] = relationship(back_populates="mood_links")
    mood: Mapped["Mood"] = relationship(back_populates="track_links")
