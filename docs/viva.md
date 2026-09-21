# B.Tech Project Viva Defense & Technical Examination Guide

This document contains 25 questions and answers designed to prepare engineering students for university capstone viva examinations.

---

### Q1: What is the main problem your project solves?
**Answer**: Agricultural yield in India is subject to significant climate and input variability. Our system provides a scientific, data-driven regression decision-support tool that predicts crop yield in **tonnes/hectare** using 24 years of authentic agricultural data, enabling farmers and planners to forecast harvest outputs accurately.

### Q2: Why machine learning instead of traditional rule-based formulas?
**Answer**: Crop growth exhibits complex non-linear interactions between weather (rainfall), farm management (fertilizer/pesticide density), seasonal cycles, and regional geography. Traditional linear formulas fail to capture these multi-dimensional interactions, whereas ensemble ML models capture non-linear feature splits effectively.

### Q3: Why regression instead of classification?
**Answer**: Yield is a continuous physical quantity measured in tonnes per hectare. Classification assigns discrete labels (e.g. recommending "Rice" vs "Wheat"), whereas regression predicts a numerical production estimate.

### Q4: What is crop yield and how is it calculated?
**Answer**: Crop yield is agricultural productivity per unit area. It is calculated as:
$$\text{Yield} = \frac{\text{Total Harvested Production (Metric Tonnes)}}{\text{Cultivated Area (Hectares)}} = \text{Tonnes/Hectare}$$

### Q5: What dataset was used?
**Answer**: The Indian Agricultural Crop Yield & Climate Dataset (1997–2020), comprising 19,407 cleaned records sourced from the Ministry of Agriculture & Farmers Welfare and the India Meteorological Department (IMD), covering 30 Indian states, 54 crops, and 6 seasons.

### Q6: Why did you partition Coconut out of the primary regression dataset?
**Answer**: In Indian agricultural statistics, Coconut production is recorded in "Thousand Nuts", resulting in yields on the order of 8,000–20,000 nuts/ha, whereas all other 54 crops record production in Metric Tonnes (yielding tonnes/ha). Mixing nuts/ha with tonnes/ha introduces massive scale distortion and violates strict unit consistency.

### Q7: What features are used for prediction?
**Answer**:
- Categorical: `Crop` (54 categories), `State` (30 categories), `Season` (6 categories).
- Numerical: `Area` (hectares), `Annual_Rainfall` (mm), `Fertilizer_per_Ha` (kg/ha), `Pesticide_per_Ha` (kg/ha), `Crop_Year`.

### Q8: What feature engineering was performed?
**Answer**: We engineered:
1. `Fertilizer_per_Ha = Fertilizer / Area` (kg/ha)
2. `Pesticide_per_Ha = Pesticide / Area` (kg/ha)
3. `Log_Area = log(1 + Area)` to normalize extreme right-skewed field area distributions.

### Q9: Which models did you train and compare?
**Answer**: We evaluated 6 regression architectures:
1. Linear Regression (Baseline)
2. Decision Tree Regressor
3. Random Forest Regressor
4. Gradient Boosting Regressor
5. Extra Trees Regressor
6. XGBoost Regressor

### Q10: What metrics did you evaluate?
**Answer**: Mean Absolute Error (MAE), Mean Squared Error (MSE), Root Mean Squared Error (RMSE), Coefficient of Determination ($R^2$), and Mean Absolute Percentage Error (MAPE).

### Q11: Why is Random Forest the best model?
**Answer**: Random Forest achieved the best generalization balance on the test set: $R^2 = 0.8147$, $\text{MAE} = 0.8219\text{ tonnes/ha}$, and the highest 5-fold cross-validation stability ($R^2 = 0.9044 \pm 0.0334$), effectively handling diverse crop biomass scales without overfitting.

### Q12: Why should you NEVER claim "Accuracy = 95%" for regression?
**Answer**: "Accuracy" is mathematically defined for classification as $(\text{TP} + \text{TN}) / \text{Total}$. For continuous regression, predictions rarely equal ground truth to infinite decimals. The correct terminology is $R^2$ score ($0.81$) or MAE ($0.82\text{ t/ha}$).

### Q13: What is data leakage and how was it prevented?
**Answer**: Data leakage occurs when test set knowledge contaminates training transformations. We used Scikit-Learn's `Pipeline` and `ColumnTransformer` to fit scalers and one-hot encoders strictly on the training set.

### Q14: What is 5-Fold Cross Validation?
**Answer**: The training dataset is split into 5 equal subsets. In each iteration, 4 folds train the model and 1 fold evaluates it. Repeating this 5 times provides the mean score and standard deviation, verifying model stability across data subsets.

### Q15: How did Hyperparameter Tuning help?
**Answer**: Tuning 200 estimators, tree depth, and minimum leaf samples via `RandomizedSearchCV` decreased test MAE from $1.01\text{ t/ha}$ to $0.82\text{ t/ha}$ (an 18.7% error reduction).

### Q16: What is Model Feature Influence?
**Answer**: It measures Gini impurity reduction across decision trees. Our model found Crop genotype (66.8%) and State geography (14.8%) to be primary drivers, with rainfall and inputs modulating seasonal variations.

### Q17: Does feature importance prove causality?
**Answer**: No. Feature importance measures statistical predictive dependence in the model, but does not prove biological causality.

### Q18: What is the tech stack of your application?
**Answer**:
- Frontend: React 18, Vite, Tailwind CSS, Recharts, Lucide React.
- Backend: Python 3.13, FastAPI, Uvicorn, Pydantic v2.
- Machine Learning: Scikit-Learn, XGBoost, Pandas, NumPy, Joblib.
- Database: MongoDB 8.0 with Motor async driver.
- Security: JWT (JSON Web Tokens) with direct Bcrypt salt hashing.

### Q19: What are the database collections in MongoDB?
**Answer**: `users`, `predictions`, `models`, `feedback`, and `system_logs`.

### Q20: What are the primary limitations of the project?
**Answer**: Macro-level annual rainfall data rather than parcel microclimate, lack of direct soil mineralogy measurements (soil pH, organic carbon), and geographical limitation to India.
