import uuid

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.feedback import TrackFeedback
from app.models.playlist import Playlist
from app.models.user import User

from .deps import get_current_admin
from .templates import templates

router = APIRouter(prefix="/users", tags=["admin-users"])


@router.get("", response_class=HTMLResponse)
def list_users(
    request: Request,
    q: str | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    stmt = select(User).order_by(User.created_at.desc())
    if q:
        like = f"%{q}%"
        stmt = stmt.where((User.email.ilike(like)) | (User.display_name.ilike(like)))
    users = db.scalars(stmt.limit(200)).all()
    return templates.TemplateResponse(
        request, "users_list.html", {"active": "users", "users": users, "q": q or ""}
    )


@router.get("/{user_id}", response_class=HTMLResponse)
def user_detail(
    user_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if user is None:
        return RedirectResponse(url="/admin/users", status_code=302)

    playlist_count = db.scalar(select(func.count(Playlist.id)).where(Playlist.user_id == user_id))
    feedback_count = db.scalar(select(func.count(TrackFeedback.id)).where(TrackFeedback.user_id == user_id))
    return templates.TemplateResponse(
        request,
        "user_detail.html",
        {
            "active": "users",
            "user": user,
            "playlist_count": playlist_count,
            "feedback_count": feedback_count,
            "current_admin_id": admin.id,
        },
    )


@router.post("/{user_id}/edit")
def edit_user(
    user_id: uuid.UUID,
    display_name: str = Form(...),
    email: str = Form(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if user is not None:
        user.display_name = display_name
        user.email = email
        db.commit()
    return RedirectResponse(url=f"/admin/users/{user_id}", status_code=302)


@router.post("/{user_id}/toggle-active")
def toggle_active(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if user is not None:
        user.is_active = not user.is_active
        db.commit()
    return RedirectResponse(url=f"/admin/users/{user_id}", status_code=302)


@router.post("/{user_id}/toggle-admin")
def toggle_admin(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if user is not None and user.id != admin.id:  # can't demote yourself out of the panel
        user.is_admin = not user.is_admin
        db.commit()
    return RedirectResponse(url=f"/admin/users/{user_id}", status_code=302)


@router.post("/{user_id}/delete")
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if user is not None and user.id != admin.id:  # can't delete yourself
        db.delete(user)
        db.commit()
    return RedirectResponse(url="/admin/users", status_code=302)
