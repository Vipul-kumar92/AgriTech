"""
Agronomic What-If Simulation & MSP Farm Economics Engine
AI-Based Crop Yield Prediction System
"""

import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from backend.app.config import settings
from backend.app.services.prediction_service import PredictionEngine

# Official Government of India Minimum Support Prices (MSP 2024-25 in INR per Quintal)
# & Agricultural Wholesale Market Benchmarks for horticulture/spices
# 1 Metric Tonne = 10 Quintals
MSP_RATES_INR_PER_QUINTAL: Dict[str, float] = {
    "Paddy": 2300.0,
    "Rice": 2300.0,
    "Wheat": 2275.0,
    "Maize": 2225.0,
    "Sugarcane": 340.0,  # Fair and Remunerative Price (FRP)
    "Cotton": 7121.0,
    "Cotton(lint)": 7121.0,
    "Gram": 5440.0,
    "Arhar/Tur": 7550.0,
    "Mustard": 5650.0,
    "Rapeseed &Mustard": 5650.0,
    "Soyabean": 4892.0,
    "Soybean": 4892.0,
    "Groundnut": 6783.0,
    "Bajra": 2625.0,
    "Jowar": 3371.0,
    "Ragi": 4290.0,
    "Barley": 1850.0,
    "Potato": 1200.0,  # Benchmark wholesale agricultural market reference
    "Onion": 1500.0,   # Benchmark wholesale agricultural market reference
    "Ginger": 4500.0,
    "Turmeric": 8500.0,
    "Jute": 5050.0,
    "Sunflower": 7280.0,
    "Urad": 7400.0,
    "Moong": 8682.0,
    "Moong(Green Gram)": 8682.0,
    "Lentil": 6425.0,
    "Masoor": 6425.0,
    "Sesamum": 9267.0,
    "Safflower": 5800.0,
    "Niger seed": 8717.0,
    "Castor seed": 5800.0,
    "Linseed": 5600.0,
    "Guar seed": 5200.0,
    "Horse-gram": 4800.0,
    "Moth": 7500.0,
    "Khesari": 4500.0,
    "Cowpea(Lobia)": 6200.0,
    "Small millets": 4200.0,
    "Peas & beans (Pulses)": 6200.0,
    "Banana": 1800.0,
    "Tapioca": 1100.0,
    "Sweet potato": 1400.0,
    "Dry chillies": 14000.0,
    "Garlic": 6500.0,
    "Coriander": 7200.0,
    "Mesta": 5000.0,
    "Tobacco": 15000.0,
    "Cashewnut": 9500.0,
    "Arecanut": 38000.0,
    "Black pepper": 52000.0,
    "Cardamom": 120000.0,
    "Sannhamp": 4500.0,
}

EXCLUDED_RECOMMENDATION_CROPS = {
    "Other  Rabi pulses",
    "Other Kharif pulses",
    "Other Summer Pulses",
    "Other Cereals",
    "Oilseeds total",
    "other oilseeds",
}

_dataset_df_cache: Optional[pd.DataFrame] = None


def _get_dataset_df() -> Optional[pd.DataFrame]:
    """Load and cache the cleaned crop yield dataset for regional candidate lookup."""
    global _dataset_df_cache
    if _dataset_df_cache is None and os.path.exists(settings.PROCESSED_DATA_PATH):
        _dataset_df_cache = pd.read_csv(settings.PROCESSED_DATA_PATH)
    return _dataset_df_cache

DEFAULT_MSP_FALLBACK = 2200.0  # INR per quintal default reference
AVG_FERTILIZER_PRICE_PER_KG = 14.5  # Composite subsidized Urea/DAP/NPK (INR/kg)
AVG_PESTICIDE_PRICE_PER_KG = 450.0  # Chemical plant protection agents (INR/kg)

