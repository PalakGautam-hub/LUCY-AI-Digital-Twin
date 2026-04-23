"""
LUCY Backend — Memory Service (MongoDB)
Handles storing and retrieving relevant memories for context injection.
"""
from datetime import datetime, timezone
from database import get_db


async def store_memory(user_id: str, category: str, content: str, metadata: dict = None):
    """Store a new memory entry."""
    db = get_db()
    doc = {
        "user_id": user_id,
        "category": category,
        "content": content,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.memories.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


async def get_recent_memories(user_id: str, limit: int = 10, category: str = None):
    """Retrieve recent memories for a user, optionally filtered by category."""
    db = get_db()
    query = {"user_id": user_id}
    if category:
        query["category"] = category

    cursor = db.memories.find(query).sort("created_at", -1).limit(limit)
    memories = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["created_at"] = str(doc["created_at"])
        memories.append(doc)
    return memories


async def search_memories(user_id: str, keyword: str, limit: int = 5):
    """Simple keyword search across memory content."""
    db = get_db()
    cursor = (
        db.memories.find({
            "user_id": user_id,
            "content": {"$regex": keyword, "$options": "i"},
        })
        .sort("created_at", -1)
        .limit(limit)
    )
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["created_at"] = str(doc["created_at"])
        results.append(doc)
    return results


async def get_memory_summary(user_id: str) -> str:
    """Get a summarized view of recent memories for prompt injection."""
    memories = await get_recent_memories(user_id, limit=5)
    if not memories:
        return ""
    lines = []
    for m in reversed(memories):
        lines.append(f"[{m.get('category', 'general')}] {m.get('content', '')}")
    return "\n".join(lines)
