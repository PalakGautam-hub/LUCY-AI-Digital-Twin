"""
LUCY Backend — Pydantic schemas
Enhanced for JARVIS-class AI with emotion detection and command system.
"""
from pydantic import BaseModel
from typing import Optional, Any


class ChatRequest(BaseModel):
    message: str
    personality: Optional[dict] = None
    memory: Optional[list] = None
    mode: Optional[str] = "companion"
    vision_status: Optional[str] = "absent"
    session_duration: Optional[int] = 0
    user_name: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    mode: str
    emotion: Optional[str] = None
    command: Optional[dict] = None


class MemoryInput(BaseModel):
    user_id: str = "default"
    category: str = "conversation"
    content: str
    metadata_json: Optional[dict] = None


class MemoryOutput(BaseModel):
    id: str
    category: str
    content: str
    metadata_json: Optional[Any] = None
    created_at: str


class PersonalityInput(BaseModel):
    user_id: str = "default"
    tone: str = "friendly"
    behavior: str = "balanced"
    answers: Optional[dict] = None
    derived_at: Optional[str] = None
    user_name: Optional[str] = None
    avatar_config: Optional[dict] = None


class PersonalityOutput(BaseModel):
    tone: str
    behavior: str
    answers: Optional[dict] = None
    user_name: Optional[str] = None
    avatar_config: Optional[dict] = None


class SessionInput(BaseModel):
    user_id: str = "default"
    mode: str = "companion"
    duration_seconds: int = 0
    vision_summary: Optional[dict] = None
    notes: Optional[str] = None


class SessionOutput(BaseModel):
    id: str
    mode: str
    duration_seconds: int
    notes: Optional[str] = None
    created_at: str


class StatusResponse(BaseModel):
    system: str
    ollama: str
    uptime: str
    mode: str
    session_minutes: int
    memory_entries: int
