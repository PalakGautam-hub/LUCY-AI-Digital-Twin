"""
LUCY Backend — Ollama Service
Handles communication with the local Ollama LLM instance.
"""
import os
import httpx
import logging

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# Simple in-memory cache for recent responses
_cache: dict[str, str] = {}
_CACHE_MAX = 50


async def generate_response(prompt: str) -> str:
    """Send prompt to Ollama and return the generated response."""
    # Check cache
    cache_key = prompt[:200]
    if cache_key in _cache:
        return _cache[cache_key]

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_predict": 256,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()
            result = data.get("response", "").strip()

            # Cache result
            if len(_cache) >= _CACHE_MAX:
                oldest_key = next(iter(_cache))
                del _cache[oldest_key]
            _cache[cache_key] = result

            return result

    except httpx.TimeoutException:
        logger.error("Ollama request timed out")
        return "I need a moment to think... could you try again?"
    except httpx.ConnectError:
        logger.error("Cannot connect to Ollama — is it running?")
        return ("I can't reach my brain right now. "
                "Make sure Ollama is running locally with: ollama serve")
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        return "Something went wrong on my end. Let me try again."


async def check_ollama_health() -> bool:
    """Check if Ollama is reachable."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return resp.status_code == 200
    except Exception:
        return False
