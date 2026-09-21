"""
Prediction REST Endpoints & Historical Records
AI-Based Crop Yield Prediction System
"""

from typing import Optional, List, Dict, Any
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Query, status
from backend.app.schemas.prediction import PredictionInput, PredictionResponse, PredictionHistoryItem
from backend.app.services.prediction_service import PredictionEngine
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
        items.append({
            "id": str(doc["_id"]),
            "crop": doc.get("input_features", {}).get("crop", "Unknown"),
            "state": doc.get("input_features", {}).get("state", "Unknown"),
            "season": doc.get("input_features", {}).get("season", "Unknown"),
            "area": doc.get("input_features", {}).get("area_hectares", 0.0),
            "predicted_yield": doc.get("predicted_yield", 0.0),
            "unit": doc.get("unit", "tonnes/hectare"),
            "predicted_total_production": doc.get("predicted_total_production", 0.0),
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
