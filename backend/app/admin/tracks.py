import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, Form, Request, UploadFile
from fastapi.responses import HTMLResponse, RedirectResponse
from mutagen.mp3 import MP3
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_db
from app.core.config import settings
from app.models.mood import Mood
from app.models.track import Track, TrackMood
from app.models.user import User

from .deps import get_current_admin
from .templates import templates

router = APIRouter(prefix="/tracks", tags=["admin-tracks"])

MEDIA_TRACKS_DIR = Path(__file__).resolve().parent.parent.parent / "media" / "tracks"


def _slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


@router.get("", response_class=HTMLResponse)
def list_tracks(
    request: Request,
    q: str | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    stmt = select(Track).order_by(Track.created_at.desc())
    if q:
        like = f"%{q}%"
        stmt = stmt.where((Track.title.ilike(like)) | (Track.artist.ilike(like)))
    tracks = db.scalars(stmt.limit(300)).all()
    return templates.TemplateResponse(
        request, "tracks_list.html", {"active": "tracks", "tracks": tracks, "q": q or ""}
    )


def _mood_form_context(db: Session, track: Track | None) -> list[dict]:
    moods = db.scalars(select(Mood).order_by(Mood.name)).all()
    weights_by_mood_id = {}
    if track is not None:
        weights_by_mood_id = {link.mood_id: link.weight for link in track.mood_links}
    return [
        {"id": m.id, "name": m.name, "slug": m.slug, "weight": weights_by_mood_id.get(m.id, 0)}
        for m in moods
    ]


@router.get("/new", response_class=HTMLResponse)
def new_track_form(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return templates.TemplateResponse(
        request,
        "track_form.html",
        {"active": "tracks", "track": None, "moods": _mood_form_context(db, None), "error": None},
    )


@router.get("/{track_id}/edit", response_class=HTMLResponse)
def edit_track_form(
    track_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    track = db.scalar(select(Track).where(Track.id == track_id).options(selectinload(Track.mood_links)))
    if track is None:
        return RedirectResponse(url="/admin/tracks", status_code=302)
    return templates.TemplateResponse(
        request,
        "track_form.html",
        {"active": "tracks", "track": track, "moods": _mood_form_context(db, track), "error": None},
    )


async def _save_upload(upload: UploadFile) -> tuple[str, int]:
    """Saves an uploaded audio file and returns (filename, duration_sec)."""
    MEDIA_TRACKS_DIR.mkdir(parents=True, exist_ok=True)
    ext = Path(upload.filename or "track.mp3").suffix or ".mp3"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = MEDIA_TRACKS_DIR / filename
    content = await upload.read()
    dest.write_bytes(content)
    duration_sec = 0
    try:
        duration_sec = round(MP3(dest).info.length)
    except Exception:
        pass  # non-MP3 or unreadable — admin can still set duration manually below
    return filename, duration_sec


def _sync_track_moods(db: Session, track: Track, mood_weights: dict[uuid.UUID, float]) -> None:
    existing = {link.mood_id: link for link in track.mood_links}
    for mood_id, weight in mood_weights.items():
        if weight <= 0:
            if mood_id in existing:
                db.delete(existing[mood_id])
        elif mood_id in existing:
            existing[mood_id].weight = weight
        else:
            db.add(TrackMood(track_id=track.id, mood_id=mood_id, weight=weight))


def _parse_mood_weights(form: dict) -> dict[uuid.UUID, float]:
    weights: dict[uuid.UUID, float] = {}
    for key, value in form.items():
        if key.startswith("mood_weight_") and value not in (None, ""):
            mood_id = uuid.UUID(key.removeprefix("mood_weight_"))
            try:
                weights[mood_id] = float(value)
            except ValueError:
                weights[mood_id] = 0
    return weights


@router.post("/new")
async def create_track(
    request: Request,
    title: str = Form(...),
    artist: str = Form(...),
    album: str = Form(""),
    duration_sec: int = Form(0),
    preview_url: str = Form(""),
    cover_url: str = Form(""),
    is_downloadable: bool = Form(False),
    license_type: str = Form(""),
    audio_file: UploadFile | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    resolved_preview_url = preview_url.strip() or None
    resolved_duration = duration_sec
    if audio_file is not None and audio_file.filename:
        filename, real_duration = await _save_upload(audio_file)
        resolved_preview_url = f"{settings.public_base_url}/media/tracks/{filename}"
        if real_duration > 0:
            resolved_duration = real_duration

    track = Track(
        title=title,
        artist=artist,
        album=album.strip() or None,
        duration_sec=resolved_duration,
        source="royalty_free",
        source_track_id=f"{_slugify(title)}-{_slugify(artist)}-{uuid.uuid4().hex[:8]}",
        preview_url=resolved_preview_url,
        cover_url=cover_url.strip() or None,
        is_downloadable=is_downloadable,
        license_type=license_type.strip() or None,
    )
    db.add(track)
    db.flush()

    form = await request.form()
    _sync_track_moods(db, track, _parse_mood_weights(dict(form)))
    db.commit()
    return RedirectResponse(url="/admin/tracks", status_code=302)


@router.post("/{track_id}/edit")
async def update_track(
    track_id: uuid.UUID,
    request: Request,
    title: str = Form(...),
    artist: str = Form(...),
    album: str = Form(""),
    duration_sec: int = Form(0),
    preview_url: str = Form(""),
    cover_url: str = Form(""),
    is_downloadable: bool = Form(False),
    license_type: str = Form(""),
    audio_file: UploadFile | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    track = db.scalar(select(Track).where(Track.id == track_id).options(selectinload(Track.mood_links)))
    if track is None:
        return RedirectResponse(url="/admin/tracks", status_code=302)

    track.title = title
    track.artist = artist
    track.album = album.strip() or None
    track.duration_sec = duration_sec
    track.preview_url = preview_url.strip() or None
    track.cover_url = cover_url.strip() or None
    track.is_downloadable = is_downloadable
    track.license_type = license_type.strip() or None

    if audio_file is not None and audio_file.filename:
        filename, real_duration = await _save_upload(audio_file)
        track.preview_url = f"{settings.public_base_url}/media/tracks/{filename}"
        if real_duration > 0:
            track.duration_sec = real_duration

    form = await request.form()
    _sync_track_moods(db, track, _parse_mood_weights(dict(form)))
    db.commit()
    return RedirectResponse(url=f"/admin/tracks/{track_id}/edit", status_code=302)


@router.post("/{track_id}/toggle-active")
def toggle_track_active(
    track_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    track = db.get(Track, track_id)
    if track is not None:
        track.is_active = not track.is_active
        db.commit()
    return RedirectResponse(url="/admin/tracks", status_code=302)


@router.post("/{track_id}/delete")
def delete_track(
    track_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    track = db.get(Track, track_id)
    if track is not None:
        db.delete(track)
        db.commit()
    return RedirectResponse(url="/admin/tracks", status_code=302)
