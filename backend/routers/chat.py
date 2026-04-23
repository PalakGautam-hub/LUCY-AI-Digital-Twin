"""
LUCY Backend — Chat Router (MongoDB)
Handles the main AI interaction endpoint.
"""
from fastapi import APIRouter
from models.schemas import ChatRequest, ChatResponse
from services.prompt_builder import build_prompt
from services.ollama_service import generate_response
from services.memory_service import store_memory

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Process a chat message through the AI pipeline."""
    # Build the structured prompt
    prompt = build_prompt(
        message=req.message,
        personality=req.personality,
        memory=req.memory,
        mode=req.mode,
        vision_status=req.vision_status,
        session_duration=req.session_duration,
    )

    # Generate response via Ollama
    response_text = await generate_response(prompt)

    # Store conversation in memory
    try:
        await store_memory(
            user_id="default",
            category="conversation",
            content=f"User: {req.message} | Lucy: {response_text[:200]}",
            metadata={"mode": req.mode, "vision": req.vision_status},
        )
    except Exception:
        pass  # Don't fail the chat if memory storage fails

    return ChatResponse(
        response=response_text,
        mode=req.mode or "companion",
    )
