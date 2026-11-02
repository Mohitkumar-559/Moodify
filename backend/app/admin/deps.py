from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import decode_access_token
from app.models.user import User

ADMIN_COOKIE_NAME = "admin_session"


class AdminAuthRequired(Exception):
    """Raised when a request to an /admin page has no valid admin session.

    Caught by a handler in main.py that redirects to the login page — a JSON
    401 would be the wrong UX for a browser-rendered admin panel.
    """


def get_current_admin(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(ADMIN_COOKIE_NAME)
    user_id = decode_access_token(token) if token else None
    user = db.get(User, user_id) if user_id else None
    if user is None or not user.is_admin or not user.is_active:
        raise AdminAuthRequired()
    return user
