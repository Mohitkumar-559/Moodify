from fastapi import APIRouter

from . import analytics, auth, dashboard, tracks, users

router = APIRouter(prefix="/admin")
router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(users.router)
router.include_router(tracks.router)
router.include_router(analytics.router)
