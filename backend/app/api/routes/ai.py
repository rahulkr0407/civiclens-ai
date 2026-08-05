from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ExplainRequest(BaseModel):
    topic_id: str
    age: int


@router.post("/ai/explain")
def explain_topic(request: ExplainRequest):
    return {
        "topic_id": request.topic_id,
        "age": request.age,
        "explanation": "This is a test AI explanation. The real AI response will be connected next.",
    }