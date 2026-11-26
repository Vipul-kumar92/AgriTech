"""
Analytics, Dataset Insights & Feature Importance REST Endpoints
AI-Based Crop Yield Prediction System
"""

import os
import json
from typing import Dict, Any, List, Optional
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends, Query
from backend.app.config import settings
from backend.app.database import get_database
from backend.app.auth.jwt_handler import get_optional_user

router = APIRouter(tags=["Analytics & Insights"])

# Cached summary of processed dataset & dataframe
_dataset_cache: Dict[str, Any] = {}
_df_cache: Optional[pd.DataFrame] = None


def _load_processed_df() -> Optional[pd.DataFrame]:
    global _df_cache
    if _df_cache is None and os.path.exists(settings.PROCESSED_DATA_PATH):
        _df_cache = pd.read_csv(settings.PROCESSED_DATA_PATH)
    return _df_cache


def _compute_df_analytics(df: pd.DataFrame) -> Dict[str, Any]:
    if df.empty:
        return {
            "total_records": 0,
            "total_crops": 0,
            "total_states": 0,
            "total_seasons": 0,
            "average_yield": 0.0,
            "median_yield": 0.0,
            "min_yield": 0.0,
            "max_yield": 0.0,
            "average_rainfall": 0.0,
            "top_crops": [],
            "top_yield_crops": [],
            "seasons_stats": [],
            "top_states": [],
            "rainfall_yield_trends": [],
            "fertilizer_yield_trends": [],
            "yearly_trends": [],
        }

    # Crop statistics (both by record volume and by mean yield)
    crop_stats = df.groupby('Crop')['Yield'].agg(['mean', 'count']).reset_index()
    top_crops = crop_stats.sort_values('count', ascending=False).head(15)
    top_crops_list = [
        {"crop": r['Crop'], "average_yield": round(float(r['mean']), 2), "record_count": int(r['count'])}
        for _, r in top_crops.iterrows()
    ]

    top_yield_crops = crop_stats[crop_stats['count'] >= 5].sort_values('mean', ascending=False).head(15)
    if top_yield_crops.empty:
        top_yield_crops = crop_stats.sort_values('mean', ascending=False).head(15)
    top_yield_crops_list = [
        {"crop": r['Crop'], "average_yield": round(float(r['mean']), 2), "record_count": int(r['count'])}
        for _, r in top_yield_crops.iterrows()
    ]

    # Season statistics
    season_stats = df.groupby('Season')['Yield'].agg(['mean', 'count']).reset_index()
    season_list = [
        {"season": r['Season'], "average_yield": round(float(r['mean']), 2), "record_count": int(r['count'])}
        for _, r in season_stats.iterrows()
    ]

    # State statistics
    state_stats = df.groupby('State')['Yield'].agg(['mean', 'count']).reset_index()
    top_states = state_stats.sort_values('mean', ascending=False).head(15)
    top_states_list = [
        {"state": r['State'], "average_yield": round(float(r['mean']), 2), "record_count": int(r['count'])}
        for _, r in top_states.iterrows()
    ]

    # Rainfall brackets vs yield
    rain_bins = pd.cut(
        df['Annual_Rainfall'],
        bins=[0, 800, 1500, 2500, 10000],
        labels=['Low (<800mm)', 'Moderate (800-1500mm)', 'High (1500-2500mm)', 'Very High (>2500mm)']
    )
    rain_yield = df.assign(Rainfall_Bin=rain_bins).groupby('Rainfall_Bin', observed=False)['Yield'].agg(['mean', 'count']).reset_index()
    rain_yield_list = [
        {
            "rainfall_bracket": str(r['Rainfall_Bin']),
            "average_yield": round(float(r['mean']), 2) if pd.notna(r['mean']) else 0.0,
            "record_count": int(r['count']),
        }
        for _, r in rain_yield.iterrows()
    ]

    # Fertilizer intensity brackets vs yield
    fert_bins = pd.cut(
        df['Fertilizer_per_Ha'],
        bins=[-0.01, 50, 100, 150, 200, 100000],
        labels=['<50 kg/ha', '50-100 kg/ha', '100-150 kg/ha', '150-200 kg/ha', '>200 kg/ha']
    )
    fert_yield = df.assign(Fert_Bin=fert_bins).groupby('Fert_Bin', observed=False)['Yield'].agg(['mean', 'count']).reset_index()
    fert_yield_list = [
        {
            "fertilizer_bracket": str(r['Fert_Bin']),
            "average_yield": round(float(r['mean']), 2) if pd.notna(r['mean']) else 0.0,
            "record_count": int(r['count']),
        }
        for _, r in fert_yield.iterrows()
    ]

    # 24-Year Historical Trajectory (1997-2020)
    yearly_df = (
        df.groupby('Crop_Year')
        .agg(avg_yield=('Yield', 'mean'), avg_rainfall=('Annual_Rainfall', 'mean'), records=('Yield', 'count'))
        .reset_index()
        .sort_values('Crop_Year')
    )
    yearly_trends = [
        {
            "year": int(r['Crop_Year']),
            "average_yield": round(float(r['avg_yield']), 2),
            "average_rainfall_mm": round(float(r['avg_rainfall']), 1),
            "records": int(r['records']),
        }
        for _, r in yearly_df.iterrows()
    ]

    return {
        "total_records": len(df),
        "total_crops": int(df['Crop'].nunique()),
        "total_states": int(df['State'].nunique()),
        "total_seasons": int(df['Season'].nunique()),
        "average_yield": round(float(df['Yield'].mean()), 2),
        "median_yield": round(float(df['Yield'].median()), 2),
        "min_yield": round(float(df['Yield'].min()), 4),
        "max_yield": round(float(df['Yield'].max()), 2),
        "average_rainfall": round(float(df['Annual_Rainfall'].mean()), 1),
        "top_crops": top_crops_list,
        "top_yield_crops": top_yield_crops_list,
        "seasons_stats": season_list,
        "top_states": top_states_list,
        "rainfall_yield_trends": rain_yield_list,
        "fertilizer_yield_trends": fert_yield_list,
        "yearly_trends": yearly_trends,
    }


