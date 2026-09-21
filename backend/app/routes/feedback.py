"""
User Feedback & Rating Endpoints
AI-Based Crop Yield Prediction System
"""

from datetime import datetime, timezone
from typing import Dict, Any
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.schemas.system import FeedbackCreate
from backend.app.auth.jwt_handler import get_optional_user
from backend.app.database import get_database

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    feedback_in: FeedbackCreate,
    current_user: dict = Depends(get_optional_user)
):
    """Submit rating and qualitative comments on an agricultural prediction."""
    db = get_database()
    
    # Verify prediction ID validity
    try:
        oid = ObjectId(feedback_in.prediction_id)
        pred_exists = await db.predictions.find_one({"_id": oid})
        if not pred_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated prediction does not exist")
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid prediction ID format")

    feedback_doc = {
        "prediction_id": feedback_in.prediction_id,
        "user_id": current_user["id"] if current_user else "anonymous",
        "user_email": current_user["email"] if current_user else "anonymous@agritech.com",
        "rating": feedback_in.rating,
        "comment": feedback_in.comment.strip() if feedback_in.comment else "",
        "created_at": datetime.now(timezone.utc)
    }

    result = await db.feedback.insert_one(feedback_doc)
    return {
        "feedback_id": str(result.inserted_id),
        "message": "Thank you! Your feedback has been recorded successfully.",
        "rating": feedback_in.rating
    }
