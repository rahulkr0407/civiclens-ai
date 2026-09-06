"""Provider-agnostic AI generation service.

Phase 6: Google Gemini provider wired via the google-genai SDK.
- generate(): builds grounded prompts and calls Gemini with structured
  output matching ExplainResponse.
- verify(): checks the generated explanation against the topic material
  (no fabricated sources, title consistency, non-empty fields).

The service remains provider-agnostic at the call site so another provider
could be added without touching the route or prompts.
"""

import os
import re
import time

from app.ai.models import (
    ChatRequest,
    ChatTrackerRequest,
    ExplainRequest,
    ExplainResponse,
    ExplainTrackerRequest,
)
from app.ai.prompts import (
    build_chat_system_prompt,
    build_chat_user_prompt,
    build_system_prompt,
    build_tracker_chat_system_prompt,
    build_tracker_chat_user_prompt,
    build_tracker_system_prompt,
    build_tracker_user_prompt,
    build_user_prompt,
)


# =========================
# Configuration (server-side only — never exposed to the frontend)
# =========================

GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
GEMINI_MODEL_ENV = "GEMINI_MODEL"
GEMINI_MAX_RETRIES_ENV = "GEMINI_MAX_RETRIES"
DEFAULT_GEMINI_MODEL = "gemini-3.6-flash"
GEMINI_TEMPERATURE = 0.2
DEFAULT_MAX_RETRIES = 3
ChatHistory = 6


_HTTP_URL_PATTERN = re.compile(r"https?://\S+", re.IGNORECASE)
_TRAILING_URL_PUNCTUATION = re.compile(r"[\.,;:!?\)\]\}]+$")

_RETRYABLE_STATUSES = {429, 500, 502, 503, 504}
_RETRY_BACKOFF_SECONDS = (5.0, 20.0, 40.0)


# =========================
# Errors
# =========================

class AIServiceError(Exception):
    """Base class for all CivicLens AI service errors."""


class AINotConfiguredError(AIServiceError):
    """Raised when the required Gemini API key is not configured."""


class AIProviderError(AIServiceError):
    """Raised when the AI provider fails (network, quota, invalid response)."""

    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


# =========================
# Provider call helpers
# =========================

def _provider_status_code(exc: Exception) -> int | None:
    """Best-effort extraction of the HTTP status from a provider exception."""
    for attr in ("code", "status_code"):
        value = getattr(exc, attr, None)
        if value is None:
            continue
        try:
            return int(value)
        except (TypeError, ValueError):
            continue
    return None


def _is_retryable(exc: Exception) -> bool:
    return _provider_status_code(exc) in _RETRYABLE_STATUSES


def _call_with_retry(fn):
    """Call ``fn()`` retrying transient provider errors with backoff.

    Only status codes in ``_RETRYABLE_STATUSES`` (quota exhaustion, server
    errors, ...) are retried; invalid requests and auth errors surface at once.
    Rate limits (429) get a single short retry so a fast-recovering throttle
    can succeed without long delays when the daily free-tier cap is the cause.
    """
    attempts = int(os.getenv(GEMINI_MAX_RETRIES_ENV, DEFAULT_MAX_RETRIES))
    last_exc: Exception | None = None

    for attempt in range(1, attempts + 1):
        try:
            return fn()
        except Exception as exc:
            last_exc = exc
            code = _provider_status_code(exc)
            if not _is_retryable(exc):
                raise
            if code == 429 and attempt >= 2:
                raise
            if attempt >= attempts:
                raise
            delay = 5.0 if code == 429 else _RETRY_BACKOFF_SECONDS[
                min(attempt - 1, len(_RETRY_BACKOFF_SECONDS) - 1)
            ]
            print(
                f"[civiclens-ai] provider status {code} "
                f"(attempt {attempt}/{attempts}) retrying in {delay:.0f}s",
                flush=True,
            )
            time.sleep(delay)

    assert last_exc is not None
    raise last_exc


# =========================
# Generation
# =========================

def _generate_structured_response(
    prompt: str,
    system_instruction: str,
    label: str,
) -> ExplainResponse:
    """Call the provider with structured-output schema and parse the response."""
    api_key = os.getenv(GEMINI_API_KEY_ENV)
    if not api_key:
        raise AINotConfiguredError(
            f"{GEMINI_API_KEY_ENV} is not configured. "
            "Set it server-side (e.g. Render environment variables)."
        )

    model = os.getenv(GEMINI_MODEL_ENV, DEFAULT_GEMINI_MODEL)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        response = _call_with_retry(
            lambda: client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=GEMINI_TEMPERATURE,
                    response_mime_type="application/json",
                    response_json_schema=ExplainResponse.model_json_schema(),
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(
                        disable=True
                    ),
                ),
            )
        )

        if not response.text:
            raise AIProviderError("The AI provider returned an empty response.")

        return ExplainResponse.model_validate_json(response.text)

    except AINotConfiguredError:
        raise
    except AIProviderError:
        raise
    except Exception as exc:
        print(f"[civiclens-ai] provider error: {type(exc).__name__}: {exc}", flush=True)
        raise AIProviderError(
            f"The AI provider could not generate a valid {label}: {exc}",
            status_code=_provider_status_code(exc),
        ) from exc


