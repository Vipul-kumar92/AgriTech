"""
AI Crop Doctor REST Endpoints
Pest, Disease & Nutrient Triage linked with 3-day Weather Spray Window
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.app.services.crop_doctor_service import SYMPTOM_CATALOG, diagnose_crop_issue

router = APIRouter(prefix="/crop-doctor", tags=["Crop Doctor"])


class CropDoctorRequest(BaseModel):
    crop: str = Field(default="Rice", min_length=2)
    state: str = Field(default="Punjab", min_length=2)
    season: str = Field(default="Kharif", min_length=3)
    symptoms: List[str] = Field(..., min_length=1, max_length=5)
    severity: str = Field(default="moderate", pattern="^(mild|moderate|severe)$")
    growth_stage: str = Field(default="vegetative", pattern="^(seedling|vegetative|flowering|fruiting_maturity)$")
    area_ha: float = Field(default=1.0, gt=0.0, le=10000.0)
    lat: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    lon: Optional[float] = Field(default=None, ge=-180.0, le=180.0)


@router.get("/catalog", response_model=Dict[str, Any])
async def get_crop_doctor_catalog():
    """Retrieve supported symptoms, categories, and diagnostic reference options."""
    return {
        "symptoms": SYMPTOM_CATALOG,
        "severity_levels": ["mild", "moderate", "severe"],
        "growth_stages": ["seedling", "vegetative", "flowering", "fruiting_maturity"],
    }


@router.post("/diagnose", response_model=Dict[str, Any])
async def diagnose_crop_symptoms(req: CropDoctorRequest):
    """Diagnose crop pest/disease/deficiency and compute area-scaled remedies + 3-day spray window."""
    return diagnose_crop_issue(
        crop=req.crop,
        state=req.state,
        season=req.season,
        symptoms=req.symptoms,
        severity=req.severity,
        growth_stage=req.growth_stage,
        area_ha=req.area_ha,
        lat=req.lat,
        lon=req.lon,
    )
