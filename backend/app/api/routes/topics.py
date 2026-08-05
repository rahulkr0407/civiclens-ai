from fastapi import APIRouter
from app.db.database import topics_collection

router = APIRouter()


@router.get("/topics")
def get_topics():
    topics = list(topics_collection.find({}, {"_id": 0}))

    return topics