"""
LUCY — AI Digital Twin Backend
FastAPI server with MongoDB, Ollama AI, and full API suite.
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
from services.ollama_service import check_ollama_health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    logger.info("🧠 Initializing LUCY backend...")
    await connect_db()
    logger.info("✅ MongoDB connected")

    healthy = await check_ollama_health()
    if healthy:
        logger.info("✅ Ollama is reachable")
    else:
        logger.warning("⚠️  Ollama is not reachable — run: ollama serve")

    yield

    # Shutdown
    await close_db()
    logger.info("👋 LUCY backend shut down")


app = FastAPI(
    title="LUCY — AI Digital Twin",
    description="Backend API for the LUCY AI assistant",
    version="1.0.0",
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


@app.get("/")
async def root():
    return {
        "name": "LUCY",
        "status": "online",
        "version": "1.0.0",
        "database": "MongoDB",
        "endpoints": ["/chat", "/memory", "/personality", "/session"],
    }


@app.get("/health")
async def health():
    ollama_ok = await check_ollama_health()
    return {
        "status": "healthy",
        "ollama": "connected" if ollama_ok else "disconnected",
        "database": "MongoDB",
    }
