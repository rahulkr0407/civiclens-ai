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

from app.ai.models import ExplainRequest, ExplainResponse
from app.ai.prompts import build_system_prompt, build_user_prompt


# =========================
# Configuration (server-side only — never exposed to the frontend)
# =========================

GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
GEMINI_MODEL_ENV = "GEMINI_MODEL"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_TEMPERATURE = 0.2


# =========================
# Errors
# =========================

class AIServiceError(Exception):
    """Base class for all CivicLens AI service errors."""


class AINotConfiguredError(AIServiceError):
    """Raised when the required Gemini API key is not configured."""


class AIProviderError(AIServiceError):
    """Raised when the AI provider fails (network, quota, invalid response)."""


_HTTP_URL_PATTERN = re.compile(r"https?://\S+", re.IGNORECASE)


# =========================
# Generation
# =========================

def generate(request: ExplainRequest, topic: dict) -> ExplainResponse:
    """Generate a grounded, age-appropriate, neutral explanation."""
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

        response = client.models.generate_content(
            model=model,
            contents=build_user_prompt(topic, request),
            config=types.GenerateContentConfig(
                system_instruction=build_system_prompt(),
                temperature=GEMINI_TEMPERATURE,
                response_mime_type="application/json",
                response_json_schema=ExplainResponse.model_json_schema(),
            ),
        )

        if not response.text:
            raise AIProviderError("The AI provider returned an empty response.")

        return ExplainResponse.model_validate_json(response.text)

    except AINotConfiguredError:
        raise
    except AIProviderError:
        raise
    except Exception as exc:
        raise AIProviderError(
            f"The AI provider could not generate a valid explanation: {exc}"
        ) from exc


# =========================
# Verification
# =========================

def verify(response: ExplainResponse, topic: dict) -> bool:
    """Check the generated explanation is grounded in the topic material.

    Returns True when the response passes all checks:
    - the topic title matches the requested topic
    - no URLs appear that are not in the topic's list of official sources
    - no key point, viewpoint or question is blank
    - there is at least one key point and one viewpoint
    """
    if response.topicTitle.strip().lower() != str(topic.get("title", "")).strip().lower():
        return False

    allowed_urls = {str(s.get("url", "")).strip() for s in topic.get("sources", [])}

    serialized = response.model_dump_json()
    found_urls = set(_HTTP_URL_PATTERN.findall(serialized))
    invented_urls = found_urls - allowed_urls
    if invented_urls:
        return False

    if not response.keyPoints or any(not str(p).strip() for p in response.keyPoints):
        return False

    if not response.viewpoints:
        return False
    for viewpoint in response.viewpoints:
        if not str(viewpoint.side).strip() or not str(viewpoint.explanation).strip():
            return False

    if any(not str(q).strip() for q in response.questionsToThinkAbout):
        return False

    return True