def get_cached_dataset_stats() -> Dict[str, Any]:
    global _dataset_cache
    if not _dataset_cache:
        df = _load_processed_df()
        if df is not None:
            computed = _compute_df_analytics(df)
            _dataset_cache = {
                **computed,
                "crops": sorted(df['Crop'].unique().tolist()),
                "states": sorted(df['State'].unique().tolist()),
                "seasons": sorted(df['Season'].unique().tolist()),
            }
    return _dataset_cache


@router.get("/analytics", response_model=Dict[str, Any])
async def get_analytics_overview(
    state: Optional[str] = Query(None, description="Optional filter by Indian state"),
    season: Optional[str] = Query(None, description="Optional filter by cropping season"),
):
    """Retrieve high-level agricultural analytics, temporal trajectories, and filtered dataset metrics."""
    db = get_database()
    full_stats = get_cached_dataset_stats()

    # Apply optional state/season filters cleanly on the authentic dataset
    if state or season:
        df = _load_processed_df()
        if df is not None:
            filtered = df
            if state:
                filtered = filtered[filtered['State'] == state.strip()]
            if season:
                filtered = filtered[filtered['Season'].str.strip() == season.strip()]
            ds_stats = _compute_df_analytics(filtered)

            # Keep state comparison populated across states (filtered only by season) so the regional chart stays comparative
            if state:
                season_df = df[df['Season'].str.strip() == season.strip()] if season else df
                state_stats = season_df.groupby('State')['Yield'].agg(['mean', 'count']).reset_index().sort_values('mean', ascending=False)
                top_states_df = state_stats.head(15)
                if state.strip() not in top_states_df['State'].values:
                    sel_row = state_stats[state_stats['State'] == state.strip()]
                    top_states_df = pd.concat([top_states_df.head(14), sel_row], ignore_index=True)
                ds_stats["top_states"] = [
                    {"state": r['State'], "average_yield": round(float(r['mean']), 2), "record_count": int(r['count'])}
                    for _, r in top_states_df.iterrows()
                ]
        else:
            ds_stats = full_stats
    else:
        ds_stats = full_stats

    total_preds = await db.predictions.count_documents({})
    
    # Calculate average predicted yield from MongoDB
    avg_pred_pipeline = [
        {"$group": {"_id": None, "avg_yield": {"$avg": "$predicted_yield"}}}
    ]
    cursor = db.predictions.aggregate(avg_pred_pipeline)
    avg_pred_res = await cursor.to_list(length=1)
    avg_predicted_yield = round(avg_pred_res[0]["avg_yield"], 2) if avg_pred_res else ds_stats.get("average_yield", 4.12)

    # Most predicted crop
    crop_pipeline = [
        {"$group": {"_id": "$input_features.crop", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    cursor_crop = db.predictions.aggregate(crop_pipeline)
    top_crop_res = await cursor_crop.to_list(length=1)
    most_predicted_crop = top_crop_res[0]["_id"] if top_crop_res else "Rice"

    # Active model metadata
    model_r2 = 0.8147
    active_model_name = "Random Forest Regressor (Optimized)"
    if os.path.exists(settings.METADATA_PATH):
        with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
            meta = json.load(f)
            model_r2 = meta.get("metrics", {}).get("r2", 0.8147)
            active_model_name = meta.get("model_name", active_model_name)

    return {
        "kpi": {
            "total_predictions": total_preds,
            "average_predicted_yield": avg_predicted_yield,
            "most_predicted_crop": most_predicted_crop,
            "active_model": active_model_name,
            "model_r2": model_r2,
            "dataset_records": ds_stats.get("total_records", 19407),
            "total_crops": ds_stats.get("total_crops", 54),
            "total_states": ds_stats.get("total_states", 30),
            "average_yield": ds_stats.get("average_yield", 0.0),
            "median_yield": ds_stats.get("median_yield", 0.0),
            "average_rainfall_mm": ds_stats.get("average_rainfall", 0.0),
        },
        "filters": {
            "states": full_stats.get("states", []),
            "seasons": full_stats.get("seasons", []),
            "applied_state": state or "",
            "applied_season": season or "",
        },
        "crop_distribution": ds_stats.get("top_crops", []),
        "top_yield_crops": ds_stats.get("top_yield_crops", []),
        "seasonal_distribution": ds_stats.get("seasons_stats", []),
        "state_productivity": ds_stats.get("top_states", []),
        "rainfall_trends": ds_stats.get("rainfall_yield_trends", []),
        "fertilizer_trends": ds_stats.get("fertilizer_yield_trends", []),
        "yearly_trends": ds_stats.get("yearly_trends", []),
    }

@router.get("/dataset/stats", response_model=Dict[str, Any])
async def get_dataset_statistics():
    """Retrieve full statistical provenance, distributions, and feature boundaries."""
    return get_cached_dataset_stats()

@router.get("/feature-importance", response_model=Dict[str, Any])
async def get_feature_importance():
    """Retrieve model feature influence ranking and explainability context."""
    if os.path.exists(settings.METADATA_PATH):
        with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
            meta = json.load(f)
            feat_imp = meta.get("feature_importance_percent", {})
            model_name = meta.get("model_name", "Random Forest Regressor (Optimized)")
    else:
        feat_imp = {
            "Crop": 66.77, "State": 14.83, "Area": 8.84, "Annual_Rainfall": 4.10,
            "Pesticide_per_Ha": 1.61, "Crop_Year": 1.58, "Fertilizer_per_Ha": 1.25, "Season": 1.00
        }
        model_name = "Random Forest Regressor (Optimized)"

    ranked_features = [{"feature": k, "influence_percent": v} for k, v in feat_imp.items()]

    return {
        "model_name": model_name,
        "features": ranked_features,
        "academic_note": "Feature importance reflects Gini impurity reduction across decision trees. It quantifies statistical model dependence and predictive weight, but does NOT establish agronomic physiological causality."
    }

# ==============================================================================
# NEXT-LEVEL ADVANCED ENDPOINTS: Weather, Economics, Simulation, and Map
# ==============================================================================

from backend.app.services.weather_service import fetch_live_weather, resolve_nearest_state, STATE_COORDINATES
from backend.app.services.simulation_service import (
    calculate_farm_economics,
    run_what_if_simulation,
    recommend_top_crops,
    MSP_RATES_INR_PER_QUINTAL,
)
from pydantic import BaseModel, Field

class SimulationRequest(BaseModel):
    crop: str = Field(default="Wheat")
    state: str = Field(default="Punjab")
    season: str = Field(default="Rabi")
    area: float = Field(default=50.0, gt=0)
    annual_rainfall: float = Field(default=700.0, ge=0)
    fertilizer: float = Field(default=7000.0, ge=0)
    pesticide: float = Field(default=150.0, ge=0)
    crop_year: int = Field(default=2024)


class CropRecommendationRequest(BaseModel):
    state: str = Field(default="Punjab", min_length=2)
    season: str = Field(default="Kharif", min_length=3)
    area: float = Field(default=50.0, gt=0)
    annual_rainfall: float = Field(default=650.0, ge=0)
    fertilizer: float = Field(default=7500.0, ge=0)
    pesticide: float = Field(default=175.0, ge=0)
    crop_year: int = Field(default=2024, ge=1990, le=2035)
    top_n: int = Field(default=5, ge=1, le=10)

@router.get("/weather/live", response_model=Dict[str, Any])
async def get_live_weather(
    state: Optional[str] = Query(None, description="Indian state name"),
    lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="GPS latitude"),
    lon: Optional[float] = Query(None, ge=-180.0, le=180.0, description="GPS longitude")
):
    """Retrieve real-time Open-Meteo weather, 7-day forecast, and spray advisory."""
    return fetch_live_weather(state=state, lat=lat, lon=lon)


@router.get("/weather/locate", response_model=Dict[str, Any])
async def locate_nearest_indian_state(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0)
):
    """Resolve GPS coordinates to the nearest Indian state and IMD rainfall benchmark."""
    nearest_state, geo, dist_km = resolve_nearest_state(lat, lon)
    return {
        "state": nearest_state,
        "distance_km": dist_km,
        "latitude": lat,
        "longitude": lon,
        "annual_rainfall_benchmark_mm": geo["rainfall"],
    }

@router.get("/economics/msp", response_model=Dict[str, Any])
async def get_crop_economics(
    crop: str,
    area: float,
    predicted_yield: float,
    fertilizer: float = 0.0,
    pesticide: float = 0.0,
    fertilizer_kg: float = 0.0,
    pesticide_kg: float = 0.0
):
    """Calculate farm revenue based on Government MSP and chemical input costs."""
    actual_fert = fertilizer_kg if fertilizer_kg > 0 else fertilizer
    actual_pest = pesticide_kg if pesticide_kg > 0 else pesticide
    return calculate_farm_economics(crop, area, predicted_yield, actual_fert, actual_pest)

@router.post("/simulate", response_model=Dict[str, Any])
async def simulate_what_if_scenarios(req: SimulationRequest):
    """Execute real-time What-If scenario simulations across rainfall and fertilizer grids."""
    return run_what_if_simulation(
        crop=req.crop,
        state=req.state,
        season=req.season,
        area_ha=req.area,
        base_rainfall=req.annual_rainfall,
        base_fertilizer_kg=req.fertilizer,
        base_pesticide_kg=req.pesticide,
        crop_year=req.crop_year
    )


@router.post("/recommend-crops", response_model=Dict[str, Any])
async def recommend_top_profitable_crops(req: CropRecommendationRequest):
    """Evaluate regional/seasonal candidate crops and rank Top-N by net MSP profit and yield."""
    return recommend_top_crops(
        state=req.state,
        season=req.season,
        area_ha=req.area,
        annual_rainfall=req.annual_rainfall,
        fertilizer_kg=req.fertilizer,
        pesticide_kg=req.pesticide,
        crop_year=req.crop_year,
        top_n=req.top_n,
    )

@router.get("/map/states", response_model=List[Dict[str, Any]])
async def get_map_states_data():
    """Retrieve regional agricultural metrics and coordinates for India Map visualization."""
    ds = get_cached_dataset_stats()
    df = pd.read_csv(settings.PROCESSED_DATA_PATH)
    
    state_metrics = []
    grouped = df.groupby('State')
    
    for state_name, group in grouped:
        avg_y = round(float(group['Yield'].mean()), 2)
        top_crop = group['Crop'].value_counts().index[0]
        avg_rain = round(float(group['Annual_Rainfall'].mean()), 1)
        geo = STATE_COORDINATES.get(state_name, {"lat": 20.5937, "lon": 78.9629})
        
        # Categorize productivity tier
        if avg_y >= 6.0:
            tier = "High Productivity Zone (>6 t/ha)"
            color = "#059669"
        elif avg_y >= 2.5:
            tier = "Moderate Productivity Zone (2.5-6 t/ha)"
            color = "#0284c7"
        else:
            tier = "Rainfed / Lower Biomass Zone (<2.5 t/ha)"
            color = "#d97706"
            
        state_metrics.append({
            "state": state_name,
            "average_yield": avg_y,
            "top_crop": top_crop,
            "average_rainfall_mm": avg_rain,
            "records_count": len(group),
            "tier": tier,
            "color": color,
            "latitude": geo["lat"],
            "longitude": geo["lon"]
        })
        
    return sorted(state_metrics, key=lambda x: x["average_yield"], reverse=True)

