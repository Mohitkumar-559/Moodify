from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.admin.deps import AdminAuthRequired
from app.admin.router import router as admin_router
from app.api.routes import auth, playlists

app = FastAPI(title="Moodify API")


@app.exception_handler(AdminAuthRequired)
async def admin_auth_required_handler(request: Request, exc: AdminAuthRequired) -> RedirectResponse:
    return RedirectResponse(url="/admin/login", status_code=302)

# Dev-only demo catalog audio (see scripts/download_demo_tracks.py). A real
# deployment streams from Spotify/Apple's SDK instead (requirements.md §8).
MEDIA_DIR = Path(__file__).resolve().parent.parent / "media"
MEDIA_DIR.mkdir(exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

# Dev-only: the Expo client runs on a different origin (localhost:8090/19006/etc.)
# Tighten this before any non-local deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(playlists.router)
app.include_router(admin_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
