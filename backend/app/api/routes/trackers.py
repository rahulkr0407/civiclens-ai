"""Civic trackers: current bills before Parliament and active protests.

Static content seeded via ``app/seed_trackers.py``. Read-only endpoints —
content is curated and kept neutral (both sides noted in ``viewpoints``).
"""

from fastapi import APIRouter

from app.db.database import trackers_collection

router = APIRouter(
    prefix="/trackers",
    tags=["Trackers"],
)


@router.get("")
def list_trackers(
    type: str | None = None,
):
    query = {}
    if type in ("bill", "protest"):
        query["type"] = type

    trackers = list(
        trackers_collection.find(query, {"_id": 0}).sort("lastUpdated", -1)
    )
    return {"items": trackers}