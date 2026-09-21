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
    
    # MongoDB Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "agritech_db")
    
    # Security & JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_agritech_jwt_key_9876543210_btech_capstone")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Model Artifact Paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    METADATA_PATH: str = os.path.join(BASE_DIR, "ml", "models", "metadata.json")
    MODEL_PATH: str = os.path.join(BASE_DIR, "ml", "models", "crop_yield_model_v1.0.joblib")
    PROCESSED_DATA_PATH: str = os.path.join(BASE_DIR, "ml", "data", "processed", "cleaned_crop_yield.csv")
    COMPARISON_CSV_PATH: str = os.path.join(BASE_DIR, "ml", "models", "model_comparison.csv")

settings = Settings()
