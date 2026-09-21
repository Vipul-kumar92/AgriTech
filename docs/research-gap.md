# Research Gap Analysis & Academic Literature Context

## 1. Background in Digital Agronomy

Crop yield prediction models in academic literature broadly divide into two paradigms:
1. **Process-Based Biophysical Models** (e.g., DSSAT, APSIM): Highly parameterized physiological simulations requiring microscopic soil layer moisture, solar radiation indices, and daily leaf area index (LAI). These models are difficult to scale across heterogeneous smallholder farming sectors due to prohibitive data acquisition costs.
2. **Empirical Data-Driven Machine Learning**: Statistical and ensemble methods leveraging historical agrarian records, remote climate sensors, and regional administrative reporting.

---

## 2. Identified Research Gaps

### Gap 1: Inconsistent Target Unit Normalization
* **Literature Issue**: Many published agricultural ML studies fail to account for reporting discrepancies in national open-data repositories. In India, APY statistics report 54 crops in Metric Tonnes (yielding tonnes/ha) while simultaneously reporting Coconut in "Thousand Nuts". Unvetted training pools create extreme distribution distortion.
* **Our Project Contribution**: We strictly partition disparate unit classifications, ensuring 100% uniformity in the continuous metric target of **Tonnes per Hectare (tonnes/ha)**.

### Gap 2: Confounding of Field Area with Input Intensity
* **Literature Issue**: Feeding raw gross fertilizer and pesticide tonnage alongside field area causes tree models to split primarily on extensive farm scale rather than biological intensity.
* **Our Project Contribution**: We engineer **`Fertilizer_per_Ha`** and **`Pesticide_per_Ha`** ratios, capturing true agronomic application density independent of field dimensions.

### Gap 3: The "Black Box" Interpretability Deficit
* **Literature Issue**: High-performing ensemble models are frequently delivered without explainability, preventing agronomists from understanding model dependency.
* **Our Project Contribution**: We incorporate Gini feature influence analysis with explicit scientific caveats emphasizing that statistical correlation does not establish physiological causality.
