import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class TrackFeedback(Base):
    """
    FR-07: skip/like feedback captured and fed back into the recommendation engine.
    playback_position_sec doubles as the signal for the "skipped within first 30s"
    completion-rate metric (requirements.md §3).
    """

    __tablename__ = "track_feedback"
    __table_args__ = (
        Index("ix_track_feedback_track_id", "track_id"),
        Index("ix_track_feedback_user_created", "user_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    track_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tracks.id", ondelete="CASCADE"), nullable=False
    )
    playlist_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("playlists.id", ondelete="SET NULL"), nullable=True
    )
    # 'like' | 'dislike' | 'skip' | 'completed'
    feedback_type: Mapped[str] = mapped_column(String(20), nullable=False)
    playback_position_sec: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="feedback")
    track: Mapped["Track"] = relationship()
    playlist: Mapped["Playlist | None"] = relationship()
