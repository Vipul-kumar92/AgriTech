# Exploratory Data Analysis (EDA) Report

## 1. Executive Summary

A comprehensive statistical and exploratory data analysis was conducted on the cleaned dataset of **19,407 agricultural records** spanning 1997 through 2020. Ten publication-grade visualization artifacts were rendered and stored in `ml/visualization/`.

---

## 2. Visualizations Generated

| Index | Visual File | Title / Focus |
| :--- | :--- | :--- |
| **01** | `01_yield_distribution.png` | Raw Yield vs. Log-Transformed Yield distributions |
| **02** | `02_crop_distribution.png` | Top 15 Most Frequently Cultivated Crops |
| **03** | `03_yield_by_crop.png` | Top 15 Crops by Mean Biomass Productivity (Tonnes/Ha) |
| **04** | `04_yield_by_season.png` | Crop Yield Distribution across Indian Agricultural Seasons |
| **05** | `05_yield_by_region.png` | Top 15 States by Mean Crop Productivity |
| **06** | `06_rainfall_vs_yield.png` | Annual Precipitation (mm) vs. Crop Yield with trendline |
| **07** | `07_fertilizer_vs_yield.png` | Fertilizer Intensity (kg/ha) vs. Crop Yield |
| **08** | `08_area_vs_yield.png` | Log-Transformed Cultivated Area vs. Crop Yield |
| **09** | `09_correlation_matrix.png` | Correlation Matrix across continuous agronomic variables |
| **10** | `10_outlier_analysis.png` | Multivariate Outlier & Dispersion Analysis (Boxplots) |

---

## 3. Key Agronomic & Statistical Findings

### A. Yield Distribution & Skewness
* **Observation**: The raw target variable `Yield` exhibits strong positive (right) skewness with a median of **1.03 tonnes/ha** and a mean of **4.31 tonnes/ha**.
* **Agronomic Explanation**: Most food grains (Rice: ~2.5–4.0 t/ha, Wheat: ~3.0–4.5 t/ha, Maize: ~2.5–3.5 t/ha, Pulses: ~0.8–1.5 t/ha) cluster tightly under 5 tonnes/ha. High-biomass commercial crops like Sugarcane (50–120 t/ha) and root tubers (Potato: 15–25 t/ha, Tapioca: 15–30 t/ha) naturally produce substantially higher tonnage per hectare due to high water and carbohydrate mass retention.
* **Modeling Implication**: Robust tree-based regression algorithms (Random Forest, Extra Trees, Gradient Boosting, XGBoost) are far better suited to capture these multi-modal, non-linear crop regimes than simple linear regression.

### B. Seasonal Dynamics
* **Observation**: Summer and Autumn seasons display distinct yield profiles compared to Kharif (monsoon-dependent) and Rabi (winter irrigation-dependent).
* **Agronomic Explanation**: Kharif crops are heavily reliant on southwest monsoon dynamics, whereas Rabi crops benefit from controlled canal and tubewell irrigation alongside cooler ripening temperatures.

### C. Correlation Insights
* **Gross Inputs vs. Intensity**: Gross fertilizer and pesticide totals correlate strongly with total field area ($r > 0.85$), which reflects extensive scale rather than biological intensity. By engineering **`Fertilizer_per_Ha`** and **`Pesticide_per_Ha`**, the model captures true agricultural input density per hectare.
* **Correlation Values with Yield**:
  - `Annual_Rainfall` correlation with Yield: **-0.027**
  - `Fertilizer_per_Ha` correlation with Yield: **0.016**
  - `Log_Area` correlation with Yield: **0.046**

> [!NOTE]
> **No Causality Claimed**: As emphasized in project standards, statistical correlation does not establish physiological causality. Fertilizer and rainfall interact non-linearly with soil quality, crop genotype, and agro-climatic zones.
