"""Civic trackers: current bills before Parliament and active protests.

Static content seeded via ``app/seed_trackers.py``. Read-only endpoints —
content is curated and kept neutral (both sides noted in ``viewpoints``).
"""

from fastapi import APIRouter, HTTPException

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


@router.get("/{tracker_id}")
def get_tracker(tracker_id: str):
    tracker = trackers_collection.find_one({"id": tracker_id}, {"_id": 0})
    if tracker is None:
        raise HTTPException(status_code=404, detail="Tracker not found.")
    return tracker