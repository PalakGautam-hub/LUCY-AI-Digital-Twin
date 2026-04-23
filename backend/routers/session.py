"""
LUCY Backend — Session Router (MongoDB)
Track user activity sessions.
"""
from fastapi import APIRouter, Query
from datetime import datetime, timezone
from models.schemas import SessionInput
from database import get_db

router = APIRouter()


@router.post("/session")
async def save_session(data: SessionInput):
    """Save a session record."""
    db = get_db()
    doc = {
        "user_id": data.user_id,
        "mode": data.mode,
        "duration_seconds": data.duration_seconds,
        "vision_summary": data.vision_summary,
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.sessions.insert_one(doc)
    return {"status": "ok", "id": str(result.inserted_id)}


@router.get("/session")
async def get_sessions(
    user_id: str = Query("default"),
    limit: int = Query(10),
):
    """Retrieve recent sessions."""
    db = get_db()
    cursor = (
        db.sessions.find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )
    sessions = []
    async for s in cursor:
        sessions.append({
            "id": str(s["_id"]),
            "mode": s.get("mode"),
            "duration_seconds": s.get("duration_seconds", 0),
            "notes": s.get("notes"),
            "created_at": str(s.get("created_at")),
        })
    return sessions
