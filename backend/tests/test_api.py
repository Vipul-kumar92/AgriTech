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
        assert admin_data["user"]["role"] in ["ADMIN", "FARMER"]

        # Farmer login
        farmer_res = tc.post("/api/auth/login", json={
            "email": "farmer@agritech.com",
            "password": "Farmer@12345"
        })
        assert farmer_res.status_code == 200
        farmer_data = farmer_res.json()
        assert "access_token" in farmer_data
        assert farmer_data["user"]["role"] in ["FARMER", "USER"]

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

def test_next_level_services():
    """Verify live weather, MSP economics, What-If simulator, and geographic yield map endpoints."""
    with TestClient(app) as tc:
        # 1. Weather
        res_w = tc.get("/api/weather/live?state=Punjab")
        assert res_w.status_code == 200
        data_w = res_w.json()
        assert data_w["state"] == "Punjab"
        assert "temperature_c" in data_w or "temperature_celsius" in data_w

        # 2. MSP Economics
        res_e = tc.get("/api/economics/msp?crop=Rice&predicted_yield=4.2&area=50&fertilizer_kg=7500&pesticide_kg=175")
        assert res_e.status_code == 200
        data_e = res_e.json()
        assert data_e["crop"] == "Rice"
        assert data_e["gross_revenue_lakhs"] > 0
        assert data_e["total_chemical_cost_inr"] > 0
        assert "pricing_source" in data_e

        # 3. Geospatial Map States
        res_m = tc.get("/api/map/states")
        assert res_m.status_code == 200
        data_m = res_m.json()
        assert len(data_m) == 30
        assert "state" in data_m[0]
        assert "tier" in data_m[0]

        # 4. What-If Simulator
        sim_payload = {
            "crop": "Rice",
            "state": "Punjab",
            "season": "Kharif",
            "area": 50.0,
            "annual_rainfall": 1100.0,
            "fertilizer": 7500.0,
            "pesticide": 175.0,
            "crop_year": 2024
        }
        res_s = tc.post("/api/simulate", json=sim_payload)
        assert res_s.status_code == 200
        data_s = res_s.json()
        assert data_s["base_yield_t_ha"] > 0
        assert "base_economics" in data_s
        assert data_s["base_economics"]["gross_revenue_inr"] > 0
        assert len(data_s["rainfall_sensitivity_curve"]) == 9
        assert "net_farm_return_lakhs" in data_s["rainfall_sensitivity_curve"][0]
        assert len(data_s["fertilizer_sensitivity_curve"]) == 9
        assert "net_farm_return_lakhs" in data_s["fertilizer_sensitivity_curve"][0]

