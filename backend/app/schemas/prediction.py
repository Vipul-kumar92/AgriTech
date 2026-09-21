"""
Prediction Request & Response Schemas
AI-Based Crop Yield Prediction System
"""

from typing import Dict, Optional, Any
from pydantic import BaseModel, Field

class PredictionInput(BaseModel):
    crop: str = Field(..., min_length=2, description="Target crop (e.g., Rice, Wheat, Sugarcane)")
    season: str = Field(..., min_length=3, description="Cultivation season (e.g., Kharif, Rabi)")
    state: str = Field(..., min_length=2, description="Indian state or union territory")
    area: float = Field(..., gt=0.0, description="Cultivated land area in hectares (> 0)")
    annual_rainfall: float = Field(..., ge=0.0, description="Annual cumulative rainfall in mm (>= 0)")
    fertilizer: float = Field(..., ge=0.0, description="Total chemical fertilizer applied in kg (>= 0)")
    pesticide: float = Field(..., ge=0.0, description="Total plant protection pesticide applied in kg (>= 0)")
    crop_year: Optional[int] = Field(default=2024, ge=1990, le=2035, description="Cultivation calendar year")

class PredictionResponse(BaseModel):
    prediction_id: str
    predicted_yield: float
    unit: str = "tonnes/hectare"
    predicted_total_production: float
    production_unit: str = "metric tonnes"
    prediction_interval: Dict[str, float]
    model_version: str
    model_name: str
    created_at: str
    input_summary: Dict[str, Any]
    feature_influence: Dict[str, float]

class PredictionHistoryItem(BaseModel):
    id: str
    crop: str
    state: str
    season: str
    area: float
    predicted_yield: float
    unit: str
    predicted_total_production: float
    model_version: str
    created_at: str
