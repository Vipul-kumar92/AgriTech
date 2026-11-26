# KrishiPulse.AI — Smart Agricultural Yield, Crop Doctor & Farm Finance Platform
### Production-Grade Full-Stack AgriTech Platform • B.Tech Capstone Project

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20%2B%20Offline-059669.svg)](#installable-pwa--offline-support)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.8-f7931e.svg)](https://scikit-learn.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248.svg)](https://www.mongodb.com/)

---

## Overview

**KrishiPulse.AI** is an end-to-end bilingual (**English & Hindi**) agricultural intelligence application combining authentic Indian crop yield ML inference (**19,407 verified records, 1997–2020, 54 crops, 30 Indian states/UTs**) with real-time agro-meteorology, CACP MSP + local Mandi economics, PMFBY crop insurance, Soil Health Card dosing, and AI pest/disease triage.

```
┌────────────────────────────────────────────────────────────────────────────┐
│               React 18 + Tailwind + Recharts + PWA Frontend                │
│  Dashboard • Predict & Top-5 Recommender • Crop Doctor • India Yield Map   │
│  What-If Simulator • Soil Health Card N-P-K-pH • Compare History (CSV/PDF) │
└──────────────────────────────────────┬─────────────────────────────────────┘
                                       │ REST (/api/*) + JWT + Google OAuth
┌──────────────────────────────────────▼─────────────────────────────────────┐
│                        FastAPI Async Backend Engine                        │
│  Auth/RBAC • PredictionEngine • Simulation & PMFBY/KCC • Crop Doctor       │
│  Analytics Slicing • 7-Day Open-Meteo + GPS Haversine Resolver             │
└──────────────┬───────────────────────────────────────────┬─────────────────┘
               │ Scikit-Learn Random Forest (v1.0)         │ Motor AsyncIO
┌──────────────▼──────────────────┐         ┌──────────────▼─────────────────┐
│ cleaned_crop_yield.csv (19,407) │         │ MongoDB (users, predictions,   │
│ crop_yield_model_v1.0.joblib    │         │ feedback, models, system_logs) │
└─────────────────────────────────┘         └────────────────────────────────┘
```

---

## Core Capabilities

### 1. Empirical ML Yield Prediction & Top-5 Crop Recommender
- **Single-Crop Inference (`/predict`):** Forecasts yield (`tonnes/hectare`), total harvest (`tonnes`), 80% empirical prediction intervals, and Gini feature importance.
- **Top-5 Profitable Crop Recommender (`POST /api/recommend-crops`):** Evaluates regionally suited crops for the farmer's state & season in a single vectorized ML batch pass and ranks **Top-5 crops by net MSP profit (`₹`)**, featuring a **"Best Profit Crop vs Best Yield Crop"** dual-axis comparison chart.
- **Bilingual Voice Input:** Speak parameters naturally in **English or Hindi** (e.g., *"50 hectare Rice Punjab Kharif"* or *"5 एकड़ गेहूं उत्तर प्रदेश रबी"*) to auto-fill forms cleanly.

### 2. AI Crop Doctor (`CropDoctorPage` & `/api/crop-doctor/diagnose`)
- Multi-symptom clinical triage across **Nutrient Deficiencies** (N, P, K, Zinc/Khaira), **Fungal Infections** (Rice Blast, Wheat Rust, Powdery Mildew), **Pests** (Stem Borer, Pod Borer, Bollworm, Sucking Pests), and **Root/Soil Wilt**.
- Crop-specific refinement + farm-area-scaled **Organic/IPM Bio-Control** and **ICAR Recommended Chemical Control** doses (`water_volume_liters` calculated automatically).
- **Live 3-Day Weather Spray Window Check:** Links Open-Meteo 3-day rain/wind forecasts (`OPTIMAL`, `CAUTION`, `DELAY`) and highlights dry spray days.

### 3. Live 7-Day Agro-Weather, GPS Detection & Spray Warnings
- Fetches current climate + **7-day min/max temperature and rain forecast** via Open-Meteo (`backend/app/services/weather_service.py`) with IMD historical fallback.
- **Use My GPS Location:** Resolves browser GPS coordinates via Haversine distance (`GET /api/weather/locate`) to auto-select the nearest Indian state on both Dashboard and Predict Lab.
- Generates dynamic **Spraying & Irrigation Warnings** in Hindi & English.

### 4. Interactive Soil Health Card (`N-P-K-pH`) & Farming Calendar Advisory
- Converts predicted yield + crop profile + farm hectares into **Basal vs Top-Dressing** schedules across `Urea (46% N)`, `DAP (18-46-0)`, `MOP (60% K)`, sowing/harvest windows, and critical irrigation stages (`CRI`, `Tillering`, `Panicle Initiation`, `Pod Filling`).
- **Interactive Soil Health Card Calculator (`frontend/src/utils/farmingAdvisory.js`):** Accepts soil **Available N, P, K (`kg/ha`)**, **Soil pH**, and **Organic Carbon (`%`)**, classifies `Low / Medium / High / Acidic / Sodic`, scales nutrient doses, and calculates exact bags of **Urea (45 kg)**, **DAP (50 kg)**, **MOP (50 kg)**, **Zinc Sulphate**, plus **Agricultural Lime / Gypsum** reclamation doses.
- Exports offline self-contained **HTML Advisory Cards** and print-ready certificates.

### 5. Farm Finance: MSP vs Local Mandi, PMFBY Crop Insurance & KCC Eligibility
- **MSP vs Local Mandi Switch (`GET /api/economics/msp`):** Compares CACP 2024–25 MSP rates against custom local Mandi prices (`₹/quintal`) with live rupee/margin delta.
- **PMFBY Insurance Calculator:** Applies Government of India statutory farmer premium caps (**2.0% Kharif**, **1.5% Rabi**, **5.0% Commercial/Horticultural**) on regional Scale of Finance sum insured.
- **KCC (Kisan Credit Card) Estimator:** Computes crop loan eligibility and `4%` prompt-repayment subvention interest estimates.

### 6. Geospatial India Yield Map, What-If Simulator, History Compare & Admin Center
- **Agri Yield Map (`/map`):** Interactive coordinate-projected SVG India explorer with state-wise yield tiers and leaderboards.
- **What-If Simulator (`/simulator`):** Rainfall (`-40%..+40%`) and Fertilizer (`50..250 kg/ha`) sensitivity curves plotted with net profit maximization insights.
- **Prediction History (`/history`):** Side-by-side comparison of any 2 predictions (Yield + Net MSP Profit chart), inline record deletion (`DELETE /api/predictions/{id}`), CSV export, and Print/PDF.
- **Admin Governance (`/admin`, `/admin/users`):** Live **Farmer Feedback Inbox** with rating filters (`GET /api/admin/feedback`), user directory search, and **FARMER ↔ ADMIN** role management (`PUT /api/admin/users/{id}/role`).
- **Profile & Auth:** JWT + Bcrypt authentication, Google OAuth flow, and direct client-resized avatar image upload (`256×256` JPEG stored in MongoDB).

### 7. Installable PWA & Offline Support
- Includes `manifest.webmanifest`, supersampled PNG icons (`192×192`, `512×512`, Apple touch icon), `offline.html`, and service worker (`frontend/public/sw.js`) caching the app shell and read-only agronomy APIs for low-connectivity rural use.

---

## ML Benchmarks (`6 Evaluated Models`)

| Rank | Algorithm | MAE (t/ha) | $R^2$ Score | 5-Fold CV $R^2$ |
| :--- | :--- | :---: | :---: | :---: |
| **1 (Champion)** | **Random Forest Regressor (Optimized)** | **0.82** | **0.8147** | **0.9044 ± 0.0334** |
| 2 | Extra Trees Regressor | 0.96 | 0.8016 | — |
| 3 | XGBoost Regressor | 1.25 | 0.7843 | — |
| 4 | Gradient Boosting Regressor | 1.37 | 0.7504 | — |
| 5 | Decision Tree Regressor | 1.29 | 0.6045 | — |
| 6 | Linear Regression (Baseline) | 2.48 | 0.5779 | — |

---

## Key REST API Endpoints (`/api`)

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/health` | DB connectivity, uptime, and active ML model status |
| `POST` | `/api/auth/register`, `/login`, `/google`, `PUT /profile` | JWT auth, Google sign-in, and avatar/profile persistence |
| `POST` | `/api/predict` | Single-crop yield forecast + confidence bounds + DB audit log |
| `POST` | `/api/recommend-crops` | Vectorized Top-5 most profitable crops ranking for region & season |
| `GET` | `/api/predictions`, `/predictions/{id}`, `DELETE /predictions/{id}` | Paginated audit history with economics & delete access control |
| `GET` | `/api/weather/live`, `/weather/locate` | 7-day Open-Meteo forecast, spray alerts, & Haversine GPS state lookup |
| `GET` | `/api/crop-doctor/catalog`, `POST /crop-doctor/diagnose` | Differential pest/disease/nutrient diagnosis + 3-day spray window |
| `GET` | `/api/economics/msp` | MSP vs Mandi comparison, PMFBY insurance cap, & KCC loan estimator |
| `POST` | `/api/simulate` | Rainfall shock & fertilizer intensity sensitivity simulation |
| `GET` | `/api/analytics`, `/dataset/stats`, `/map/states` | Filtered analytics KPIs, yearly trends, & 30-state geospatial telemetry |
| `POST` | `/api/feedback` | Save 1–5 star ratings and qualitative farmer reviews |
| `GET` | `/api/admin/stats`, `/users`, `/feedback`, `PUT /users/{id}/role` | Admin KPIs, Feedback Inbox, user search, and RBAC role management |

---

## Quickstart Guide

### 1. Backend & ML Setup
```bash
pip install -r backend/requirements.txt
pip install -r ml/requirements.txt

# Optional: pre-train champion pipeline (auto-builds if absent)
python train_model.py

# Start FastAPI server (Port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Web / PWA app: `http://127.0.0.1:5173`

### 3. Demo Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo Farmer** | `farmer@agritech.com` | `Farmer@12345` |
| **Administrator** | `admin@agritech.com` | `Admin@12345` |

---

## Automated Testing

```bash
# Backend, ML Pipeline & Security Tests (25 tests)
python -m pytest tests/test_ml_pipeline.py tests/test_security_and_config.py backend/tests/test_api.py -v

# Frontend Vitest Suite & Production Bundle Build
cd frontend && npm test && npm run build
```

---

## Repository Structure

```text
d:/AgriTech/
├── backend/
│   ├── app/
│   │   ├── auth/                  # JWT & Bcrypt verification
│   │   ├── routes/                # auth, predict, analytics, crop_doctor, feedback, admin, models_info
│   │   ├── schemas/               # Pydantic v2 contracts
│   │   └── services/              # prediction_service, simulation_service, weather_service, crop_doctor_service
│   └── tests/test_api.py          # FastAPI integration test suite
├── ml/
│   ├── data/processed/            # cleaned_crop_yield.csv (19,407 records)
│   └── models/                    # crop_yield_model_v1.0.joblib & metadata.json
├── frontend/
│   ├── public/                    # manifest.webmanifest, sw.js, offline.html, PWA icons
│   └── src/
│       ├── components/common/     # Navbar, Sidebar, MobileBottomNav, Footer, PwaInstallPrompt, StatCard
│       ├── context/               # AuthContext, LanguageContext (EN / HI)
│       ├── pages/                 # Dashboard, Predict, Result, History, CropDoctor, AgriMap, Simulator, Analytics, Admin*
│       ├── utils/                 # farmingAdvisory (NPK + SHC), voiceParser, jwt
│       └── test/                  # Vitest + React Testing Library suite
├── tests/                         # ML pipeline & security/config/PWA tests
├── docker-compose.yml
├── train_model.py
└── README.md
```
