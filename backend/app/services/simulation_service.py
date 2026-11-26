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

COMMERCIAL_HORTI_CROPS = {
    "Sugarcane", "Cotton", "Cotton(lint)", "Potato", "Onion", "Banana",
    "Tapioca", "Sweet potato", "Ginger", "Turmeric", "Dry chillies", "Garlic",
    "Jute", "Mesta", "Tobacco", "Arecanut", "Black pepper", "Cardamom", "Cashewnut",
}

SCALE_OF_FINANCE_PER_HA_INR: Dict[str, float] = {
    "Sugarcane": 135000.0,
    "Potato": 125000.0,
    "Onion": 110000.0,
    "Banana": 145000.0,
    "Ginger": 130000.0,
    "Turmeric": 120000.0,
    "Dry chillies": 115000.0,
    "Garlic": 115000.0,
    "Cotton": 88000.0,
    "Cotton(lint)": 88000.0,
    "Rice": 72000.0,
    "Paddy": 72000.0,
    "Wheat": 68000.0,
    "Maize": 56000.0,
    "Groundnut": 64000.0,
    "Soyabean": 52000.0,
    "Soybean": 52000.0,
    "Rapeseed &Mustard": 52000.0,
    "Mustard": 52000.0,
}


def calculate_pmfby_and_kcc(crop: str, area_ha: float, season: str = "Kharif") -> Dict[str, Any]:
    """
    Calculate PMFBY Crop Insurance Sum Insured & Farmer Premium Cap
    (Kharif 2%, Rabi 1.5%, Commercial/Horticultural 5%) plus KCC Crop Loan eligibility.
    """
    cleaned_crop = crop.strip()
    cleaned_season = season.strip().lower()
    safe_area = max(0.01, float(area_ha))

    if cleaned_crop in COMMERCIAL_HORTI_CROPS:
        farmer_premium_pct = 5.0
        pmfby_tier = "Commercial / Horticultural (5% Cap)"
    elif cleaned_season == "rabi":
        farmer_premium_pct = 1.5
        pmfby_tier = "Rabi Food & Oilseeds (1.5% Cap)"
    else:
        farmer_premium_pct = 2.0
        pmfby_tier = "Kharif / Seasonal Food & Oilseeds (2.0% Cap)"

    scale_per_ha = SCALE_OF_FINANCE_PER_HA_INR.get(cleaned_crop, 50000.0)
    sum_insured_inr = round(scale_per_ha * safe_area, 2)
    farmer_premium_inr = round(sum_insured_inr * (farmer_premium_pct / 100.0), 2)

    # KCC norm: Scale of Finance + 10% post-harvest/consumption allowance
    kcc_limit_inr = round(sum_insured_inr * 1.10, 2)
    prompt_cap_inr = 300000.0
    subvented_principal = min(kcc_limit_inr, prompt_cap_inr)
    excess_principal = max(0.0, kcc_limit_inr - prompt_cap_inr)
    estimated_annual_interest_inr = round((subvented_principal * 0.04) + (excess_principal * 0.07), 2)

    return {
        "pmfby_tier": pmfby_tier,
        "farmer_premium_pct": farmer_premium_pct,
        "scale_of_finance_per_ha_inr": scale_per_ha,
        "sum_insured_inr": sum_insured_inr,
        "farmer_premium_inr": farmer_premium_inr,
        "kcc_eligible_limit_inr": kcc_limit_inr,
        "collateral_free_limit_inr": 160000.0,
        "effective_interest_rate_pct": 4.0,
        "prompt_repay_cap_inr": prompt_cap_inr,
        "estimated_1yr_interest_inr": estimated_annual_interest_inr,
    }