def test_google_authentication_endpoint():
    """Verify Google OAuth endpoint registers/authenticates users with real Gmail format."""
    import time
    unique_gmail = f"real.farmer.{int(time.time())}@gmail.com"
    with TestClient(app) as tc:
        # 1. Direct Real Gmail Registration
        res = tc.post("/api/auth/google", json={
            "email": unique_gmail,
            "name": "Kisan Baldev Singh",
            "role": "FARMER"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_gmail
        assert data["user"]["name"] == "Kisan Baldev Singh"
        assert data["user"]["auth_provider"] == "google"

        # 2. Existing Real Gmail Login
        login_res = tc.post("/api/auth/google", json={
            "email": unique_gmail,
            "name": "Kisan Baldev Singh"
        })
        assert login_res.status_code == 200
        assert login_res.json()["user"]["id"] == data["user"]["id"]

def test_update_user_profile():
    """Verify user can update their profile information via PUT /api/auth/profile."""
    import time
    unique_email = f"profile_test_{int(time.time())}@agritech.com"
    with TestClient(app) as tc:
        # Register user
        reg_res = tc.post("/api/auth/register", json={
            "name": "Original Name",
            "email": unique_email,
            "password": "Password@123"
        })
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Update profile: name, phone, role
        update_res = tc.put("/api/auth/profile", json={
            "name": "Updated Farmer Name",
            "phone": "+91 9876543210",
            "role": "FARMER"
        }, headers=headers)
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["name"] == "Updated Farmer Name"
        assert updated["phone"] == "+91 9876543210"

        # Verify via GET /api/auth/me
        me_res = tc.get("/api/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["name"] == "Updated Farmer Name"
        assert me_res.json()["phone"] == "+91 9876543210"

        # Upload base64 profile picture & clear it
        img_res = tc.put("/api/auth/profile", json={
            "picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }, headers=headers)
        assert img_res.status_code == 200
        assert img_res.json()["picture"].startswith("data:image/png;base64,")

        bad_img_res = tc.put("/api/auth/profile", json={
            "picture": "javascript:alert(1)"
        }, headers=headers)
        assert bad_img_res.status_code == 400

        clear_res = tc.put("/api/auth/profile", json={"picture": None}, headers=headers)
        assert clear_res.status_code == 200
        assert clear_res.json()["picture"] is None


def test_crop_recommender_endpoint():
    """Verify Top-5 profitable crop recommender returns ranked profit & yield winners."""
    with TestClient(app) as tc:
        res = tc.post("/api/recommend-crops", json={
            "state": "Punjab",
            "season": "Kharif",
            "area": 50.0,
            "annual_rainfall": 650.0,
            "fertilizer": 7500.0,
            "pesticide": 175.0,
            "top_n": 5
        })
        assert res.status_code == 200
        data = res.json()
        assert data["state"] == "Punjab"
        assert data["season"] == "Kharif"
        assert data["evaluated_crops_count"] >= 5
        assert len(data["recommendations"]) == 5
        assert data["best_profit_crop"]["estimated_net_return_inr"] >= data["recommendations"][1]["estimated_net_return_inr"]
        assert data["best_yield_crop"]["predicted_yield_t_ha"] >= data["best_profit_crop"]["predicted_yield_t_ha"] or data["is_same_winner"]
        assert any(item["crop"] == data["best_yield_crop"]["crop"] for item in data["comparison_chart"])


def test_weather_7day_and_gps_locate():
    """Verify 7-day weather forecast, spray advisory, and GPS nearest-state resolution."""
    with TestClient(app) as tc:
        loc_res = tc.get("/api/weather/locate?lat=30.9010&lon=75.8573")
        assert loc_res.status_code == 200
        loc = loc_res.json()
        assert loc["state"] == "Punjab"

        w_res = tc.get("/api/weather/live?lat=30.9010&lon=75.8573")
        assert w_res.status_code == 200
        weather = w_res.json()
        assert weather["state"] == "Punjab"
        assert weather["detected_via_gps"] is True
        assert isinstance(weather["forecast_7_days"], list)
        assert len(weather["forecast_7_days"]) == 7
        assert "spray_status" in weather["spray_advisory"]
        assert "advisory_hi" in weather["spray_advisory"]


def test_prediction_history_economics_and_delete():
    """Verify prediction history includes MSP economics and user can delete their own prediction."""
    import time
    unique_email = f"hist_del_{int(time.time())}@agritech.com"
    with TestClient(app) as tc:
        reg_res = tc.post("/api/auth/register", json={
            "name": "History Tester",
            "email": unique_email,
            "password": "Password@123"
        })
        assert reg_res.status_code == 201
        headers = {"Authorization": f"Bearer {reg_res.json()['access_token']}"}

        pred_res = tc.post("/api/predict", json={
            "crop": "Rice",
            "season": "Kharif",
            "state": "Punjab",
            "area": 10.0,
            "annual_rainfall": 650.0,
            "fertilizer": 1500.0,
            "pesticide": 35.0,
            "crop_year": 2024
        }, headers=headers)
        assert pred_res.status_code == 200
        pred_id = pred_res.json()["prediction_id"]

        hist_res = tc.get("/api/predictions", headers=headers)
        assert hist_res.status_code == 200
        items = hist_res.json()["items"]
        assert len(items) == 1
        assert items[0]["id"] == pred_id
        assert items[0]["estimated_net_return_inr"] > 0

        del_res = tc.delete(f"/api/predictions/{pred_id}", headers=headers)
        assert del_res.status_code == 200
        assert del_res.json()["deleted"] is True

        hist_after = tc.get("/api/predictions", headers=headers)
        assert hist_after.status_code == 200
        assert len(hist_after.json()["items"]) == 0


def test_admin_feedback_inbox_and_user_role_toggle():
    """Verify admin feedback inbox listing, user search filter, and role toggle endpoint."""
    import time
    unique_farmer = f"role_toggle_{int(time.time())}@agritech.com"
    with TestClient(app) as tc:
        # 1. Farmer registers and submits feedback on a prediction
        farmer_reg = tc.post("/api/auth/register", json={
            "name": "Role Candidate",
            "email": unique_farmer,
            "password": "Password@123"
        })
        assert farmer_reg.status_code == 201
        farmer_id = farmer_reg.json()["user"]["id"]
        farmer_headers = {"Authorization": f"Bearer {farmer_reg.json()['access_token']}"}

        pred = tc.post("/api/predict", json={
            "crop": "Wheat",
            "season": "Rabi",
            "state": "Punjab",
            "area": 5.0,
            "annual_rainfall": 600.0,
            "fertilizer": 650.0,
            "pesticide": 15.0,
            "crop_year": 2024
        }, headers=farmer_headers)
        assert pred.status_code == 200
        pred_id = pred.json()["prediction_id"]

        fb = tc.post("/api/feedback", json={
            "prediction_id": pred_id,
            "rating": 5,
            "comment": "Very accurate wheat estimate!"
        }, headers=farmer_headers)
        assert fb.status_code == 201

        # 2. Admin logs in and checks Feedback Inbox & Users search/toggle
        admin_login = tc.post("/api/auth/login", json={
            "email": "admin@agritech.com",
            "password": "Admin@12345"
        })
        assert admin_login.status_code == 200
        admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

        fb_inbox = tc.get("/api/admin/feedback?min_rating=5", headers=admin_headers)
        assert fb_inbox.status_code == 200
        fb_items = fb_inbox.json()["items"]
        assert any(item["prediction_id"] == pred_id and item["crop"] == "Wheat" for item in fb_items)

        users_res = tc.get(f"/api/admin/users?search={unique_farmer}", headers=admin_headers)
        assert users_res.status_code == 200
        assert users_res.json()["total"] == 1

        toggle_res = tc.put(f"/api/admin/users/{farmer_id}/role", json={"role": "ADMIN"}, headers=admin_headers)
        assert toggle_res.status_code == 200
        assert toggle_res.json()["role"] == "ADMIN"

        revert_res = tc.put(f"/api/admin/users/{farmer_id}/role", json={"role": "FARMER"}, headers=admin_headers)
        assert revert_res.status_code == 200
        assert revert_res.json()["role"] == "FARMER"


def test_crop_doctor_catalog_and_diagnosis():
    """Verify Crop Doctor catalog and differential diagnosis linked with 3-day spray window."""
    with TestClient(app) as tc:
        cat_res = tc.get("/api/crop-doctor/catalog")
        assert cat_res.status_code == 200
        catalog = cat_res.json()
        assert len(catalog["symptoms"]) >= 8

        diag_res = tc.post("/api/crop-doctor/diagnose", json={
            "crop": "Rice",
            "state": "Punjab",
            "season": "Kharif",
            "symptoms": ["brown_leaf_spots", "interveinal_chlorosis"],
            "severity": "moderate",
            "growth_stage": "vegetative",
            "area_ha": 4.0
        })
        assert diag_res.status_code == 200
        data = diag_res.json()
        assert data["crop"] == "Rice"
        assert data["area_hectares"] == 4.0
        assert "Blast" in data["primary_diagnosis"]["condition_en"]
        assert len(data["diagnoses"]) == 2
        assert data["diagnoses"][0]["organic_control"]["total_quantity"] > 0
        assert data["diagnoses"][0]["chemical_control"]["water_volume_liters"] == 1800
        assert data["spray_window"]["verdict"] in ["OPTIMAL", "CAUTION", "DELAY"]


def test_mandi_comparator_pmfby_insurance_and_kcc():
    """Verify MSP vs Local Mandi recalculation, PMFBY premium rules, and KCC loan estimation."""
    with TestClient(app) as tc:
        # 1. Rabi Wheat on MSP (1.5% PMFBY)
        rabi_res = tc.get("/api/economics/msp?crop=Wheat&area=4&predicted_yield=4.0&fertilizer_kg=500&pesticide_kg=10&season=Rabi")
        assert rabi_res.status_code == 200
        rabi = rabi_res.json()
        assert rabi["price_mode"] == "MSP"
        assert rabi["pmfby_insurance"]["farmer_premium_pct"] == 1.5
        assert rabi["pmfby_insurance"]["sum_insured_inr"] == 272000.0
        assert rabi["pmfby_insurance"]["farmer_premium_inr"] == 4080.0
        assert rabi["kcc_eligibility"]["eligible_limit_inr"] == 299200.0

        # 2. Local Mandi rate comparison + Commercial 5% PMFBY (Sugarcane)
        mandi_res = tc.get("/api/economics/msp?crop=Sugarcane&area=2&predicted_yield=60.0&mandi_rate=400&season=Whole%20Year")
        assert mandi_res.status_code == 200
        mandi = mandi_res.json()
        assert mandi["price_mode"] == "LOCAL_MANDI"
        assert mandi["applied_rate_per_quintal_inr"] == 400.0
        assert mandi["mandi_vs_msp_diff_inr"] > 0
        assert mandi["pmfby_insurance"]["farmer_premium_pct"] == 5.0







