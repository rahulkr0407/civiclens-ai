"""Request and response contracts for the CivicLens AI endpoint.

Single source of truth for the /api/ai/explain data shape.
Define the schema for the AI explanation.

Note: viewpoints mirror the existing Topic model ({side, explanation})
so the AI output stays consistent with curated topic content.
"""

from typing import Optional

from pydantic import BaseModel, Field


# =========================
# Request Models
# =========================

class ExplainRequest(BaseModel):
    topic_id: str
    age: int
    education_level: str
    interests: list[str] = Field(default_factory=list)
    style: Optional[str] = None


# =========================
# Response Models
# =========================

class Viewpoint(BaseModel):
    side: str
    explanation: str


class ExplainResponse(BaseModel):
    topicTitle: str
    simpleExplanation: str
    whyItMatters: str
    keyPoints: list[str]
    viewpoints: list[Viewpoint]
    questionsToThinkAbout: list[str]