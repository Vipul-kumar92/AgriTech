"""
FastAPI Backend Integration & Unit Tests
AI-Based Crop Yield Prediction System
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify health check endpoint returns 200 and indicates model and DB operational."""
    with TestClient(app) as tc:
        response = tc.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "HEALTHY"
        assert data["database_connected"] is True
        assert data["model_loaded"] is True
        assert "Random Forest" in data["active_model_name"]

def test_admin_and_farmer_login():
    """Verify seeded accounts can authenticate and receive valid JWT tokens."""
    with TestClient(app) as tc:
        # Admin login
        admin_res = tc.post("/api/auth/login", json={
            "email": "admin@agritech.com",
            "password": "Admin@12345"
        })
        assert admin_res.status_code == 200
        admin_data = admin_res.json()
        assert "access_token" in admin_data
        assert admin_data["user"]["role"] == "ADMIN"

        # Farmer login
        farmer_res = tc.post("/api/auth/login", json={
            "email": "farmer@agritech.com",
            "password": "Farmer@12345"
        })
        assert farmer_res.status_code == 200
        farmer_data = farmer_res.json()
        assert "access_token" in farmer_data
        assert farmer_data["user"]["role"] == "USER"

def test_user_registration():
    """Verify registration of a new user account with unique email."""
    import time
    unique_email = f"test_farmer_{int(time.time())}@agritech.com"
    with TestClient(app) as tc:
        reg_res = tc.post("/api/auth/register", json={
            "name": "Arjun Patel",
            "email": unique_email,
            "password": "Password@123"
        })
        assert reg_res.status_code == 201
        data = reg_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email

def test_prediction_inference_valid():
    """Verify valid agricultural input produces positive yield prediction in tonnes/hectare."""
    with TestClient(app) as tc:
        payload = {
            "crop": "Rice",
            "season": "Kharif",
            "state": "Punjab",
            "area": 120.0,
            "annual_rainfall": 1150.0,
            "fertilizer": 18000.0,
            "pesticide": 420.0,
            "crop_year": 2024
        }
        res = tc.post("/api/predict", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "prediction_id" in data
        assert data["predicted_yield"] > 0
        assert data["unit"] == "tonnes/hectare"
        assert data["predicted_total_production"] > 0
        assert "lower" in data["prediction_interval"]
        assert "upper" in data["prediction_interval"]
        assert "Crop" in data["feature_influence"]

def test_prediction_input_validation_failure():
    """Verify input validation fails for unfeasible agronomic inputs (negative area, negative rainfall)."""
    with TestClient(app) as tc:
        # Negative area
        res1 = tc.post("/api/predict", json={
            "crop": "Wheat",
            "season": "Rabi",
            "state": "Haryana",
            "area": -5.0,  # Invalid
            "annual_rainfall": 600.0,
            "fertilizer": 500.0,
            "pesticide": 10.0
        })
        assert res1.status_code == 422

        # Negative rainfall
        res2 = tc.post("/api/predict", json={
            "crop": "Wheat",
            "season": "Rabi",
            "state": "Haryana",
            "area": 10.0,
            "annual_rainfall": -100.0,  # Invalid
            "fertilizer": 500.0,
            "pesticide": 10.0
        })
        assert res2.status_code == 422

def test_analytics_and_dataset_stats():
    """Verify analytics and dataset stats endpoints return authentic calculated metrics."""
    with TestClient(app) as tc:
        res = tc.get("/api/analytics")
        assert res.status_code == 200
        data = res.json()
        assert "kpi" in data
        assert data["kpi"]["dataset_records"] == 19407
        assert len(data["crop_distribution"]) > 0

        res_ds = tc.get("/api/dataset/stats")
        assert res_ds.status_code == 200
        ds_data = res_ds.json()
        assert ds_data["total_records"] == 19407
        assert len(ds_data["crops"]) == 54

def test_models_benchmark_and_feature_importance():
    """Verify model comparison endpoints return all 6 evaluated regression models."""
    with TestClient(app) as tc:
        res = tc.get("/api/models")
        assert res.status_code == 200
        data = res.json()
        assert len(data["models_benchmark"]) == 6
        model_names = [m["model"] for m in data["models_benchmark"]]
        assert "Linear Regression" in model_names
        assert "Random Forest Regressor" in model_names
        assert "XGBoost Regressor" in model_names

        res_feat = tc.get("/api/feature-importance")
        assert res_feat.status_code == 200
        feat_data = res_feat.json()
        assert len(feat_data["features"]) > 0
