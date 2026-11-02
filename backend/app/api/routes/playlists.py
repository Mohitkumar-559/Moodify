import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user, get_db
from app.models.feedback import TrackFeedback
from app.models.mood import Mood
from app.models.playlist import Playlist, PlaylistTrack
from app.models.track import Track
from app.models.user import User
from app.schemas.playlist import (
    GeneratePlaylistRequest,
    MoodResponse,
    PlaylistDetailResponse,
    PlaylistSummaryResponse,
    TrackFeedbackRequest,
)
from app.services.mood_interpreter import interpret_mood
from app.services.recommendation import accent_color_for_mood, recommend_tracks

router = APIRouter(tags=["playlists"])


@router.get("/moods", response_model=list[MoodResponse])
def list_moods(db: Session = Depends(get_db)) -> list[Mood]:
    return list(db.scalars(select(Mood).order_by(Mood.name)).all())


@router.post("/playlists/generate", response_model=PlaylistDetailResponse, status_code=status.HTTP_201_CREATED)
def generate_playlist(
    payload: GeneratePlaylistRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Playlist:
    """FR-01/FR-02/FR-03: mood prompt/chip -> interpreted mood -> matched tracks -> saved playlist."""
    mood = interpret_mood(db, payload.mood_slug, payload.mood_prompt_text)

    tracks = recommend_tracks(db, mood)
    if not tracks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No tracks available for mood '{mood.slug}' yet",
        )

    playlist = Playlist(
        user_id=current_user.id,
        title=f"{mood.name} Mix",
        mood_prompt_text=payload.mood_prompt_text,
        primary_mood_id=mood.id,
        cover_accent_color=accent_color_for_mood(mood.slug),
    )
    playlist.tracks = [
        PlaylistTrack(track_id=track.id, position=i) for i, track in enumerate(tracks)
    ]
    db.add(playlist)
    db.commit()

    return _load_playlist_detail(db, playlist.id)


@router.get("/playlists", response_model=list[PlaylistSummaryResponse])
def list_playlists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[PlaylistSummaryResponse]:
    stmt = (
        select(Playlist, func.count(PlaylistTrack.id).label("track_count"))
        .outerjoin(PlaylistTrack, PlaylistTrack.playlist_id == Playlist.id)
        .where(Playlist.user_id == current_user.id)
        .options(selectinload(Playlist.primary_mood))
        .group_by(Playlist.id)
        .order_by(Playlist.created_at.desc())
    )
    rows = db.execute(stmt).all()
    return [
        PlaylistSummaryResponse(
            id=playlist.id,
            title=playlist.title,
            mood_prompt_text=playlist.mood_prompt_text,
            primary_mood=MoodResponse.model_validate(playlist.primary_mood) if playlist.primary_mood else None,
            cover_accent_color=playlist.cover_accent_color,
            track_count=track_count,
            created_at=playlist.created_at,
        )
        for playlist, track_count in rows
    ]


@router.get("/playlists/{playlist_id}", response_model=PlaylistDetailResponse)
def get_playlist(
    playlist_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Playlist:
    playlist = _load_playlist_detail(db, playlist_id)
    if playlist is None or playlist.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")
    return playlist


@router.post("/tracks/{track_id}/feedback", status_code=status.HTTP_204_NO_CONTENT)
def submit_track_feedback(
    track_id: uuid.UUID,
    payload: TrackFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """FR-07: like/dislike/skip feedback, fed back into the recommendation engine."""
    if db.get(Track, track_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    db.add(
        TrackFeedback(
            user_id=current_user.id,
            track_id=track_id,
            playlist_id=payload.playlist_id,
            feedback_type=payload.feedback_type,
            playback_position_sec=payload.playback_position_sec,
        )
    )
    db.commit()


def _load_playlist_detail(db: Session, playlist_id: uuid.UUID) -> Playlist | None:
    stmt = (
        select(Playlist)
        .where(Playlist.id == playlist_id)
        .options(
            selectinload(Playlist.primary_mood),
            selectinload(Playlist.tracks).selectinload(PlaylistTrack.track),
        )
    )
    return db.scalar(stmt)