def calculate_farm_economics(crop: str, area_ha: float, predicted_yield_t_ha: float, fertilizer_kg: float, pesticide_kg: float) -> Dict[str, Any]:
    """
    Calculate government MSP valuation, gross revenue, input chemical costs, and net farm return.
    """
    cleaned_crop = crop.strip()
    msp_per_quintal = MSP_RATES_INR_PER_QUINTAL.get(cleaned_crop, DEFAULT_MSP_FALLBACK)
    msp_per_tonne = msp_per_quintal * 10.0  # 1 tonne = 10 quintals
    
    total_production_tonnes = predicted_yield_t_ha * area_ha
    total_production_quintals = total_production_tonnes * 10.0
    
    gross_revenue_inr = total_production_quintals * msp_per_quintal
    
    fertilizer_cost_inr = fertilizer_kg * AVG_FERTILIZER_PRICE_PER_KG
    pesticide_cost_inr = pesticide_kg * AVG_PESTICIDE_PRICE_PER_KG
    total_chemical_cost_inr = fertilizer_cost_inr + pesticide_cost_inr
    
    estimated_net_return_inr = max(0.0, gross_revenue_inr - total_chemical_cost_inr)
    
    return {
        "crop": cleaned_crop,
        "area_hectares": area_ha,
        "predicted_yield_t_ha": round(predicted_yield_t_ha, 2),
        "total_production_tonnes": round(total_production_tonnes, 2),
        "total_production_quintals": round(total_production_quintals, 2),
        "msp_rate_per_quintal_inr": msp_per_quintal,
        "msp_per_quintal_inr": msp_per_quintal,
        "msp_rate_per_tonne_inr": msp_per_tonne,
        "gross_revenue_inr": round(gross_revenue_inr, 2),
        "gross_revenue_lakhs": round(gross_revenue_inr / 100000.0, 2),
        "fertilizer_cost_inr": round(fertilizer_cost_inr, 2),
        "pesticide_cost_inr": round(pesticide_cost_inr, 2),
        "total_input_chemical_cost_inr": round(total_chemical_cost_inr, 2),
        "total_chemical_cost_inr": round(total_chemical_cost_inr, 2),
        "estimated_net_return_inr": round(estimated_net_return_inr, 2),
        "net_farm_return_inr": round(estimated_net_return_inr, 2),
        "estimated_net_return_lakhs": round(estimated_net_return_inr / 100000.0, 2),
        "profit_margin_percent": round(((estimated_net_return_inr / gross_revenue_inr) * 100.0) if gross_revenue_inr > 0 else 0.0, 1),
        "profit_margin_pct": round(((estimated_net_return_inr / gross_revenue_inr) * 100.0) if gross_revenue_inr > 0 else 0.0, 1),
        "pricing_source": "Government of India CACP / MSP 2024–25 Gazette"
    }

