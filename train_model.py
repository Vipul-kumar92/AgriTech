"""
Quick Model Training Script
Trains and serializes the crop yield prediction model from the cleaned dataset.
Usage: python train_model.py
"""

import os
import sys
import time
import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.training.train_and_evaluate import build_preprocessor

DATA_PATH = os.path.join(BASE_DIR, "ml", "data", "processed", "cleaned_crop_yield.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_yield_model_v1.0.joblib")

def train_quick():
    if not os.path.exists(DATA_PATH):
        print(f"Error: Dataset not found at {DATA_PATH}")
        sys.exit(1)

    print("======================================================================")
    print("Training AI Crop Yield Prediction Model (Random Forest Champion)")
    print("======================================================================")
    print(f"Loading dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df):,} records.")

    features = ['Crop', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer_per_Ha', 'Pesticide_per_Ha', 'Crop_Year']
    target = 'Yield'

    X = df[features]
    y = df[target]

    print("Building Scikit-Learn Pipeline with ColumnTransformer & OneHotEncoder...")
    pipeline = Pipeline([
        ('preprocessor', build_preprocessor()),
        ('regressor', RandomForestRegressor(
            n_estimators=100,
            max_depth=20,
            random_state=42,
            n_jobs=-1
        ))
    ])

    print("Fitting model...")
    t0 = time.time()
    pipeline.fit(X, y)
    duration = time.time() - t0
    print(f"Training completed in {duration:.2f} seconds!")

    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"Saving model to {MODEL_PATH}...")
    joblib.dump(pipeline, MODEL_PATH)
    print("Model serialized successfully! Ready for FastAPI inference.")
    print("======================================================================")

if __name__ == "__main__":
    train_quick()
