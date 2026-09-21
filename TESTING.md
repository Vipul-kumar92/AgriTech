# Automated & Manual Testing Strategy

## 1. Automated Test Execution

### A. Machine Learning Pipeline Tests
Verifies artifact integrity, metadata schema validation, dataset consistency, and multi-crop inference.
```bash
python -m pytest tests/test_ml_pipeline.py -v
```
**Results Verified**:
- `test_model_artifact_exists`: PASSED
- `test_metadata_integrity`: PASSED
- `test_processed_dataset_integrity`: PASSED
- `test_pipeline_prediction_inference`: PASSED

### B. FastAPI Backend Integration Tests
Tests server health, JWT authentication, user registration, valid/invalid prediction payloads, analytics, and model benchmark endpoints.
```bash
python -m pytest backend/tests/test_api.py -v
```
**Results Verified**:
- `test_health_endpoint`: PASSED
- `test_admin_and_farmer_login`: PASSED
- `test_user_registration`: PASSED
- `test_prediction_inference_valid`: PASSED
- `test_prediction_input_validation_failure`: PASSED
- `test_analytics_and_dataset_stats`: PASSED
- `test_models_benchmark_and_feature_importance`: PASSED

### C. Frontend Production Build Verification
Verifies that all JSX syntax, imports, styles, and routing components compile without errors.
```bash
cd frontend
npm run build
```
**Results Verified**:
- Built production bundle in `frontend/dist/` in 25.98s with 0 errors.

---

## 2. Manual Verification Workflow

1. **Start Services**:
   - Backend: `python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000`
   - Frontend: `cd frontend && npm run dev`
2. **Access Web Application**: Open `http://localhost:5173` in any modern web browser.
3. **Login**: Click **Sign In**, then use the 1-click **Demo Farmer** button (`farmer@agritech.com` / `Farmer@12345`).
4. **Make Prediction**: Navigate to `/predict`, select crop (e.g. Wheat), state (Punjab), season (Rabi), and farm parameters. Click **Generate Prediction**.
5. **Inspect Breakdown**: Verify predicted yield in **tonnes/hectare**, total production in **tonnes**, empirical interval, and feature influence.
6. **Submit Feedback**: Provide rating and qualitative remarks.
7. **Audit & Analytics**: Explore `/history`, `/analytics`, `/dataset-insights`, and `/model-performance`.
8. **Admin Center**: Sign in as **Demo Admin** (`admin@agritech.com` / `Admin@12345`) to access `/admin`, `/admin/users`, and `/admin/predictions`.
