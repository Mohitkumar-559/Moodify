from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import create_access_token, verify_password
from app.models.user import User

from .deps import ADMIN_COOKIE_NAME
from .templates import templates

router = APIRouter(tags=["admin-auth"])


@router.get("/login", response_class=HTMLResponse)
def login_form(request: Request, error: str | None = None):
    return templates.TemplateResponse(request, "login.html", {"error": error})


@router.post("/login")
def login_submit(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    user = db.scalar(select(User).where(User.email == email))
    valid = (
        user is not None
        and user.password_hash is not None
        and verify_password(password, user.password_hash)
        and user.is_admin
        and user.is_active
    )
    if not valid:
        return RedirectResponse(url="/admin/login?error=1", status_code=302)

    token = create_access_token(user.id)
    response = RedirectResponse(url="/admin", status_code=302)
    response.set_cookie(
        ADMIN_COOKIE_NAME, token, httponly=True, samesite="lax", max_age=60 * 60 * 24 * 7
    )
    return response


@router.post("/logout")
def logout():
    response = RedirectResponse(url="/admin/login", status_code=302)
    response.delete_cookie(ADMIN_COOKIE_NAME)
    return response
