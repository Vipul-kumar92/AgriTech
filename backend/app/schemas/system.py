"""
System Schemas
AI-Based Crop Yield Prediction System
"""

from typing import Optional
from pydantic import BaseModel, Field

class FeedbackCreate(BaseModel):
    prediction_id: str
    rating: int = Field(..., ge=1, le=5, description="Farmer satisfaction rating (1-5 stars)")
    comment: Optional[str] = Field(None, max_length=500, description="Optional qualitative remarks")

class HealthResponse(BaseModel):
    status: str
    uptime_seconds: float
    model_loaded: bool
    active_model_version: str
    database_connected: bool
