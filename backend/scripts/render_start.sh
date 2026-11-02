#!/usr/bin/env bash
# Render start command (see render.yaml). Every step is idempotent.
set -euo pipefail

# Fail fast with a readable hint (scheme/host only — never print the password).
python - <<'EOF'
from sqlalchemy.engine import make_url
from app.core.config import settings
try:
    u = make_url(settings.database_url)
except Exception:
    raise SystemExit(
        "DATABASE_URL is not a valid URL (length %d). In the Render dashboard, set it to the "
        "Postgres 'Internal Database URL' with no quotes or spaces." % len(settings.database_url)
    )
print(f"DATABASE_URL ok: {u.drivername}://{u.host}/{u.database}")
EOF

alembic upgrade head
python scripts/seed_dev_data.py

if [[ -n "${ADMIN_EMAIL:-}" && -n "${ADMIN_PASSWORD:-}" ]]; then
  python scripts/create_admin.py "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
