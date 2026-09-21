"""
Agronomic What-If Simulation & MSP Farm Economics Engine
AI-Based Crop Yield Prediction System
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List
from backend.app.services.prediction_service import PredictionEngine

# Official Government of India Minimum Support Prices (MSP 2024-25 in INR per Quintal)
# 1 Metric Tonne = 10 Quintals
MSP_RATES_INR_PER_QUINTAL: Dict[str, float] = {
    "Paddy": 2300.0,
    "Rice": 2300.0,
    "Wheat": 2275.0,
    "Maize": 2225.0,
    "Sugarcane": 340.0,  # Fair and Remunerative Price (FRP)
    "Cotton": 7121.0,
    "Gram": 5440.0,
    "Arhar/Tur": 7550.0,
    "Mustard": 5650.0,
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
    "Lentil": 6425.0
}

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
        pred_y = float(engine.pipeline.predict(df_row)[0])
        rainfall_scenarios.append({
            "scenario": f"{rf_pct:+d}% Rain",
            "rainfall_mm": round(simulated_rainfall, 1),
            "predicted_yield_t_ha": round(max(0.01, pred_y), 2)
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
        pred_y = float(engine.pipeline.predict(df_row)[0])
        fertilizer_scenarios.append({
            "fertilizer_intensity_kg_ha": f_step,
            "predicted_yield_t_ha": round(max(0.01, pred_y), 2)
        })

    return {
        "crop": crop,
        "state": state,
        "season": season,
        "base_yield_t_ha": rainfall_scenarios[4]["predicted_yield_t_ha"],  # at 0% change
        "rainfall_sensitivity_curve": rainfall_scenarios,
        "fertilizer_sensitivity_curve": fertilizer_scenarios
    }
