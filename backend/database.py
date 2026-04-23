"""
LUCY Backend — MongoDB Database Connection
Uses motor (async MongoDB driver) for non-blocking operations.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "lucy_db")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Initialize MongoDB connection."""
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB]

    # Create indexes for efficient queries
    await db.memories.create_index([("user_id", 1), ("created_at", -1)])
    await db.memories.create_index([("user_id", 1), ("category", 1)])
    await db.personalities.create_index("user_id", unique=True)
    await db.sessions.create_index([("user_id", 1), ("created_at", -1)])
    await db.conversations.create_index([("user_id", 1), ("created_at", -1)])

    return db


async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()


def get_db():
    """Get the database instance."""
    return db
