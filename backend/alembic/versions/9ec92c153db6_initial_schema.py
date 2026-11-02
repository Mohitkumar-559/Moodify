"""initial schema

Revision ID: 9ec92c153db6
Revises:
Create Date: 2026-09-21 15:42:37.794138

Creates the Phase 1 tables: users (FR-05), moods (FR-01/FR-02), tracks +
track_moods (FR-02/FR-03/FR-08), playlists + playlist_tracks (FR-01/FR-04),
and track_feedback (FR-07). See docs/requirements.md §4/§6.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = '9ec92c153db6'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Must match app.core.config.Settings.embedding_dim.
EMBEDDING_DIM = 32


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("auth_provider", sa.String(length=30), nullable=False, server_default="password"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "moods",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=60), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("slug", name="uq_moods_slug"),
    )

    op.create_table(
        "tracks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("artist", sa.String(length=255), nullable=False),
        sa.Column("album", sa.String(length=255), nullable=True),
        sa.Column("duration_sec", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(length=30), nullable=False),
        sa.Column("source_track_id", sa.String(length=120), nullable=True),
        sa.Column("preview_url", sa.String(length=500), nullable=True),
        sa.Column("cover_url", sa.String(length=500), nullable=True),
        sa.Column("is_downloadable", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("license_type", sa.String(length=30), nullable=True),
        sa.Column("audio_features", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("embedding", Vector(EMBEDDING_DIM), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("source", "source_track_id", name="uq_tracks_source_source_track_id"),
    )
    # Cosine-distance ANN index for FR-03's mood-prompt -> track similarity search.
    op.execute(
        "CREATE INDEX ix_tracks_embedding_cosine ON tracks "
        "USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )

    op.create_table(
        "track_moods",
        sa.Column("track_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("mood_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("weight", sa.Float(), nullable=False, server_default="1.0"),
        sa.ForeignKeyConstraint(["track_id"], ["tracks.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["mood_id"], ["moods.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("track_id", "mood_id"),
    )

    op.create_table(
        "playlists",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("mood_prompt_text", sa.String(length=280), nullable=True),
        sa.Column("primary_mood_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("cover_accent_color", sa.String(length=7), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["primary_mood_id"], ["moods.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_playlists_user_id", "playlists", ["user_id"])

    op.create_table(
        "playlist_tracks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("playlist_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("track_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("added_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["playlist_id"], ["playlists.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["track_id"], ["tracks.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("playlist_id", "position", name="uq_playlist_tracks_position"),
        sa.UniqueConstraint("playlist_id", "track_id", name="uq_playlist_tracks_track"),
    )

    op.create_table(
        "track_feedback",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("track_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("playlist_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("feedback_type", sa.String(length=20), nullable=False),
        sa.Column("playback_position_sec", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["track_id"], ["tracks.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["playlist_id"], ["playlists.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_track_feedback_track_id", "track_feedback", ["track_id"])
    op.create_index("ix_track_feedback_user_created", "track_feedback", ["user_id", "created_at"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_track_feedback_user_created", table_name="track_feedback")
    op.drop_index("ix_track_feedback_track_id", table_name="track_feedback")
    op.drop_table("track_feedback")

    op.drop_table("playlist_tracks")

    op.drop_index("ix_playlists_user_id", table_name="playlists")
    op.drop_table("playlists")

    op.drop_table("track_moods")

    op.execute("DROP INDEX IF EXISTS ix_tracks_embedding_cosine")
    op.drop_table("tracks")

    op.drop_table("moods")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    op.execute("DROP EXTENSION IF EXISTS vector")
