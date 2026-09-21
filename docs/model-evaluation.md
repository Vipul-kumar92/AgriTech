# Model Evaluation, Benchmarking & Selection Report

## 1. Regression Evaluation Metrics Defined

To evaluate continuous crop yield predictions in **tonnes/hectare**, five industry-standard regression metrics were tracked across all experimental configurations:

1. **Mean Absolute Error (MAE)**:
   $$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} |y_i - \hat{y}_i|$$
   Represents the average magnitude of absolute prediction errors in tonnes/hectare. Directly interpretable in agronomic units.
2. **Mean Squared Error (MSE)**:
   $$\text{MSE} = \frac{1}{N} \sum_{i=1}^{N} (y_i - \hat{y}_i)^2$$
   Penalizes larger prediction errors exponentially.
3. **Root Mean Squared Error (RMSE)**:
   $$\text{RMSE} = \sqrt{\text{MSE}}$$
   Maintains the original units (tonnes/ha) while assigning higher weight to severe mispredictions.
4. **Coefficient of Determination ($R^2$)**:
   $$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$
   Quantifies the proportion of variance in crop yield explained by the agricultural, meteorological, and management input features.
5. **Mean Absolute Percentage Error (MAPE)**:
   $$\text{MAPE} = \frac{100}{N} \sum_{i=1}^{N} \left| \frac{y_i - \hat{y}_i}{y_i} \right|$$
   Measures relative prediction inaccuracy as a percentage.

---

## 2. Experimental Benchmark Results

| Model Rank | Algorithm | MAE (t/ha) | MSE | RMSE (t/ha) | $R^2$ Score | MAPE (%) | 5-Fold CV $R^2$ Mean ± Std |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | **Random Forest Regressor** | 1.0109 | 23.9953 | 4.8985 | **0.8071** | 66.59% | 0.9044 ± 0.0334 |
| 2 | **Extra Trees Regressor** | 0.9621 | 24.6831 | 4.9682 | **0.8016** | 65.71% | 0.8967 ± 0.0518 |
| 3 | **XGBoost Regressor** | 1.2550 | 26.8287 | 5.1796 | **0.7843** | 78.28% | 0.8945 ± 0.0394 |
| 4 | **Gradient Boosting Regressor** | 1.3745 | 31.0450 | 5.5718 | **0.7504** | 87.10% | 0.8852 ± 0.0362 |
| 5 | **Decision Tree Regressor** | 1.2922 | 49.2014 | 7.0144 | **0.6045** | 83.32% | 0.8325 ± 0.0610 |
| 6 | **Linear Regression** | 2.4819 | 52.5091 | 7.2463 | **0.5779** | 152.88% | 0.6799 ± 0.0287 |

---

## 3. Production Model Performance (After Hyperparameter Tuning)

* **Selected Production Algorithm**: `Random Forest Regressor`
* **Production Pipeline File**: `crop_yield_model_v1.joblib`
* **Test MAE**: **0.8219 tonnes/ha**
* **Test RMSE**: **4.8010 tonnes/ha**
* **Test $R^2$**: **0.8147**
* **Test MAPE**: **33.76%**

### Agronomic Decision-Support Implications
The champion model achieves an $R^2$ score over **0.81**, explaining the overwhelming majority of variance across 54 distinct crops. Prediction errors average **0.82 tonnes/ha**, providing farmers and agricultural planners with an empirical foundation for seasonal yield forecasting.
