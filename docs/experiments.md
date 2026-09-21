# Machine Learning Experiment Tracking Log

This document records the empirical results of all regression experiments conducted on the authentic Indian Agricultural Crop Yield dataset (1997–2020).

## Experiment Summary Table

| Experiment ID | Experiment Name | Model Architecture | MAE (t/ha) | RMSE (t/ha) | R² Score | MAPE (%) | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EXP-001** | Baseline Linear Regression | Linear Regression | 2.4819 | 7.2463 | **0.5779** | 152.88% | Initial benchmark run with 80/20 split on 15525 samples. |
| **EXP-002** | Baseline Decision Tree Regressor | Decision Tree Regressor | 1.2922 | 7.0144 | **0.6045** | 83.32% | Initial benchmark run with 80/20 split on 15525 samples. |
| **EXP-003** | Baseline Random Forest Regressor | Random Forest Regressor | 1.0109 | 4.8985 | **0.8071** | 66.59% | Initial benchmark run with 80/20 split on 15525 samples. |
| **EXP-004** | Baseline Gradient Boosting Regressor | Gradient Boosting Regressor | 1.3745 | 5.5718 | **0.7504** | 87.10% | Initial benchmark run with 80/20 split on 15525 samples. |
| **EXP-005** | Baseline Extra Trees Regressor | Extra Trees Regressor | 0.9621 | 4.9682 | **0.8016** | 65.71% | Initial benchmark run with 80/20 split on 15525 samples. |
| **EXP-006** | Baseline XGBoost Regressor | XGBoost Regressor | 1.2550 | 5.1796 | **0.7843** | 78.28% | Initial benchmark run with 80/20 split on 15525 samples. |
| **EXP-007** | Hyperparameter-Tuned Random Forest Regressor | Random Forest Regressor | 0.8219 | 4.8010 | **0.8147** | 33.76% | RandomizedSearchCV with 3-fold cross validation on parameter grid. |

---

## Detailed Experiment Logs

### EXP-001: Baseline Linear Regression
* **Date**: 2026-09-21
* **Model Type**: `Linear Regression`
* **Dataset**: `cleaned_crop_yield.csv` (19,407 observations, 80/20 train/test split)
* **Features Used**: Categorical (`Crop`, `Season`, `State`) + Numerical (`Area`, `Annual_Rainfall`, `Fertilizer_per_Ha`, `Pesticide_per_Ha`, `Crop_Year`)
* **Evaluation Metrics**:
  - MAE: **2.4819 tonnes/ha**
  - RMSE: **7.2463 tonnes/ha**
  - R²: **0.5779**
  - MAPE: **152.88%**
* **Key Observations**: Initial benchmark run with 80/20 split on 15525 samples.

### EXP-002: Baseline Decision Tree Regressor
* **Date**: 2026-09-21
* **Model Type**: `Decision Tree Regressor`
* **Dataset**: `cleaned_crop_yield.csv` (19,407 observations, 80/20 train/test split)
* **Features Used**: Categorical (`Crop`, `Season`, `State`) + Numerical (`Area`, `Annual_Rainfall`, `Fertilizer_per_Ha`, `Pesticide_per_Ha`, `Crop_Year`)
* **Evaluation Metrics**:
  - MAE: **1.2922 tonnes/ha**
  - RMSE: **7.0144 tonnes/ha**
  - R²: **0.6045**
  - MAPE: **83.32%**
* **Key Observations**: Initial benchmark run with 80/20 split on 15525 samples.

### EXP-003: Baseline Random Forest Regressor
* **Date**: 2026-09-21
* **Model Type**: `Random Forest Regressor`
* **Dataset**: `cleaned_crop_yield.csv` (19,407 observations, 80/20 train/test split)
* **Features Used**: Categorical (`Crop`, `Season`, `State`) + Numerical (`Area`, `Annual_Rainfall`, `Fertilizer_per_Ha`, `Pesticide_per_Ha`, `Crop_Year`)
* **Evaluation Metrics**:
  - MAE: **1.0109 tonnes/ha**
  - RMSE: **4.8985 tonnes/ha**
  - R²: **0.8071**
  - MAPE: **66.59%**
