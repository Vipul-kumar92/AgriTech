# Dataset Provenance & Agricultural Data Profile

## 1. Dataset Overview

* **Dataset Name**: Indian Agricultural Crop Yield & Climate Dataset (1997–2020)
* **Source**: Ministry of Agriculture & Farmers Welfare, Government of India & India Meteorological Department (IMD)
* **Raw Records**: 19,689 observations
* **Raw Features**: 10 attributes
* **Processed Records**: 19,407 observations
* **Target Variable**: `Yield`
* **Target Unit**: **Tonnes per Hectare (tonnes/ha)** (100% consistent across all crops in the modeling set)
* **Temporal Coverage**: 1997 to 2020 (24 continuous agricultural years)
* **Geographical Coverage**: 30 Indian States and Union Territories
* **Crop Diversity**: 54 distinct agricultural crops
* **Seasons Represented**: 6 agricultural seasons (Kharif, Rabi, Summer, Autumn, Winter, Whole Year)

---

## 2. Feature Dictionary

| Feature Name | Data Type | Measurement Unit | Description |
| :--- | :--- | :--- | :--- |
| `Crop` | Categorical | N/A | Agricultural crop species (e.g., Rice, Wheat, Sugarcane, Maize, Cotton, Potato, Groundnut, Gram). |
| `Crop_Year` | Integer | Year (YYYY) | Cultivation calendar year (1997–2020). |
| `Season` | Categorical | Agro-Season | Indian agricultural cropping season (Kharif, Rabi, Summer, Autumn, Winter, Whole Year). |
| `State` | Categorical | State / UT | Indian State or Union Territory where cultivation occurred. |
| `Area` | Continuous | Hectares (ha) | Total cultivated area dedicated to the specific crop. |
| `Production` | Continuous | Metric Tonnes (tonnes) | Total gross harvested production output. |
| `Annual_Rainfall` | Continuous | Millimeters (mm) | Annual cumulative precipitation recorded by IMD for the region. |
| `Fertilizer` | Continuous | Kilograms (kg) | Total gross chemical fertilizer (NPK) applied across the cultivated area. |
| `Pesticide` | Continuous | Kilograms (kg) | Total gross plant protection chemicals (pesticides) applied. |
| `Fertilizer_per_Ha` | Continuous | kg / hectare | *Engineered Feature*: Input application intensity of fertilizer per unit land area. |
| `Pesticide_per_Ha` | Continuous | kg / hectare | *Engineered Feature*: Input application intensity of pesticides per unit land area. |
| `Log_Area` | Continuous | Log(ha + 1) | *Engineered Feature*: Logarithmic transform of cultivated area to normalize extreme skew. |
| **`Yield` (Target)** | Continuous | **Tonnes / Hectare** | **Target variable: Crop productivity calculated as `Production / Area`.** |

---

## 3. Data Cleaning & Unit Consistency Strategy

### The Coconut Unit Discrepancy
In the official agricultural reporting format of the Directorate of Economics and Statistics (DES), Ministry of Agriculture & Farmers Welfare:
- **Food grains, oilseeds, pulses, and commercial crops** (54 crops) report production in **Metric Tonnes**, yielding a `Yield` metric of **Tonnes per Hectare (tonnes/ha)**.
- **Coconut** production is officially reported in **1,000 Nuts**, yielding numbers on the order of **8,000 to 21,000 nuts/hectare**.

Mixing nuts/ha with tonnes/ha creates severe distribution skew, inflates regression errors (MSE/RMSE), and violates strict unit integrity.

**Solution Implemented**:
1. All 172 Coconut records were partitioned out of the continuous tonnes/ha training dataset.
2. The remaining 19,407 records operate on a **strictly uniform target unit of Tonnes/Hectare**.

### Missing Values & Duplicate Records
- **Raw Missing Values**: 0 null values in the primary dataset.
- **Duplicate Records**: Audited and confirmed 0 duplicate rows.
- **Boundary Validation**: Cultivated area and yield were validated to ensure non-negative values and agronomic feasibility (excluding records with zero harvest or extreme unverified outliers exceeding 250 tonnes/ha).

---

## 4. Summary Statistics (Processed Dataset)

| Metric | Area (ha) | Annual Rainfall (mm) | Fertilizer (kg) | Pesticide (kg) | Yield (tonnes/ha) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mean** | 180523.93 | 1435.37 | 24180369.77 | 49013.02 | 4.31 |
| **Std Dev** | 737500.60 | 815.45 | 95542545.83 | 214658.43 | 11.88 |
| **Min** | 0.50 | 301.30 | 54.17 | 0.09 | 0.0036 |
| **25%** | 1412.50 | 940.70 | 191198.95 | 362.84 | 0.60 |
| **Median (50%)** | 9300.00 | 1247.00 | 1229114.56 | 2416.47 | 1.03 |
| **75%** | 74947.50 | 1635.90 | 9960417.85 | 19924.35 | 2.33 |
| **Max** | 50808100.00 | 6552.70 | 4835406877.00 | 15750511.00 | 249.99 |

---

## 5. Dataset Limitations

1. **Macro-Level Aggregations**: Rainfall represents regional annual meteorological aggregates rather than daily micro-climatic readings at specific farm field GPS coordinates.
2. **Soil Mineral Attributes (NPK)**: The dataset tracks gross applied chemical fertilizer and pesticide rather than pre-existing soil chemical compositions (soil organic carbon, soil pH, extractable nitrogen, phosphorus, potassium).
3. **Temporal Policy Shifting**: Fertilizer usage reporting conventions evolved over the 1997–2020 timeframe, requiring normalized intensity metrics (`Fertilizer_per_Ha`).
4. **Extreme Climate Shocks**: Catastrophic localized weather phenomena (e.g., unseasonal hail, flash floods) are captured primarily via annual rainfall totals, leaving short-duration heat spikes unrecorded.
