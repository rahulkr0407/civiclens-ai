from fastapi import APIRouter, HTTPException

from app.ai.models import ExplainRequest, ExplainResponse
from app.ai.service import (
    AINotConfiguredError,
    AIProviderError,
    generate,
    verify,
)
from app.db.database import topics_collection

router = APIRouter()


def _ai_error_response(exc: Exception) -> HTTPException:
    if isinstance(exc, AINotConfiguredError):
        return HTTPException(
            status_code=502,
            detail="AI explanations are not configured yet. Please try again later.",
        )
    if isinstance(exc, AIProviderError):
        return HTTPException(
            status_code=502,
            detail="The AI service is temporarily unavailable. Please try again later.",
        )
    return HTTPException(
        status_code=500,
        detail="Something went wrong generating the explanation.",
    )


@router.post("/ai/explain", response_model=ExplainResponse)
def explain_topic(request: ExplainRequest):

    topic = topics_collection.find_one(
        {"id": request.topic_id},
        {"_id": 0},
    )

    if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found.",
        )

    try:
        response = generate(request, topic)
    except (AINotConfiguredError, AIProviderError) as exc:
        raise _ai_error_response(exc) from exc

    if not verify(response, topic):
        raise HTTPException(
            status_code=502,
            detail="The AI explanation could not be verified against the topic sources. Please try again.",
        )

    return response