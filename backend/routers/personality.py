"""
LUCY Backend — Personality Router (MongoDB)
Store and retrieve personality profiles.
"""
from fastapi import APIRouter, Query
from datetime import datetime, timezone
from models.schemas import PersonalityInput
from database import get_db

router = APIRouter()


@router.post("/personality")
async def save_personality(data: PersonalityInput):
    """Save or update personality profile (upsert)."""
    db = get_db()
    doc = {
        "user_id": data.user_id,
        "tone": data.tone,
        "behavior": data.behavior,
        "answers": data.answers,
        "derived_at": data.derived_at,
        "updated_at": datetime.now(timezone.utc),
    }
    await db.personalities.update_one(
        {"user_id": data.user_id},
        {"$set": doc},
        upsert=True,
    )
    return {"status": "ok"}


@router.get("/personality")
async def get_personality(user_id: str = Query("default")):
    """Retrieve personality profile."""
    db = get_db()
    profile = await db.personalities.find_one({"user_id": user_id})

    if not profile:
        return {"tone": "friendly", "behavior": "balanced", "answers": None}

    return {
        "tone": profile.get("tone", "friendly"),
        "behavior": profile.get("behavior", "balanced"),
        "answers": profile.get("answers"),
    }
