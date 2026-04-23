"""
LUCY Backend — Memory Router (MongoDB)
Store and retrieve user memories.
"""
from fastapi import APIRouter, Query
from models.schemas import MemoryInput
from services.memory_service import store_memory, get_recent_memories

router = APIRouter()


@router.post("/memory")
async def save_memory(data: MemoryInput):
    """Store a new memory entry."""
    doc = await store_memory(
        user_id=data.user_id,
        category=data.category,
        content=data.content,
        metadata=data.metadata_json,
    )
    return {"status": "ok", "id": doc.get("_id")}


@router.get("/memory")
async def get_memories(
    user_id: str = Query("default"),
    category: str = Query(None),
    limit: int = Query(10),
):
    """Retrieve recent memories."""
    memories = await get_recent_memories(user_id, limit=limit, category=category)
    return memories
