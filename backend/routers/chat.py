"""
LUCY Backend — Chat Router (MongoDB)
JARVIS-class AI interaction endpoint with emotion detection and command parsing.
"""
from fastapi import APIRouter
from models.schemas import ChatRequest, ChatResponse
from services.prompt_builder import build_prompt
from services.ollama_service import generate_response
from services.memory_service import store_memory
from services.emotion_service import detect_emotion
from services.command_service import parse_command

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Process a chat message through the JARVIS-class AI pipeline."""
    # Detect emotion from user input
    emotion = detect_emotion(req.message)

    # Check for system commands
    command = parse_command(req.message)

    # Build the structured prompt with all context
    prompt = build_prompt(
        message=req.message,
        personality=req.personality,
        memory=req.memory,
        mode=req.mode,
        vision_status=req.vision_status,
        session_duration=req.session_duration,
        emotion=emotion,
        user_name=req.user_name,
    )

    # Generate response via Ollama
    response_text = await generate_response(prompt)

    # Store conversation in memory
    try:
        await store_memory(
            user_id="default",
            category="conversation",
            content=f"User: {req.message} | Lucy: {response_text[:200]}",
            metadata={
                "mode": req.mode,
                "vision": req.vision_status,
                "emotion": emotion,
                "command": command.get("command") if command else None,
            },
        )
    except Exception:
        pass

    return ChatResponse(
        response=response_text,
        mode=req.mode or "companion",
        emotion=emotion,
        command=command,
    )
