# Machine Learning Pipeline Architecture

## 1. Pipeline Design & Anti-Leakage Controls

The system utilizes an enterprise-grade Scikit-Learn `Pipeline` coupled with a `ColumnTransformer` to ensure total isolation between feature preprocessing and model fitting, preventing data leakage across train, test, and production inference sets.

```
                    Raw Agricultural Input
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
  [Categorical Features]               [Numerical Features]
  - Crop (54 classes)                  - Cultivated Area (ha)
  - State (30 classes)                 - Annual Rainfall (mm)
  - Season (6 classes)                 - Fertilizer Intensity (kg/ha)
            │                          - Pesticide Intensity (kg/ha)
            ▼                          - Cultivation Year
     OneHotEncoder                              │
 (handle_unknown='ignore')                      ▼
            │                             StandardScaler
            │                                   │
            └─────────────────┬─────────────────┘
                              ▼
                 Combined Feature Vector Matrix
                              │
                              ▼
            Champion Regression Estimator (Tuned)
                              │
                              ▼
              Predicted Yield (tonnes/hectare)
                              │
                              ▼
              Non-Negative Post-Clipping [0, inf)
```

## 2. In-Memory Pipeline Persistence

The fitted pipeline is serialized using `joblib` into `ml/models/crop_yield_model_v1.joblib`. During FastAPI backend startup:
1. The serialized pipeline is loaded once into memory during the application lifespan.
2. Incoming prediction payloads are transformed on-the-fly using the pre-fitted encoders and scalers.
3. Cold-start latency is < 15ms per prediction.
