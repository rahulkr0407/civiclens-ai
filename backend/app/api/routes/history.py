"""Saved learning history (explanations + chat) per authenticated user.

Items are embedded in the user document under ``savedHistory`` in
``users_collection`` — no separate collection needed.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.database import users_collection

router = APIRouter(
    prefix="/history",
    tags=["History"],
)

MAX_HISTORY_ITEMS = 100
MAX_SAVED_TOPICS = 100


# =========================
# Request Models
# =========================

class SaveHistoryRequest(BaseModel):
    type: Literal["explain", "chat"]
    topicId: str
    topicTitle: str
    language: str = "English"
    content: dict[str, Any]


class SaveTopicRequest(BaseModel):
    topicId: str
    topicTitle: str
    category: str = ""
    readTime: str = ""
    summary: str = ""


# =========================
# Endpoints
# =========================

@router.get("")
def list_history(user: dict = Depends(get_current_user)):
    saved = user.get("savedHistory", [])
    return {"items": saved}


@router.post("")
def save_history(
    request: SaveHistoryRequest,
    user: dict = Depends(get_current_user),
):
    item = {
        "id": uuid.uuid4().hex,
        "type": request.type,
        "topicId": request.topicId,
        "topicTitle": request.topicTitle,
        "language": request.language,
        "content": request.content,
        "savedAt": datetime.now(timezone.utc).isoformat(),
    }

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$push": {
                "savedHistory": {
                    "$each": [item],
                    "$position": 0,
                    "$slice": MAX_HISTORY_ITEMS,
                }
            }
        },
    )

    return {"message": "Saved to your dashboard.", "item": item}


@router.delete("/{item_id}")
def delete_history_item(
    item_id: str,
    user: dict = Depends(get_current_user),
):
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$pull": {"savedHistory": {"id": item_id}}},
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Saved item not found.",
        )

    return {"message": "Removed from your dashboard."}


@router.delete("")
def clear_history(user: dict = Depends(get_current_user)):
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"savedHistory": []}},
    )
    return {"message": "Your dashboard has been cleared."}


# =========================
# Saved Topics
# =========================

@router.get("/topics")
def list_saved_topics(user: dict = Depends(get_current_user)):
    saved = user.get("savedTopics", [])
    return {"items": saved}


@router.post("/topics")
def save_topic(
    request: SaveTopicRequest,
    user: dict = Depends(get_current_user),
):
    existing = user.get("savedTopics", [])
    if any(t.get("topicId") == request.topicId for t in existing):
        return {"message": "Topic already saved.", "item": request.model_dump()}

    item = {
        **request.model_dump(),
        "savedAt": datetime.now(timezone.utc).isoformat(),
    }

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$push": {
                "savedTopics": {
                    "$each": [item],
                    "$position": 0,
                    "$slice": MAX_SAVED_TOPICS,
                }
            }
        },
    )

    return {"message": "Topic saved.", "item": item}


@router.delete("/topics/{topic_id}")
def delete_saved_topic(
    topic_id: str,
    user: dict = Depends(get_current_user),
):
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$pull": {"savedTopics": {"topicId": topic_id}}},
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Saved topic not found.")

    return {"message": "Topic removed from your saved list."}