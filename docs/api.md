# REST API Documentation & Endpoint Specification

Base URL: `http://localhost:8000/api`

Interactive Swagger OpenAPI UI available at: `http://localhost:8000/docs`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Register a new user account.
* **Request Body**:
  ```json
  {
    "name": "Ramesh Patel",
    "email": "ramesh@example.com",
    "password": "Password@123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "67401a...",
      "name": "Ramesh Patel",
      "email": "ramesh@example.com",
      "role": "USER",
      "created_at": "2026-09-21T10:00:00Z"
    }
  }
  ```

### `POST /api/auth/login`
Authenticate existing account and retrieve JWT bearer token.
* **Request Body**:
  ```json
  {
    "email": "admin@agritech.com",
    "password": "Admin@12345"
  }
  ```
* **Response (200 OK)**: Returns JWT bearer token and user object.

### `GET /api/auth/me`
Retrieve currently authenticated profile.
* **Headers**: `Authorization: Bearer <token>`

---

## 2. Crop Yield Prediction Endpoints

### `POST /api/predict`
Run real machine learning inference for crop yield estimation.
* **Request Body**:
  ```json
  {
    "crop": "Rice",
    "season": "Kharif",
    "state": "Punjab",
    "area": 120.0,
    "annual_rainfall": 1150.0,
    "fertilizer": 18000.0,
    "pesticide": 420.0,
    "crop_year": 2024
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "prediction_id": "67402f...",
    "predicted_yield": 4.15,
    "unit": "tonnes/hectare",
    "predicted_total_production": 498.0,
    "production_unit": "metric tonnes",
    "prediction_interval": {
      "lower": 3.35,
      "upper": 4.95
    },
    "model_version": "v1.0",
    "model_name": "Random Forest Regressor (Optimized)",
    "created_at": "2026-09-21T10:05:00Z",
    "input_summary": { ... },
    "feature_influence": {
      "Crop": 66.77,
      "State": 14.83,
      "Area": 8.84,
      "Annual_Rainfall": 4.10,
      "Pesticide_per_Ha": 1.61,
      "Crop_Year": 1.58,
      "Fertilizer_per_Ha": 1.25,
      "Season": 1.00
    }
  }
  ```

### `GET /api/predictions`
Retrieve user's historical prediction logs with pagination and filters (`crop`, `state`, `season`, `search`).

### `GET /api/predictions/{id}`
Retrieve granular input parameters and breakdown for a specific prediction ID.

---

## 3. Analytics & System Endpoints

### `GET /api/analytics`
High-level KPIs, crop yield distributions, seasonal variances, and regional productivity.

### `GET /api/dataset/stats`
Statistical provenance of the 19,407-record training dataset.

### `GET /api/models`
Comparative benchmarks of all 6 evaluated regression models.

### `GET /api/feature-importance`
Normalized Gini feature influence percentages for the production model.

### `POST /api/feedback`
Submit farmer satisfaction rating (1–5 stars) and qualitative feedback.

### `GET /api/admin/stats`
Global administrative metrics (requires `role: ADMIN`).

### `GET /api/health`
Liveness and readiness health check verifying database and model status.
