from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mood import Mood

# FR-02: rule-based tagging — this is the fallback path requirements.md §5 calls
# for when the LLM mood interpreter is unavailable/times out. No LLM is wired up
# yet, so it's currently the only path; swap in an LLM call ahead of this when
# FR-02's interpreter is built, keeping this as the fallback.
MOOD_KEYWORDS: dict[str, list[str]] = {
    "chill": ["chill", "relax", "calm", "rainy", "rain", "lofi", "unwind", "mellow", "cozy"],
    "focus": ["focus", "work", "study", "concentration", "deep work", "productive", "coding"],
    "happy": ["happy", "joy", "upbeat", "fun", "cheerful", "party", "celebrate", "excited"],
    "workout": ["workout", "gym", "run", "running", "exercise", "training", "cardio", "pump"],
    "romantic": ["romantic", "love", "date", "candlelight", "valentine"],
    "sad": ["sad", "heartbreak", "cry", "lonely", "melancholy", "down", "blue", "breakup"],
}
DEFAULT_MOOD_SLUG = "chill"


def _score_prompt(prompt_text: str) -> str:
    text = prompt_text.lower()
    scores = {slug: sum(1 for kw in keywords if kw in text) for slug, keywords in MOOD_KEYWORDS.items()}
    best_slug, best_score = max(scores.items(), key=lambda item: item[1])
    return best_slug if best_score > 0 else DEFAULT_MOOD_SLUG


def interpret_mood(db: Session, mood_slug: str | None, mood_prompt_text: str | None) -> Mood:
    """Resolve a request's mood chip / free-text prompt (FR-01) to a canonical Mood row."""
    if not mood_slug and not mood_prompt_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide mood_slug or mood_prompt_text",
        )

    slug = mood_slug.lower() if mood_slug else _score_prompt(mood_prompt_text)

    mood = db.scalar(select(Mood).where(Mood.slug == slug))
    if mood is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown mood: {slug}")
    return mood
