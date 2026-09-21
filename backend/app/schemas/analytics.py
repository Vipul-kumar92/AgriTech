"""
Analytics & System Schemas
AI-Based Crop Yield Prediction System
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AnalyticsOverview(BaseModel):
    total_predictions: int
    average_predicted_yield: float
    top_predicted_crop: str
    active_model: str
    model_r2: float
    dataset_records: int
    dataset_crops_count: int
    dataset_states_count: int

class CropYieldStat(BaseModel):
    crop: str
    average_yield: float
    record_count: int

class SeasonalStat(BaseModel):
    season: str
    average_yield: float

class StateStat(BaseModel):
    state: str
    average_yield: float

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
