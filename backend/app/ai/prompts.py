"""Grounded prompt construction for the CivicLens AI explainer.

Phase 5 design: pure prompt-building functions, no LLM/provider calls.

The prompts are built to guarantee:
- neutrality and an educational tone (no political position)
- facts are only taken from the topic document and its listed sources
- the model never invents sources, links, statistics, dates or names
- facts are kept separate from different viewpoints
- language depth adapts to the learner's age and education level
- the explanation never changes factual meaning
"""

from typing import Optional

from app.ai.models import ExplainRequest


_SYSTEM_PROMPT = (
    "You are CivicLens AI, a neutral civic education assistant for India.\n"
    "You explain Indian laws, policies, government decisions and public issues "
    "in a simple, accurate and balanced way.\n\n"
    "Rules you must follow:\n"
    "1. Use ONLY the topic material and official references given below. "
    "Do not add facts, statistics, dates, names or events that are not present "
    "in that material.\n"
    "2. Never invent, guess, or fabricate sources. Never create URLs. "
    "Cite only by referring to the official references provided below.\n"
    "3. Clearly separate factual explanation from different viewpoints. "
    "Present every viewpoint neutrally, without favouring any side.\n"
    "4. Never express or imply a political position, and make no value "
    "judgements about political parties, governments, groups or people.\n"
    "5. Match the depth and vocabulary to the learner's age and education "
    "level, without changing the factual meaning.\n"
    "6. Keep the explanation concise, structured and easy to read.\n"
    "7. If the learner has interests, explain relevant concepts using "
    "those interests as helpful examples only when the topic material "
    "supports it.\n"
    "8. When you are unsure whether a fact is supported by the material, "
    "do not mention it."
)


def _render_viewpoints(viewpoints) -> str:
    lines = []
    for viewpoint in viewpoints:
        side = viewpoint.get("side", "")
        explanation = viewpoint.get("explanation", "")
        lines.append(f"- {side}: {explanation}")
    return "\n".join(lines) if lines else "- (no viewpoints available)"


def _render_sources(sources) -> str:
    lines = []
    for source in sources:
        name = source.get("name", "")
        url = source.get("url", "")
        lines.append(f"- {name} ({url})")
    return "\n".join(lines) if lines else "- (no sources available)"


def _render_key_points(key_points) -> str:
    if not key_points:
        return "- (no key points available)"
    return "\n".join(f"- {point}" for point in key_points)


def build_system_prompt() -> str:
    return _SYSTEM_PROMPT


def build_user_prompt(
    topic: dict,
    request: ExplainRequest,
) -> str:
    """Build the user prompt from a topic document and the learner's request."""
    interests = ", ".join(request.interests) if request.interests else "not provided"
    style = request.style or "automatic"

    topic_material = "\n".join(
        [
            f"Title: {topic.get('title', '')}",
            f"Category: {topic.get('category', '')}",
            f"Summary: {topic.get('summary', '')}",
            f"Why it matters: {topic.get('whyItMatters', '')}",
            "Key points:",
            _render_key_points(topic.get("keyPoints", [])),
            "Viewpoints:",
            _render_viewpoints(topic.get("viewpoints", [])),
            f"Current situation: {topic.get('currentSituation', '')}",
            "Official references used for this topic:",
            _render_sources(topic.get("sources", [])),
        ]
    )

    learner_profile = "\n".join(
        [
            f"- Age: {request.age}",
            f"- Education level: {request.education_level}",
            f"- Interests: {interests}",
            f"- Requested explanation style: {style}",
        ]
    )

    return (
        "Explain the following civic topic to this learner.\n\n"
        "== TOPIC MATERIAL =="
        "\n"
        + topic_material
        + "\n\n== LEARNER PROFILE ==\n"
        + learner_profile
        + "\n\nNow produce the explanation using ONLY the topic material above, "
        "respecting all the rules in your instructions."
    )