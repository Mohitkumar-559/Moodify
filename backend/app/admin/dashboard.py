from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.playlist import Playlist
from app.models.track import Track
from app.models.user import User

from .analytics import get_trending_rows
from .deps import get_current_admin
from .templates import templates

router = APIRouter(tags=["admin-dashboard"])


@router.get("/", response_class=HTMLResponse)
def dashboard(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user_count = db.scalar(select(func.count(User.id)))
    active_user_count = db.scalar(select(func.count(User.id)).where(User.is_active.is_(True)))
    track_count = db.scalar(select(func.count(Track.id)))
    active_track_count = db.scalar(select(func.count(Track.id)).where(Track.is_active.is_(True)))
    playlist_count = db.scalar(select(func.count(Playlist.id)))
    top_tracks = get_trending_rows(db, limit=5, sort="plays")

    return templates.TemplateResponse(
        request,
        "dashboard.html",
        {
            "active": "dashboard",
            "user_count": user_count,
            "active_user_count": active_user_count,
            "track_count": track_count,
            "active_track_count": active_track_count,
            "playlist_count": playlist_count,
            "top_tracks": top_tracks,
        },
    )