def calculate_farm_economics(
    crop: str,
    area_ha: float,
    predicted_yield_t_ha: float,
    fertilizer_kg: float,
    pesticide_kg: float,
    mandi_rate_inr: Optional[float] = None,
    season: str = "Kharif"
) -> Dict[str, Any]:
    """
    Calculate government MSP or custom local Mandi valuation, gross revenue, input chemical costs,
    net farm return, PMFBY crop insurance premium, and KCC crop loan eligibility.
    """
    cleaned_crop = crop.strip()
    msp_per_quintal = MSP_RATES_INR_PER_QUINTAL.get(cleaned_crop, DEFAULT_MSP_FALLBACK)
    has_custom_mandi = mandi_rate_inr is not None and float(mandi_rate_inr) > 0
    applied_per_quintal = float(mandi_rate_inr) if has_custom_mandi else msp_per_quintal
    applied_per_tonne = applied_per_quintal * 10.0  # 1 tonne = 10 quintals

    total_production_tonnes = predicted_yield_t_ha * area_ha
    total_production_quintals = total_production_tonnes * 10.0

    msp_gross_revenue_inr = total_production_quintals * msp_per_quintal
    gross_revenue_inr = total_production_quintals * applied_per_quintal

    fertilizer_cost_inr = fertilizer_kg * AVG_FERTILIZER_PRICE_PER_KG
    pesticide_cost_inr = pesticide_kg * AVG_PESTICIDE_PRICE_PER_KG
    total_chemical_cost_inr = fertilizer_cost_inr + pesticide_cost_inr

    estimated_net_return_inr = max(0.0, gross_revenue_inr - total_chemical_cost_inr)
    msp_net_return_inr = max(0.0, msp_gross_revenue_inr - total_chemical_cost_inr)
    mandi_vs_msp_diff_inr = round(gross_revenue_inr - msp_gross_revenue_inr, 2)
    mandi_vs_msp_pct = round(((applied_per_quintal - msp_per_quintal) / msp_per_quintal) * 100.0, 1) if msp_per_quintal > 0 else 0.0

    insurance_and_kcc = calculate_pmfby_and_kcc(cleaned_crop, area_ha, season=season)

    return {
        "crop": cleaned_crop,
        "season": season,
        "area_hectares": area_ha,
        "predicted_yield_t_ha": round(predicted_yield_t_ha, 2),
        "total_production_tonnes": round(total_production_tonnes, 2),
        "total_production_quintals": round(total_production_quintals, 2),
        "price_mode": "LOCAL_MANDI" if has_custom_mandi else "MSP",
        "msp_rate_per_quintal_inr": msp_per_quintal,
        "msp_per_quintal_inr": msp_per_quintal,
        "applied_rate_per_quintal_inr": round(applied_per_quintal, 2),
        "msp_rate_per_tonne_inr": applied_per_tonne,
        "gross_revenue_inr": round(gross_revenue_inr, 2),
        "gross_revenue_lakhs": round(gross_revenue_inr / 100000.0, 2),
        "fertilizer_cost_inr": round(fertilizer_cost_inr, 2),
        "pesticide_cost_inr": round(pesticide_cost_inr, 2),
        "total_input_chemical_cost_inr": round(total_chemical_cost_inr, 2),
        "total_chemical_cost_inr": round(total_chemical_cost_inr, 2),
        "estimated_net_return_inr": round(estimated_net_return_inr, 2),
        "net_farm_return_inr": round(estimated_net_return_inr, 2),
        "estimated_net_return_lakhs": round(estimated_net_return_inr / 100000.0, 2),
        "msp_net_return_inr": round(msp_net_return_inr, 2),
        "mandi_vs_msp_diff_inr": mandi_vs_msp_diff_inr,
        "mandi_vs_msp_pct": mandi_vs_msp_pct,
        "profit_margin_percent": round(((estimated_net_return_inr / gross_revenue_inr) * 100.0) if gross_revenue_inr > 0 else 0.0, 1),
        "profit_margin_pct": round(((estimated_net_return_inr / gross_revenue_inr) * 100.0) if gross_revenue_inr > 0 else 0.0, 1),
        "pmfby_insurance": {
            "tier": insurance_and_kcc["pmfby_tier"],
            "farmer_premium_pct": insurance_and_kcc["farmer_premium_pct"],
            "scale_of_finance_per_ha_inr": insurance_and_kcc["scale_of_finance_per_ha_inr"],
            "sum_insured_inr": insurance_and_kcc["sum_insured_inr"],
            "farmer_premium_inr": insurance_and_kcc["farmer_premium_inr"],
        },
        "kcc_eligibility": {
            "eligible_limit_inr": insurance_and_kcc["kcc_eligible_limit_inr"],
            "collateral_free_limit_inr": insurance_and_kcc["collateral_free_limit_inr"],
            "effective_interest_rate_pct": insurance_and_kcc["effective_interest_rate_pct"],
            "prompt_repay_cap_inr": insurance_and_kcc["prompt_repay_cap_inr"],
            "estimated_1yr_interest_inr": insurance_and_kcc["estimated_1yr_interest_inr"],
        },
        "pricing_source": (
            "Local Mandi Market Rate (Compared against CACP MSP)"
            if has_custom_mandi
            else "Government of India CACP / MSP 2024–25 Gazette"
        )
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
