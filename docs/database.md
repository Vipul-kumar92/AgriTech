# Database Architecture & MongoDB Schemas

## 1. Storage Engine Overview

The persistent data tier uses **MongoDB 8.0**, taking advantage of flexible JSON BSON document mapping for agricultural records, complex nested prediction feature sets, and system event logs.

* **Database Name**: `agritech_db`
* **Driver**: `motor.motor_asyncio` (Non-blocking async driver for Python/FastAPI)

---

## 2. Collections & Schema Definitions

### A. `users` Collection
Stores registered user identities, password hashes, and authorization roles.
```json
{
  "_id": "ObjectId",
  "name": "Vipul Farmer",
  "email": "farmer@agritech.com",
  "password_hash": "$2b$12$...",
  "role": "USER", // "USER" or "ADMIN"
  "created_at": "2026-09-21T10:00:00Z"
}
```
* **Indexes**: `email` (Unique Index).

### B. `predictions` Collection
Immutable audit log of all generated crop yield predictions.
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId or 'anonymous'",
  "user_email": "farmer@agritech.com",
  "input_features": {
    "crop": "Wheat",
    "season": "Rabi",
    "state": "Punjab",
    "area_hectares": 50.0,
    "annual_rainfall_mm": 700.0,
    "fertilizer_kg": 7000.0,
    "pesticide_kg": 150.0,
    "fertilizer_per_ha_kg": 140.0,
    "pesticide_per_ha_kg": 3.0,
    "crop_year": 2024
  },
  "predicted_yield": 4.25,
  "unit": "tonnes/hectare",
  "predicted_total_production": 212.5,
  "production_unit": "metric tonnes",
  "prediction_interval": {
    "lower": 3.45,
    "upper": 5.05
  },
  "model_version": "v1.0",
  "model_name": "Random Forest Regressor (Optimized)",
  "created_at": "2026-09-21T10:05:00Z"
}
```
* **Indexes**: `created_at` (Descending), `user_id`, `input_features.crop`.

### C. `feedback` Collection
Collects farmer satisfaction ratings and qualitative commentary.
```json
{
  "_id": "ObjectId",
  "prediction_id": "ObjectId",
  "user_id": "ObjectId",
  "user_email": "farmer@agritech.com",
  "rating": 5,
  "comment": "Accurate estimate matching local harvest figures.",
  "created_at": "2026-09-21T10:06:00Z"
}
```
* **Indexes**: `created_at` (Descending).

### D. `system_logs` Collection
Audits platform API actions and latency metrics.
```json
{
  "_id": "ObjectId",
  "action": "MODEL_PREDICTION",
  "user": "farmer@agritech.com",
  "crop": "Wheat",
  "predicted_yield": 4.25,
  "timestamp": "2026-09-21T10:05:00Z"
}
```
* **Indexes**: `timestamp` (Descending).
