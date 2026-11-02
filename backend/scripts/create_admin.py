"""
Creates (or promotes) an admin user for the /admin panel.

Usage:
  cd backend && .venv\\Scripts\\python.exe scripts\\create_admin.py <email> <password> ["Display Name"]

If a user with that email already exists, it's promoted to admin (and
reactivated if it was suspended) rather than erroring.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.core.security import hash_password  # noqa: E402
from app.db.base import User  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402


def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    email, password = sys.argv[1], sys.argv[2]
    display_name = sys.argv[3] if len(sys.argv) > 3 else "Admin"

    db = SessionLocal()
    try:
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            user = User(
                email=email,
                password_hash=hash_password(password),
                display_name=display_name,
                auth_provider="password",
            )
            db.add(user)
            print(f"Created new admin user: {email}")
        else:
            user.password_hash = hash_password(password)
            print(f"Promoted existing user to admin: {email}")

        user.is_admin = True
        user.is_active = True
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
