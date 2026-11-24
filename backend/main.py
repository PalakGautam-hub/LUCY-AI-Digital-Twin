"""
LUCY — AI Digital Twin Backend v2.0
JARVIS-class FastAPI server with MongoDB, Ollama AI, emotion detection,
command system, and full API suite.
"""
import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from database import connect_db, close_db
from routers import chat, memory, personality, session
from routers import status as status_router
from services.ollama_service import check_ollama_health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Initializing LUCY v2.0 — JARVIS-class AI backend...")
    await connect_db()
    logger.info("MongoDB connected")

    healthy = await check_ollama_health()
    if healthy:
        logger.info("Ollama LLM is reachable")
    else:
        logger.warning("Ollama is not reachable — run: ollama serve")

    logger.info("LUCY backend online. All systems operational.")

    yield

    await close_db()
    logger.info("LUCY backend shut down")


app = FastAPI(
    title="LUCY — AI Digital Twin",
    description="JARVIS-class AI backend with emotion detection, command parsing, and adaptive personality",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(chat.router, tags=["Chat"])
app.include_router(memory.router, tags=["Memory"])
app.include_router(personality.router, tags=["Personality"])
app.include_router(session.router, tags=["Session"])
app.include_router(status_router.router, tags=["Status"])


@app.get("/")
async def root():
    return {
        "name": "LUCY",
        "version": "2.0.0-jarvis",
        "status": "online",
        "class": "JARVIS-class AI Digital Twin",
        "database": "MongoDB",
        "features": [
            "emotion-detection",
            "command-parsing",
            "adaptive-personality",
            "vision-intelligence",
            "memory-system",
            "multi-mode-operation",
        ],
        "endpoints": ["/chat", "/memory", "/personality", "/session", "/status"],
    }


@app.get("/health")
async def health():
    ollama_ok = await check_ollama_health()
    return {
        "status": "healthy",
        "ollama": "connected" if ollama_ok else "disconnected",
        "database": "MongoDB",
    }