def run_what_if_simulation(
    crop: str,
    state: str,
    season: str,
    area_ha: float,
    base_rainfall: float,
    base_fertilizer_kg: float,
    base_pesticide_kg: float,
    crop_year: int = 2024
) -> Dict[str, Any]:
    """
    Run vectorized multi-scenario simulation across rainfall shocks and fertilizer densities.
    """
    engine = PredictionEngine.get_instance()
    if engine.pipeline is None:
        engine.load_model()
    
    # 1. Rainfall Sensitivity Grid (-40% to +40% in 10% steps)
    rainfall_factors = [-40, -30, -20, -10, 0, 10, 20, 30, 40]
    rainfall_scenarios = []
    
    fert_per_ha = base_fertilizer_kg / area_ha if area_ha > 0 else 100.0
    pest_per_ha = base_pesticide_kg / area_ha if area_ha > 0 else 2.5

    for rf_pct in rainfall_factors:
        simulated_rainfall = max(50.0, base_rainfall * (1.0 + rf_pct / 100.0))
        df_row = pd.DataFrame([{
            'Crop': crop,
            'Season': season,
            'State': state,
            'Area': area_ha,
            'Annual_Rainfall': simulated_rainfall,
            'Fertilizer_per_Ha': fert_per_ha,
            'Pesticide_per_Ha': pest_per_ha,
            'Crop_Year': crop_year
        }])
        pred_y = round(max(0.01, float(engine.pipeline.predict(df_row)[0])), 2)
        econ = calculate_farm_economics(crop, area_ha, pred_y, base_fertilizer_kg, base_pesticide_kg)
        rainfall_scenarios.append({
            "scenario": f"{rf_pct:+d}% Rain",
            "rainfall_mm": round(simulated_rainfall, 1),
            "predicted_yield_t_ha": pred_y,
            "gross_revenue_inr": econ["gross_revenue_inr"],
            "total_chemical_cost_inr": econ["total_chemical_cost_inr"],
            "net_farm_return_inr": econ["net_farm_return_inr"],
            "net_farm_return_lakhs": econ["estimated_net_return_lakhs"],
        })

    # 2. Fertilizer Intensity Grid (50 kg/ha to 250 kg/ha in 25 kg/ha steps)
    fertilizer_steps = [50, 75, 100, 125, 150, 175, 200, 225, 250]
    fertilizer_scenarios = []
    for f_step in fertilizer_steps:
        df_row = pd.DataFrame([{
            'Crop': crop,
            'Season': season,
            'State': state,
            'Area': area_ha,
            'Annual_Rainfall': base_rainfall,
            'Fertilizer_per_Ha': float(f_step),
            'Pesticide_per_Ha': pest_per_ha,
            'Crop_Year': crop_year
        }])
        pred_y = round(max(0.01, float(engine.pipeline.predict(df_row)[0])), 2)
        total_fert_kg = float(f_step) * area_ha
        econ = calculate_farm_economics(crop, area_ha, pred_y, total_fert_kg, base_pesticide_kg)
        fertilizer_scenarios.append({
            "fertilizer_intensity_kg_ha": f_step,
            "predicted_yield_t_ha": pred_y,
            "gross_revenue_inr": econ["gross_revenue_inr"],
            "total_chemical_cost_inr": econ["total_chemical_cost_inr"],
            "net_farm_return_inr": econ["net_farm_return_inr"],
            "net_farm_return_lakhs": econ["estimated_net_return_lakhs"],
        })

    base_yield = rainfall_scenarios[4]["predicted_yield_t_ha"]  # at 0% change
    base_economics = calculate_farm_economics(crop, area_ha, base_yield, base_fertilizer_kg, base_pesticide_kg)

    return {
        "crop": crop,
        "state": state,
        "season": season,
        "base_yield_t_ha": base_yield,
        "base_economics": base_economics,
        "rainfall_sensitivity_curve": rainfall_scenarios,
        "fertilizer_sensitivity_curve": fertilizer_scenarios
    }


