import threading
import time

from fastapi import APIRouter, HTTPException

from app.ai.models import ChatRequest, ChatResponse, ExplainRequest, ExplainResponse
from app.ai.service import (
    AINotConfiguredError,
    AIProviderError,
    chat,
    generate,
    verify,
    verify_chat,
)
from app.db.database import topics_collection

router = APIRouter()

EXPLAIN_CACHE_TTL_SECONDS = 600

_cache_lock = threading.Lock()
_explain_cache: dict[str, tuple[float, ExplainResponse]] = {}


def _ai_error_response(exc: Exception, action: str) -> HTTPException:
    if isinstance(exc, AINotConfiguredError):
        return HTTPException(
            status_code=502,
            detail="AI explanations are not configured yet. Please try again later.",
        )
    if isinstance(exc, AIProviderError):
        if exc.status_code == 429:
            detail = _rate_limit_detail(exc)
        else:
            detail = (
                f"The AI service is temporarily unavailable while {action}. "
                "Please try again later."
            )
        return HTTPException(status_code=502, detail=detail)
    return HTTPException(
        status_code=500,
        detail=f"Something went wrong {action}.",
    )


_QUOTA_EXHAUSTION_MARKERS = (
    "free_tier",
    "free tier",
    "generate_content_free_tier",
    "per day",
    "per-day",
    "daily",
)


def _rate_limit_detail(exc: AIProviderError) -> str:
    """Give a specific message when the 429 is the free-tier daily quota."""
    text = str(exc).lower()

    if any(marker in text for marker in _QUOTA_EXHAUSTION_MARKERS):
        return (
            "The AI service's free tier is metered per day and that limit is "
            "currently used up. Please try again after the daily reset, or "
            "raise the limit on the AI project."
        )

    return (
        "The AI service is receiving too many requests right now "
        "(the free tier is metered). Please wait a minute and try again."
    )


def _cached_explain(key: str) -> ExplainResponse | None:
    with _cache_lock:
        entry = _explain_cache.get(key)
        if entry is None:
            return None
        expires_at, response = entry
        if time.time() > expires_at:
            _explain_cache.pop(key, None)
            return None
        return response


def _store_explain(key: str, response: ExplainResponse) -> None:
    with _cache_lock:
        _explain_cache[key] = (time.time() + EXPLAIN_CACHE_TTL_SECONDS, response)


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

    cache_key = f"{request.topic_id}::{request.model_dump_json()}"
    cached = _cached_explain(cache_key)
    if cached is not None:
        return cached

    try:
        response = generate(request, topic)
    except (AINotConfiguredError, AIProviderError) as exc:
        raise _ai_error_response(exc, "generating the explanation") from exc

    if not verify(response, topic):
        raise HTTPException(
            status_code=502,
            detail="The AI explanation could not be verified against the topic sources. Please try again.",
        )

    _store_explain(cache_key, response)
    return response


@router.post("/ai/chat", response_model=ChatResponse)
def chat_topic(request: ChatRequest):

    topic = topics_collection.find_one(
        {"id": request.topic_id},
        {"_id": 0},
    )

    if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found.",
        )

    if not request.messages:
        raise HTTPException(
            status_code=422,
            detail="A chat message is required.",
        )

    try:
        reply = chat(request, topic)
    except (AINotConfiguredError, AIProviderError) as exc:
        raise _ai_error_response(exc, "answering your question") from exc

    if not verify_chat(reply, topic):
        raise HTTPException(
            status_code=502,
            detail="The AI response could not be verified against the topic sources. Please try again.",
        )

    return ChatResponse(reply=reply)