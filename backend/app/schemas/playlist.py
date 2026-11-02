import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MoodResponse(BaseModel):
    id: uuid.UUID
    slug: str
    name: str

    model_config = {"from_attributes": True}


class GeneratePlaylistRequest(BaseModel):
    # FR-01: either free text or a chip slug — at least one must be given.
    mood_prompt_text: str | None = Field(default=None, max_length=280)
    mood_slug: str | None = Field(default=None, max_length=40)


class TrackResponse(BaseModel):
    id: uuid.UUID
    title: str
    artist: str
    album: str | None
    duration_sec: int
    preview_url: str | None
    cover_url: str | None
    is_downloadable: bool

    model_config = {"from_attributes": True}


class PlaylistTrackResponse(BaseModel):
    position: int
    track: TrackResponse

    model_config = {"from_attributes": True}


class PlaylistSummaryResponse(BaseModel):
    id: uuid.UUID
    title: str
    mood_prompt_text: str | None
    primary_mood: MoodResponse | None
    cover_accent_color: str | None
    track_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PlaylistDetailResponse(BaseModel):
    id: uuid.UUID
    title: str
    mood_prompt_text: str | None
    primary_mood: MoodResponse | None
    cover_accent_color: str | None
    created_at: datetime
    tracks: list[PlaylistTrackResponse]

    model_config = {"from_attributes": True}


class TrackFeedbackRequest(BaseModel):
    playlist_id: uuid.UUID | None = None
    # FR-07
    feedback_type: str = Field(pattern="^(like|dislike|skip|completed)$")
    playback_position_sec: int | None = Field(default=None, ge=0)