def recommend_top_crops(
    state: str,
    season: str,
    area_ha: float,
    annual_rainfall: float,
    fertilizer_kg: float,
    pesticide_kg: float,
    crop_year: int = 2024,
    top_n: int = 5
) -> Dict[str, Any]:
    """
    Evaluate major regionally suitable crops in a single vectorized ML inference pass,
    rank Top-N crops by estimated net MSP return, and compare Best Profit vs Best Yield.
    """
    engine = PredictionEngine.get_instance()
    if engine.pipeline is None:
        engine.load_model()

    cleaned_state = state.strip()
    cleaned_season = season.strip()
    df = _get_dataset_df()

    regional_crops: List[str] = []
    seasonal_fallback_crops: List[str] = []

    if df is not None and not df.empty:
        regional_mask = (df["State"] == cleaned_state) & (df["Season"] == cleaned_season)
        reg_counts = df.loc[regional_mask, "Crop"].value_counts()
        regional_crops = [
            c for c in reg_counts.index.tolist()
            if c not in EXCLUDED_RECOMMENDATION_CROPS
        ]

        if len(regional_crops) < top_n:
            season_counts = df.loc[df["Season"] == cleaned_season, "Crop"].value_counts()
            seasonal_fallback_crops = [
                c for c in season_counts.index.tolist()
                if c not in EXCLUDED_RECOMMENDATION_CROPS and c not in regional_crops
            ]

    candidate_records: List[Dict[str, str]] = []
    for c in regional_crops:
        candidate_records.append({"crop": c, "suitability": "Regional + Seasonal Match"})

    # Pad up to 10 candidates only if regional matches are sparse for that season
    if len(candidate_records) < top_n:
        needed = max(top_n, 8) - len(candidate_records)
        for c in seasonal_fallback_crops[:needed]:
            candidate_records.append({"crop": c, "suitability": "Seasonal National Match"})

    if not candidate_records:
        # Defensive fallback if dataset file is absent
        fallback_list = ["Rice", "Wheat", "Maize", "Sugarcane", "Cotton(lint)", "Groundnut", "Potato", "Onion", "Gram", "Rapeseed &Mustard"]
        candidate_records = [{"crop": c, "suitability": "General Benchmark"} for c in fallback_list]

    fert_per_ha = fertilizer_kg / area_ha if area_ha > 0 else 100.0
    pest_per_ha = pesticide_kg / area_ha if area_ha > 0 else 2.5

    batch_df = pd.DataFrame([
        {
            "Crop": rec["crop"],
            "Season": cleaned_season,
            "State": cleaned_state,
            "Area": float(area_ha),
            "Annual_Rainfall": float(annual_rainfall),
            "Fertilizer_per_Ha": float(fert_per_ha),
            "Pesticide_per_Ha": float(pest_per_ha),
            "Crop_Year": int(crop_year),
        }
        for rec in candidate_records
    ])

    predicted_yields = engine.pipeline.predict(batch_df)

    evaluated: List[Dict[str, Any]] = []
    for rec, raw_y in zip(candidate_records, predicted_yields):
        pred_y = round(max(0.01, float(raw_y)), 2)
        econ = calculate_farm_economics(rec["crop"], area_ha, pred_y, fertilizer_kg, pesticide_kg)
        evaluated.append({
            "crop": rec["crop"],
            "suitability": rec["suitability"],
            "predicted_yield_t_ha": pred_y,
            "total_production_tonnes": econ["total_production_tonnes"],
            "msp_rate_per_quintal_inr": econ["msp_rate_per_quintal_inr"],
            "gross_revenue_inr": econ["gross_revenue_inr"],
            "total_chemical_cost_inr": econ["total_chemical_cost_inr"],
            "estimated_net_return_inr": econ["estimated_net_return_inr"],
            "estimated_net_return_lakhs": econ["estimated_net_return_lakhs"],
            "profit_margin_percent": econ["profit_margin_percent"],
        })

    by_profit = sorted(evaluated, key=lambda x: x["estimated_net_return_inr"], reverse=True)
    by_yield = sorted(evaluated, key=lambda x: x["predicted_yield_t_ha"], reverse=True)

    top_recommendations = []
    for idx, item in enumerate(by_profit[:top_n], start=1):
        entry = dict(item)
        entry["rank"] = idx
        top_recommendations.append(entry)

    best_profit_crop = by_profit[0]
    best_yield_crop = by_yield[0]

    # Ensure comparison chart includes top profitable crops AND Best Yield Crop
    comparison_chart = [dict(item) for item in top_recommendations]
    if not any(item["crop"] == best_yield_crop["crop"] for item in comparison_chart):
        comparison_chart.append(dict(best_yield_crop))

    return {
        "state": cleaned_state,
        "season": cleaned_season,
        "area_hectares": round(float(area_ha), 2),
        "annual_rainfall_mm": round(float(annual_rainfall), 1),
        "fertilizer_kg": round(float(fertilizer_kg), 1),
        "pesticide_kg": round(float(pesticide_kg), 1),
        "evaluated_crops_count": len(evaluated),
        "best_profit_crop": best_profit_crop,
        "best_yield_crop": best_yield_crop,
        "is_same_winner": best_profit_crop["crop"] == best_yield_crop["crop"],
        "recommendations": top_recommendations,
        "comparison_chart": comparison_chart,
        "pricing_source": "Government of India CACP / MSP 2024–25 Gazette & Market Benchmarks",
    }
