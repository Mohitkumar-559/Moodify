#!/usr/bin/env bash
# Render start command (see render.yaml). Every step is idempotent.
set -euo pipefail

alembic upgrade head
python scripts/seed_dev_data.py

if [[ -n "${ADMIN_EMAIL:-}" && -n "${ADMIN_PASSWORD:-}" ]]; then
  python scripts/create_admin.py "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
