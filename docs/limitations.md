# Real-World Constraints & Project Limitations

## 1. Agricultural System Boundary Conditions

The **AI-Based Crop Yield Prediction System** is intentionally architected as a **Decision-Support Tool**, not an absolute guarantee of crop production. Real-world agrarian systems operate under ecological and biophysical uncertainties:

1. **Macro-Level Climate Data Aggregation**:
   - The primary dataset reflects annual cumulative meteorological rainfall (mm) aggregated at state/district levels rather than micro-climatic precipitation at specific farm parcel GPS coordinates.
   - Short-duration high-impact weather shocks (e.g. unseasonal hailstorms during wheat flowering or 48-hour flash flooding) are not captured in annual precipitation totals.

2. **Absence of Direct Soil Mineralogy**:
   - The model utilizes gross applied chemical fertilizer (NPK) and pesticide as proxies for management intensity. It does not measure pre-existing field soil chemistry (soil pH, cation exchange capacity, extractable soil organic carbon).

3. **Geographic Extrapolation Boundaries**:
   - The model is trained on 30 Indian states and union territories. Projecting predictions for agricultural zones outside India (e.g., Sub-Saharan Africa or the US Midwest) with drastically different soil vertisols and mechanized crop genetics is invalid.

4. **Agronomic Scope**:
   - Yield forecasts do not replace local agronomic extension officer consultations regarding crop rotation, seed germination rates, or emergent pest infestations.
