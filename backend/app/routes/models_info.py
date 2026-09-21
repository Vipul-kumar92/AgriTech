"""
Model Benchmark & Metadata REST Endpoints
AI-Based Crop Yield Prediction System
"""

import os
import json
from typing import Dict, Any, List
import pandas as pd
from fastapi import APIRouter, HTTPException, status
from backend.app.config import settings

router = APIRouter(prefix="/models", tags=["Model Performance & Versioning"])

@router.get("", response_model=Dict[str, Any])
async def list_model_benchmarks():
    """Retrieve comparative regression benchmarks across all 6 evaluated algorithms."""
    models_list = []
    if os.path.exists(settings.COMPARISON_CSV_PATH):
        df_comp = pd.read_csv(settings.COMPARISON_CSV_PATH)
        for _, row in df_comp.iterrows():
            models_list.append({
                "model": row["Model"],
                "mae": float(row["MAE"]),
                "mse": float(row["MSE"]),
                "rmse": float(row["RMSE"]),
                "r2": float(row["R2"]),
                "mape": float(row["MAPE"]),
                "cv_r2_mean": float(row["CV_R2_Mean"]),
                "cv_r2_std": float(row["CV_R2_Std"]),
                "fit_time_sec": float(row["Fit_Time_Sec"])
            })

    # Active model metadata
    active_meta = {}
    if os.path.exists(settings.METADATA_PATH):
        with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
            active_meta = json.load(f)

    return {
        "active_version": active_meta.get("version", "v1.0"),
        "active_model_name": active_meta.get("model_name", "Random Forest Regressor (Optimized)"),
        "models_benchmark": models_list,
        "active_model_metadata": active_meta
    }

@router.get("/{version}", response_model=Dict[str, Any])
async def get_model_version_detail(version: str):
    """Retrieve deep hyperparameters and training details for a specific model version."""
    if os.path.exists(settings.METADATA_PATH):
        with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
            meta = json.load(f)
            if meta.get("version") == version or version in ["v1", "v1.0", "active"]:
                return meta
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Model version '{version}' not found")