* **Key Observations**: Initial benchmark run with 80/20 split on 15525 samples.

### EXP-004: Baseline Gradient Boosting Regressor
* **Date**: 2026-09-21
* **Model Type**: `Gradient Boosting Regressor`
* **Dataset**: `cleaned_crop_yield.csv` (19,407 observations, 80/20 train/test split)
* **Features Used**: Categorical (`Crop`, `Season`, `State`) + Numerical (`Area`, `Annual_Rainfall`, `Fertilizer_per_Ha`, `Pesticide_per_Ha`, `Crop_Year`)
* **Evaluation Metrics**:
  - MAE: **1.3745 tonnes/ha**
  - RMSE: **5.5718 tonnes/ha**
  - R²: **0.7504**
  - MAPE: **87.1%**
* **Key Observations**: Initial benchmark run with 80/20 split on 15525 samples.

### EXP-005: Baseline Extra Trees Regressor
* **Date**: 2026-09-21
* **Model Type**: `Extra Trees Regressor`
* **Dataset**: `cleaned_crop_yield.csv` (19,407 observations, 80/20 train/test split)
* **Features Used**: Categorical (`Crop`, `Season`, `State`) + Numerical (`Area`, `Annual_Rainfall`, `Fertilizer_per_Ha`, `Pesticide_per_Ha`, `Crop_Year`)
* **Evaluation Metrics**:
  - MAE: **0.9621 tonnes/ha**
  - RMSE: **4.9682 tonnes/ha**
  - R²: **0.8016**
  - MAPE: **65.71%**
* **Key Observations**: Initial benchmark run with 80/20 split on 15525 samples.

### EXP-006: Baseline XGBoost Regressor
* **Date**: 2026-09-21
* **Model Type**: `XGBoost Regressor`
* **Dataset**: `cleaned_crop_yield.csv` (19,407 observations, 80/20 train/test split)
* **Features Used**: Categorical (`Crop`, `Season`, `State`) + Numerical (`Area`, `Annual_Rainfall`, `Fertilizer_per_Ha`, `Pesticide_per_Ha`, `Crop_Year`)
* **Evaluation Metrics**:
  - MAE: **1.255 tonnes/ha**
  - RMSE: **5.1796 tonnes/ha**
  - R²: **0.7843**
  - MAPE: **78.28%**
* **Key Observations**: Initial benchmark run with 80/20 split on 15525 samples.

### EXP-007: Hyperparameter-Tuned Random Forest Regressor
* **Date**: 2026-09-21
* **Model Type**: `Random Forest Regressor`
* **Dataset**: `cleaned_crop_yield.csv` (19,407 observations, 80/20 train/test split)
* **Features Used**: Categorical (`Crop`, `Season`, `State`) + Numerical (`Area`, `Annual_Rainfall`, `Fertilizer_per_Ha`, `Pesticide_per_Ha`, `Crop_Year`)
* **Evaluation Metrics**:
  - MAE: **0.8219 tonnes/ha**
  - RMSE: **4.801 tonnes/ha**
  - R²: **0.8147**
  - MAPE: **33.76%**
* **Key Observations**: RandomizedSearchCV with 3-fold cross validation on parameter grid.

---

## Champion Model Selection & Tuning Rationale

* **Champion Model**: `Random Forest Regressor`
* **Best Hyperparameters**: `{"regressor__n_estimators": 200, "regressor__min_samples_split": 2, "regressor__min_samples_leaf": 1, "regressor__max_depth": null}`
* **Experimental Conclusion**: Non-linear tree ensemble architectures consistently outscore parametric linear regression. Linear regression struggles with high variance between crop types (e.g. Rice at ~3 t/ha vs. Sugarcane at ~70 t/ha), resulting in low R² values. In contrast, `Random Forest Regressor` captures localized interactions between geographic state, agro-climatic season, crop genotype, and fertilizer application rate without data leakage.