def generate(request: ExplainRequest, topic: dict) -> ExplainResponse:
    """Generate a grounded, age-appropriate, neutral explanation."""
    return _generate_structured_response(
        build_user_prompt(topic, request),
        build_system_prompt(),
        "explanation",
    )


def generate_tracker(
    request: ExplainTrackerRequest,
    tracker: dict,
) -> ExplainResponse:
    """Generate a grounded explanation for a bill or protest tracker."""
    return _generate_structured_response(
        build_tracker_user_prompt(tracker, request),
        build_tracker_system_prompt(),
        "tracker explanation",
    )


# =========================
# Follow-up chat
# =========================

def chat(request: ChatRequest, topic: dict) -> str:
    """Answer a follow-up question, grounded in the topic material."""
    messages = request.messages[-ChatHistory:]
    return _generate_text_response(
        build_chat_user_prompt(topic, request, messages),
        build_chat_system_prompt(),
        "an answer",
    )


def chat_tracker(request: ChatTrackerRequest, tracker: dict) -> str:
    """Answer a follow-up question, grounded in the tracker material."""
    messages = request.messages[-ChatHistory:]
    return _generate_text_response(
        build_tracker_chat_user_prompt(tracker, request, messages),
        build_tracker_chat_system_prompt(),
        "an answer",
    )


def _generate_text_response(
    prompt: str,
    system_instruction: str,
    label: str,
) -> str:
    """Call the provider with plain-text output and return the trimmed text."""
    api_key = os.getenv(GEMINI_API_KEY_ENV)
    if not api_key:
        raise AINotConfiguredError(
            f"{GEMINI_API_KEY_ENV} is not configured. "
            "Set it server-side (e.g. Render environment variables)."
        )

    model = os.getenv(GEMINI_MODEL_ENV, DEFAULT_GEMINI_MODEL)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        response = _call_with_retry(
            lambda: client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=GEMINI_TEMPERATURE,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(
                        disable=True
                    ),
                ),
            )
        )

        if not response.text:
            raise AIProviderError("The AI provider returned an empty response.")

        return response.text.strip()

    except AINotConfiguredError:
        raise
    except AIProviderError:
        raise
    except Exception as exc:
        print(f"[civiclens-ai] provider error: {type(exc).__name__}: {exc}", flush=True)
        raise AIProviderError(
            f"The AI provider could not generate {label}: {exc}",
            status_code=_provider_status_code(exc),
        ) from exc


# =========================
# Verification
# =========================

def _hostname(url: str) -> str:
    """Return the lowercased host of a URL with a leading 'www.' stripped."""
    url = _TRAILING_URL_PUNCTUATION.sub("", url.strip())
    match = re.match(r"https?://([^/]+)", url, re.IGNORECASE)
    if not match:
        return ""
    host = match.group(1).lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def _reject(reason: str) -> bool:
    print(f"[civiclens-ai verify] rejected explanation: {reason}")
    return False


def verify(response: ExplainResponse, topic: dict) -> bool:
    """Check the generated explanation is grounded in the topic material.

    Returns True when the response passes all checks:
    - the topic title matches the requested topic (loosely: equal, or one
      contains the other, so rephrased titles like "Goods and Services Tax
      (GST)" still map to the stored "GST")
    - no URLs appear whose host is not one of the topic's official source
      hosts (trailing slashes, punctuation and a leading 'www.' are ignored)
    - no key point, viewpoint or question is blank
    - there is at least one key point and one viewpoint
    """
    topic_title = str(topic.get("title", "")).strip().lower()
    title = response.topicTitle.strip().lower()
    if not (title == topic_title or topic_title in title or title in topic_title):
        return _reject("topic title mismatch")

    allowed_hosts = {_hostname(str(s.get("url", ""))) for s in topic.get("sources", [])}
    allowed_hosts.discard("")

    serialized = response.model_dump_json()
    found_urls = set(_HTTP_URL_PATTERN.findall(serialized))
    for url in found_urls:
        if _hostname(url) not in allowed_hosts:
            return _reject(f"URL outside official sources: {url}")

    if not response.keyPoints or any(not str(p).strip() for p in response.keyPoints):
        return _reject("blank key point")

    if not response.viewpoints:
        return _reject("no viewpoints")
    for viewpoint in response.viewpoints:
        if not str(viewpoint.side).strip() or not str(viewpoint.explanation).strip():
            return _reject("blank viewpoint")

    if any(not str(q).strip() for q in response.questionsToThinkAbout):
        return _reject("blank question")

    return True


def verify_chat(reply: str, topic: dict) -> bool:
    """Check a chat reply does not cite URLs outside the topic's official sources."""
    allowed_hosts = {_hostname(str(s.get("url", ""))) for s in topic.get("sources", [])}
    allowed_hosts.discard("")

    for url in _HTTP_URL_PATTERN.findall(reply):
        if _hostname(url) not in allowed_hosts:
            _reject(f"chat URL outside official sources: {url}")
            return False

    return True