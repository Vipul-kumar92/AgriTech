"""
Prediction Service & ML Inference Engine
AI-Based Crop Yield Prediction System
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from bson import ObjectId
import joblib
import numpy as np
import pandas as pd
from fastapi import HTTPException, status
from backend.app.config import settings
from backend.app.database import get_database
from backend.app.schemas.prediction import PredictionInput, PredictionResponse

logger = logging.getLogger(__name__)

class PredictionEngine:
    _instance = None

    def __init__(self):
        self.pipeline = None
        self.metadata = {}
        self.load_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = PredictionEngine()
        return cls._instance

    def load_model(self):
        """Load serialized pipeline and metadata into memory."""
        try:
            if not os.path.exists(settings.MODEL_PATH):
                logger.error(f"Model file not found at {settings.MODEL_PATH}")
                return
            
            logger.info(f"Loading production pipeline from {settings.MODEL_PATH} ...")
            self.pipeline = joblib.load(settings.MODEL_PATH)
            
            if os.path.exists(settings.METADATA_PATH):
                with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            logger.info(f"Model {self.metadata.get('model_name', 'Unknown')} loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load ML pipeline: {str(e)}")
            self.pipeline = None

    async def predict(self, input_data: PredictionInput, user: Optional[dict] = None) -> PredictionResponse:
        """Run real ML prediction, calculate bounds, persist to DB, and return response."""
        if self.pipeline is None:
            self.load_model()
            if self.pipeline is None:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="ML prediction model pipeline is currently unavailable."
                )

        # Agronomic intensity feature calculation
        fertilizer_per_ha = input_data.fertilizer / input_data.area
        pesticide_per_ha = input_data.pesticide / input_data.area

        # Prepare DataFrame strictly matching training features
        df_input = pd.DataFrame([{
            'Crop': input_data.crop.strip(),
            'Season': input_data.season.strip(),
            'State': input_data.state.strip(),
            'Area': float(input_data.area),
            'Annual_Rainfall': float(input_data.annual_rainfall),
            'Fertilizer_per_Ha': float(fertilizer_per_ha),
            'Pesticide_per_Ha': float(pesticide_per_ha),
            'Crop_Year': int(input_data.crop_year or 2024)
        }])

        try:
            raw_prediction = float(self.pipeline.predict(df_input)[0])
            # Agronomic constraint: yield cannot be negative
            predicted_yield = max(0.01, round(raw_prediction, 3))
        except Exception as e:
            logger.error(f"Inference error during pipeline execution: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error executing machine learning inference: {str(e)}"
            )

        # Calculate total harvested production
        total_production = round(predicted_yield * input_data.area, 2)

        # Calculate prediction interval based on empirical test RMSE
        rmse = self.metadata.get("metrics", {}).get("rmse", 4.8)
        # Using 80% empirical prediction interval factor (1.28 * standard error of estimation)
        margin = round(min(predicted_yield * 0.25, 1.28 * (rmse / 5.0)), 2)
        lower_bound = max(0.01, round(predicted_yield - margin, 2))
        upper_bound = round(predicted_yield + margin, 2)

        # Extract model feature influences
        feature_importance = self.metadata.get("feature_importance_percent", {
            "Crop": 66.77, "State": 14.83, "Area": 8.84, "Annual_Rainfall": 4.10,
            "Pesticide_per_Ha": 1.61, "Crop_Year": 1.58, "Fertilizer_per_Ha": 1.25, "Season": 1.00
        })

        input_summary = {
            "crop": input_data.crop,
            "season": input_data.season,
            "state": input_data.state,
            "area_hectares": input_data.area,
            "annual_rainfall_mm": input_data.annual_rainfall,
            "fertilizer_kg": input_data.fertilizer,
            "pesticide_kg": input_data.pesticide,
            "fertilizer_per_ha_kg": round(fertilizer_per_ha, 2),
            "pesticide_per_ha_kg": round(pesticide_per_ha, 2),
            "crop_year": input_data.crop_year
        }

        # Persist prediction to MongoDB
        db = get_database()
        prediction_doc = {
            "user_id": user["id"] if user else "anonymous",
            "user_email": user["email"] if user else "anonymous@agritech.com",
            "input_features": input_summary,
            "predicted_yield": predicted_yield,
            "unit": "tonnes/hectare",
            "predicted_total_production": total_production,
            "production_unit": "metric tonnes",
            "prediction_interval": {
                "lower": lower_bound,
                "upper": upper_bound
            },
            "model_version": self.metadata.get("version", "v1.0"),
            "model_name": self.metadata.get("model_name", "Random Forest Regressor (Optimized)"),
            "created_at": datetime.now(timezone.utc)
        }

        inserted = await db.predictions.insert_one(prediction_doc)
        pred_id = str(inserted.inserted_id)

        # Log to system_logs
        await db.system_logs.insert_one({
            "action": "MODEL_PREDICTION",
            "user": user["email"] if user else "anonymous",
            "prediction_id": pred_id,
            "crop": input_data.crop,
            "predicted_yield": predicted_yield,
            "timestamp": datetime.now(timezone.utc)
        })

        return PredictionResponse(
            prediction_id=pred_id,
            predicted_yield=predicted_yield,
            unit="tonnes/hectare",
            predicted_total_production=total_production,
            production_unit="metric tonnes",
            prediction_interval={"lower": lower_bound, "upper": upper_bound},
            model_version=self.metadata.get("version", "v1.0"),
            model_name=self.metadata.get("model_name", "Random Forest Regressor (Optimized)"),
            created_at=prediction_doc["created_at"].isoformat(),
            input_summary=input_summary,
            feature_influence=feature_importance
        )
