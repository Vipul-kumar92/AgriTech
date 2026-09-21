# AI-Based Crop Yield Prediction System
### Final-Year B.Tech Capstone Project • Agricultural Technology & Machine Learning

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-f7931e.svg)](https://scikit-learn.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Academic-green.svg)]()

---

## 🌾 Project Overview

The **AI-Based Crop Yield Prediction System** is a complete, production-grade agricultural intelligence application that forecasts crop productivity in **tonnes per hectare (tonnes/ha)** using 24 years of real Indian agricultural and meteorological data.

Built to university engineering capstone standards, this system avoids dummy placeholders, hardcoded metrics, or simulated data. Everything is derived from actual machine learning pipelines, multi-model regression experiments, cross-validation, and hyperparameter tuning.

```
Agricultural Data ➔ Data Cleaning ➔ EDA ➔ Feature Engineering ➔ Multi-Model ML Training 
➔ Model Evaluation ➔ Best Model Serialization ➔ FastAPI Backend ➔ React Frontend ➔ Prediction ➔ MongoDB ➔ Analytics
```

---

## 🚀 Key Features

* **Authentic Agricultural Dataset**: 19,407 cleaned records spanning 1997–2020 across 30 Indian states, 54 crops, and 6 seasons from the Ministry of Agriculture & Farmers Welfare and IMD.
* **Strict Unit Consistency**: 100% uniform target of **tonnes/hectare**. Coconut (reported in nuts/ha) is partitioned to prevent scale distortion.
* **Multi-Model Regression Benchmarking**: Compares 6 distinct architectures:
  1. Linear Regression (Baseline) — $R^2 = 0.5779$, $\text{MAE} = 2.48\text{ t/ha}$
  2. Decision Tree Regressor — $R^2 = 0.6045$, $\text{MAE} = 1.29\text{ t/ha}$
  3. Gradient Boosting Regressor — $R^2 = 0.7504$, $\text{MAE} = 1.37\text{ t/ha}$
  4. XGBoost Regressor — $R^2 = 0.7843$, $\text{MAE} = 1.25\text{ t/ha}$
  5. Extra Trees Regressor — $R^2 = 0.8016$, $\text{MAE} = 0.96\text{ t/ha}$
  6. **Random Forest Regressor (Tuned Champion)** — **$R^2 = 0.8147$**, **$\text{MAE} = 0.82\text{ t/ha}$**, **$5\text{-Fold CV } R^2 = 0.9044 \pm 0.0334$**
* **Leak-Free Scikit-Learn Pipelines**: `ColumnTransformer` encapsulation with `OneHotEncoder(handle_unknown='ignore')` and `StandardScaler`.
* **Model Explainability (XAI)**: Gini feature influence metrics (Crop: 66.8%, State: 14.8%, Area: 8.8%, Rainfall: 4.1%, Management inputs: 5.5%).
* **High-Performance FastAPI Backend**: Asynchronous REST API, Pydantic v2 validation, JWT authentication with direct Bcrypt salt hashing, and Role-Based Access Control (`USER` / `ADMIN`).
* **MongoDB Persistence**: Dedicated collections for `users`, `predictions`, `models`, `feedback`, and `system_logs`.
* **16-Page React Dashboard**: High-end modern AgriTech UI built with Vite, Tailwind CSS, Recharts, and Lucide React.
* **Academic Defense Suite**: Complete documentation including 5 Research Questions, Research Gap Analysis, Limitations, Future Scope, and an interactive 20+ question Viva Exam Guide.

---

## 🛠️ Technology Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide React, Axios | Responsive Single-Page Application |
| **Backend** | Python 3.13, FastAPI, Uvicorn, Pydantic v2 | Asynchronous RESTful API Engine |
| **Machine Learning** | Scikit-Learn 1.8, XGBoost 3.4, Pandas, NumPy, Joblib | Regression modeling & Serialization |
| **Database** | MongoDB 8.0, Motor (AsyncIO driver) | Document persistence & audit logging |
| **Authentication** | PyJWT, Direct Bcrypt (Salt Rounds = 12) | Stateless token security & RBAC |

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- MongoDB Server running locally on port `27017`

### 2. Backend Setup
```bash
# Install backend and ML dependencies
pip install -r backend/requirements.txt
pip install -r ml/requirements.txt

# Start FastAPI server (Port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be accessible at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The web dashboard will be accessible at: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Demo Farmer** | `farmer@agritech.com` | `Farmer@12345` | Predictions, Personal History, Analytics |
| **Administrator** | `admin@agritech.com` | `Admin@12345` | Global Audit, User Management, Model Controls |

---

## 🧪 Running Automated Tests

```bash
# Run Machine Learning Pipeline Tests
python -m pytest tests/test_ml_pipeline.py -v

# Run FastAPI Backend Integration Tests
python -m pytest backend/tests/test_api.py -v

# Run Frontend Production Build Validation
cd frontend && npm run build
```

---

## 📁 Repository Structure

```
d:/AgriTech/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── auth/             # JWT & Bcrypt security
│   │   ├── routes/           # REST endpoints
│   │   ├── schemas/          # Pydantic validation contracts
│   │   ├── services/         # ML inference & business logic
│   │   ├── config.py         # App settings
│   │   ├── database.py       # Motor async MongoDB client
│   │   └── main.py           # FastAPI entrypoint
│   └── tests/                # Pytest backend test suite
├── ml/                       # Machine Learning Core
│   ├── data/
│   │   ├── raw/              # Raw authentic agricultural CSV
│   │   └── processed/        # Cleaned dataset (19,407 rows)
│   ├── preprocessing/        # Data cleaning & pipeline builder
│   ├── training/             # Multi-model benchmarking & tuning
│   ├── evaluation/           # Metrics & feature influence
│   ├── visualization/        # 10 publication-grade EDA plots
│   └── models/               # crop_yield_model_v1.0.joblib & metadata.json
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/       # Common UI, Navbar, Sidebar, Footer, Cards
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # 16 complete AgriTech pages
│   │   ├── services/         # Axios API client
│   │   ├── App.jsx           # React Router v6 setup
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/                     # Full Academic Documentation
│   ├── architecture.md
│   ├── dataset.md
│   ├── eda.md
│   ├── ml-pipeline.md
│   ├── model-evaluation.md
│   ├── experiments.md
│   ├── research-gap.md
│   ├── database.md
│   ├── api.md
│   ├── limitations.md
│   ├── future-scope.md
│   └── viva.md
├── docker-compose.yml
├── PROJECT_PLAN.md
├── TESTING.md
└── README.md
```

---

## 🎓 University Capstone Defense

For complete B.Tech project presentation, viva revision notes, and research question details, refer to:
* **[PROJECT_PLAN.md](file:///d:/AgriTech/PROJECT_PLAN.md)**: Full project blueprint.
* **[docs/viva.md](file:///d:/AgriTech/docs/viva.md)**: 25 Viva Examination Questions and Answers.
* **[docs/experiments.md](file:///d:/AgriTech/docs/experiments.md)**: Empirical experiment tracking logs.
* **[docs/model-evaluation.md](file:///d:/AgriTech/docs/model-evaluation.md)**: Research regression evaluation metrics.
