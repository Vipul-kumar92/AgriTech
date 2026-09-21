"""
Machine Learning Pipeline Unit Tests
AI-Based Crop Yield Prediction System
"""

import os
import joblib
import json
import numpy as np
import pandas as pd
import pytest

MODEL_PATH = os.path.join("ml", "models", "crop_yield_model_v1.0.joblib")
METADATA_PATH = os.path.join("ml", "models", "metadata.json")
CLEANED_DATA_PATH = os.path.join("ml", "data", "processed", "cleaned_crop_yield.csv")

def test_model_artifact_exists():
    """Verify serialized model pipeline artifact exists and is non-empty."""
    assert os.path.exists(MODEL_PATH), f"Model artifact missing at {MODEL_PATH}"
    assert os.path.getsize(MODEL_PATH) > 1000, "Model artifact file is suspiciously small"

def test_metadata_integrity():
    """Verify metadata.json contains all required schema keys, valid ranges, and real metrics."""
    assert os.path.exists(METADATA_PATH), f"Metadata missing at {METADATA_PATH}"
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta["target_variable"] == "Yield"
    assert meta["target_unit"] == "tonnes/hectare"
    assert meta["metrics"]["r2"] > 0.70, "R2 metric should exceed 0.70"
    assert meta["metrics"]["mae"] < 2.0, "MAE should be reasonable"
    assert len(meta["unique_categories"]["crops"]) == 54

def test_processed_dataset_integrity():
    """Verify processed dataset has zero nulls, non-negative targets, and expected columns."""
    assert os.path.exists(CLEANED_DATA_PATH)
    df = pd.read_csv(CLEANED_DATA_PATH)
    assert df.isnull().sum().sum() == 0, "Processed dataset contains NaN values"
    assert (df['Yield'] > 0).all(), "All yield records must be strictly positive"
    assert (df['Area'] > 0).all(), "All area records must be strictly positive"
    assert 'Coconut' not in df['Crop'].values, "Coconut should be filtered for tonnes/ha unit consistency"

def test_pipeline_prediction_inference():
    """Test model prediction pipeline on multiple distinct crops across different states."""
    pipeline = joblib.load(MODEL_PATH)
    
    test_cases = [
        {"Crop": "Wheat", "Season": "Rabi", "State": "Punjab", "Area": 50.0, "Annual_Rainfall": 650.0, "Fertilizer_per_Ha": 140.0, "Pesticide_per_Ha": 2.5, "Crop_Year": 2024},
        {"Crop": "Rice", "Season": "Kharif", "State": "West Bengal", "Area": 80.0, "Annual_Rainfall": 1600.0, "Fertilizer_per_Ha": 110.0, "Pesticide_per_Ha": 3.0, "Crop_Year": 2024},
        {"Crop": "Sugarcane", "Season": "Whole Year", "State": "Maharashtra", "Area": 25.0, "Annual_Rainfall": 950.0, "Fertilizer_per_Ha": 220.0, "Pesticide_per_Ha": 5.0, "Crop_Year": 2024},
        {"Crop": "Potato", "Season": "Rabi", "State": "Uttar Pradesh", "Area": 15.0, "Annual_Rainfall": 750.0, "Fertilizer_per_Ha": 180.0, "Pesticide_per_Ha": 4.0, "Crop_Year": 2024}
    ]
    df_test = pd.DataFrame(test_cases)
    preds = pipeline.predict(df_test)
    assert len(preds) == 4
    for p in preds:
        assert p > 0, f"Yield prediction must be positive, got {p}"
    
    # Sugarcane and Potato should naturally have higher biomass yield (tonnes/ha) than Wheat/Rice
    assert preds[2] > preds[0], "Sugarcane tonnage should exceed grain wheat tonnage"
