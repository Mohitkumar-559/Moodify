from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.feedback import TrackFeedback
from app.models.track import Track
from app.models.user import User

from .deps import get_current_admin
from .templates import templates

router = APIRouter(prefix="/trending", tags=["admin-analytics"])

SORT_COLUMNS = {"plays": "play_count", "likes": "like_count"}


def get_trending_rows(db: Session, limit: int = 50, sort: str = "plays") -> list[dict]:
    """
    Aggregates track_feedback into per-track engagement counts — "trending"
    (play_count: any feedback event, i.e. a listen was attempted) and "most
    liked" (like_count), which is what FR-07's feedback loop was built to
    surface for exactly this kind of reporting.
    """
    play_count = func.count(TrackFeedback.id).label("play_count")
    like_count = func.count(TrackFeedback.id).filter(TrackFeedback.feedback_type == "like").label("like_count")
    dislike_count = func.count(TrackFeedback.id).filter(TrackFeedback.feedback_type == "dislike").label("dislike_count")
    skip_count = func.count(TrackFeedback.id).filter(TrackFeedback.feedback_type == "skip").label("skip_count")
    completed_count = func.count(TrackFeedback.id).filter(TrackFeedback.feedback_type == "completed").label("completed_count")

    order_col = {"play_count": play_count, "like_count": like_count}[SORT_COLUMNS.get(sort, "play_count")]

    stmt = (
        select(Track, play_count, like_count, dislike_count, skip_count, completed_count)
        .join(TrackFeedback, TrackFeedback.track_id == Track.id)
        .group_by(Track.id)
        .order_by(order_col.desc())
        .limit(limit)
    )
    rows = db.execute(stmt).all()
    return [
        {
            "track": track,
            "play_count": plays,
            "like_count": likes,
            "dislike_count": dislikes,
            "skip_count": skips,
            "completed_count": completed,
        }
        for track, plays, likes, dislikes, skips, completed in rows
    ]


@router.get("", response_class=HTMLResponse)
def trending(
    request: Request,
    sort: str = "plays",
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    rows = get_trending_rows(db, limit=100, sort=sort)
    return templates.TemplateResponse(
        request, "trending.html", {"active": "trending", "rows": rows, "sort": sort}
    )
