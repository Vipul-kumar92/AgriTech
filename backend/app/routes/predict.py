"""
Prediction REST Endpoints & Historical Records
AI-Based Crop Yield Prediction System
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Query, status
from backend.app.schemas.prediction import PredictionInput, PredictionResponse, PredictionHistoryItem
from backend.app.services.prediction_service import PredictionEngine
from backend.app.services.simulation_service import calculate_farm_economics
from backend.app.auth.jwt_handler import get_current_user, get_optional_user
from backend.app.database import get_database

router = APIRouter(tags=["Prediction"])

@router.post("/predict", response_model=PredictionResponse)
async def predict_crop_yield(
    payload: PredictionInput,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Execute real ML inference pipeline for crop yield prediction.
    Accepts crop agronomic inputs, transforms features, executes the champion model,
    calculates prediction intervals and feature influence, and records to MongoDB.
    """
    engine = PredictionEngine.get_instance()
    response = await engine.predict(payload, current_user)
    return response

@router.get("/predictions", response_model=Dict[str, Any])
async def get_predictions_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    state: Optional[str] = Query(None, description="Filter by state name"),
    season: Optional[str] = Query(None, description="Filter by season"),
    search: Optional[str] = Query(None, description="General search term"),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve paginated prediction history for current authenticated user."""
    db = get_database()
    
    # Query filter
    query: Dict[str, Any] = {}
    if current_user.get("role") != "ADMIN":
        query["user_id"] = current_user["id"]
    
    if crop:
        query["input_features.crop"] = {"$regex": crop, "$options": "i"}
    if state:
        query["input_features.state"] = {"$regex": state, "$options": "i"}
    if season:
        query["input_features.season"] = {"$regex": season, "$options": "i"}
    if search:
        query["$or"] = [
            {"input_features.crop": {"$regex": search, "$options": "i"}},
            {"input_features.state": {"$regex": search, "$options": "i"}},
            {"input_features.season": {"$regex": search, "$options": "i"}}
        ]

    total = await db.predictions.count_documents(query)
    skip = (page - 1) * limit

    cursor = db.predictions.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = []
    async for doc in cursor:
        feats = doc.get("input_features", {})
        crop_name = feats.get("crop", "Unknown")
        area_ha = float(feats.get("area_hectares", 0.0) or 0.0)
        pred_yield = float(doc.get("predicted_yield", 0.0) or 0.0)
        fert_kg = float(feats.get("fertilizer_kg", 0.0) or 0.0)
        pest_kg = float(feats.get("pesticide_kg", 0.0) or 0.0)
        rainfall_mm = float(feats.get("annual_rainfall_mm", 0.0) or 0.0)
        econ = calculate_farm_economics(crop_name, max(area_ha, 0.01), pred_yield, fert_kg, pest_kg) if area_ha > 0 else {}

        items.append({
            "id": str(doc["_id"]),
            "crop": crop_name,
            "state": feats.get("state", "Unknown"),
            "season": feats.get("season", "Unknown"),
            "area": area_ha,
            "annual_rainfall_mm": rainfall_mm,
            "fertilizer_kg": fert_kg,
            "pesticide_kg": pest_kg,
            "predicted_yield": pred_yield,
            "unit": doc.get("unit", "tonnes/hectare"),
            "predicted_total_production": doc.get("predicted_total_production", 0.0),
            "msp_rate_per_quintal_inr": econ.get("msp_rate_per_quintal_inr", 0.0),
            "gross_revenue_inr": econ.get("gross_revenue_inr", 0.0),
            "estimated_net_return_inr": econ.get("estimated_net_return_inr", 0.0),
            "estimated_net_return_lakhs": econ.get("estimated_net_return_lakhs", 0.0),
            "profit_margin_percent": econ.get("profit_margin_percent", 0.0),
            "model_version": doc.get("model_version", "v1.0"),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else ""
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.get("/predictions/{prediction_id}", response_model=Dict[str, Any])
async def get_prediction_detail(
    prediction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Retrieve full details, input summary, and feature influence for a specific prediction."""
    db = get_database()
    try:
        oid = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid prediction ID format")

    doc = await db.predictions.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found")

    # Verify authorization (user must own the record unless admin)
    if current_user.get("role") != "ADMIN" and doc.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this record")

    doc["id"] = str(doc["_id"])
    del doc["_id"]
    if "created_at" in doc and hasattr(doc["created_at"], "isoformat"):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc


@router.delete("/predictions/{prediction_id}", response_model=Dict[str, Any])
async def delete_prediction_record(
    prediction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a prediction record owned by the authenticated user (or any record for ADMIN)."""
    db = get_database()
    try:
        oid = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid prediction ID format")

    doc = await db.predictions.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found")

    if current_user.get("role") != "ADMIN" and doc.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this record")

    await db.predictions.delete_one({"_id": oid})
    await db.system_logs.insert_one({
        "action": "MODEL_PREDICTION_DELETED",
        "user": current_user.get("email", "unknown"),
        "prediction_id": prediction_id,
        "timestamp": datetime.now(timezone.utc)
    })

    return {
        "deleted": True,
        "id": prediction_id,
        "message": "Prediction record deleted successfully."
    }
