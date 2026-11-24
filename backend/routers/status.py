"""
LUCY Backend — System Status Router
JARVIS-style system diagnostics and status reporting.
"""
import time
from fastapi import APIRouter
from services.ollama_service import check_ollama_health
from database import get_db

router = APIRouter()

_start_time = time.time()


@router.get("/status")
async def system_status():
    """JARVIS-style system status report."""
    uptime_sec = int(time.time() - _start_time)
    hours = uptime_sec // 3600
    minutes = (uptime_sec % 3600) // 60

    ollama_ok = await check_ollama_health()

    db = get_db()
    memory_count = 0
    if db is not None:
        try:
            memory_count = await db.memories.count_documents({})
        except Exception:
            pass

    return {
        "system": "operational",
        "ollama": "connected" if ollama_ok else "disconnected",
        "uptime": f"{hours}h {minutes}m",
        "memory_entries": memory_count,
        "database": "connected" if db is not None else "disconnected",
        "version": "2.0.0-jarvis",
    }
