"""
Application Configuration & Settings
AI-Based Crop Yield Prediction System
"""

import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AI-Based Crop Yield Prediction System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").lower()
    
    # MongoDB Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "agritech_db")
    MONGO_SERVER_SELECTION_TIMEOUT_MS: int = int(os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "3000"))
    
    # Security & JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_agritech_jwt_key_9876543210_btech_capstone")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # OAuth & CORS Security
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    ALLOW_DEV_OAUTH_BYPASS: bool = os.getenv(
        "ALLOW_DEV_OAUTH_BYPASS",
        "false" if os.getenv("ENVIRONMENT", "development").lower() == "production" else "true"
    ).lower() == "true"
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        if origin.strip()
    ]
    
    # Model Artifact Paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    METADATA_PATH: str = os.path.join(BASE_DIR, "ml", "models", "metadata.json")
    MODEL_PATH: str = os.path.join(BASE_DIR, "ml", "models", "crop_yield_model_v1.0.joblib")
    PROCESSED_DATA_PATH: str = os.path.join(BASE_DIR, "ml", "data", "processed", "cleaned_crop_yield.csv")
    COMPARISON_CSV_PATH: str = os.path.join(BASE_DIR, "ml", "models", "model_comparison.csv")

settings = Settings()
