"""
MongoDB Asynchronous Client & Lifecycle Management (Motor)
AI-Based Crop Yield Prediction System
"""

import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.app.config import settings
from backend.app.auth.security import hash_password

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = MongoDB()

async def connect_to_mongo():
    """Establish async connection to MongoDB and ensure essential indexes and seed users."""
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    
    # Initialize Collections & Indexes
    await db_instance.db.users.create_index("email", unique=True)
    await db_instance.db.predictions.create_index("created_at")
    await db_instance.db.predictions.create_index("user_id")
    await db_instance.db.predictions.create_index("input_features.crop")
    await db_instance.db.models.create_index("version", unique=True)
    await db_instance.db.feedback.create_index("created_at")
    await db_instance.db.system_logs.create_index("timestamp")
    
    # Seed default demonstration users if not present
    admin_user = await db_instance.db.users.find_one({"email": "admin@agritech.com"})
    if not admin_user:
        await db_instance.db.users.insert_one({
            "name": "System Administrator",
            "email": "admin@agritech.com",
            "password_hash": hash_password("Admin@12345"),
            "role": "ADMIN",
            "created_at": datetime.now(timezone.utc)
        })
        logger.info("Default administrator account seeded (admin@agritech.com / Admin@12345)")

    farmer_user = await db_instance.db.users.find_one({"email": "farmer@agritech.com"})
    if not farmer_user:
        await db_instance.db.users.insert_one({
            "name": "Vipul Farmer",
            "email": "farmer@agritech.com",
            "password_hash": hash_password("Farmer@12345"),
            "role": "USER",
            "created_at": datetime.now(timezone.utc)
        })
        logger.info("Default demonstration farmer account seeded (farmer@agritech.com / Farmer@12345)")

    logger.info("MongoDB successfully initialized and indexed!")

async def close_mongo_connection():
    """Gracefully terminate MongoDB client."""
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    """Retrieve active Motor database instance."""
    return db_instance.db
