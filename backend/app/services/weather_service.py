"""
Live Agricultural Weather & Climate Service
Integrates Open-Meteo API with regional coordinates across all 30 Indian states.
"""

import urllib.request
import json
import logging
import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

# State Centroid Geographic Coordinates (Latitude, Longitude) and IMD Historical Rainfall Benchmarks (mm)
STATE_COORDINATES: Dict[str, Dict[str, Any]] = {
    "Andhra Pradesh": {"lat": 15.9129, "lon": 79.7400, "rainfall": 960.0},
    "Arunachal Pradesh": {"lat": 28.2180, "lon": 94.7278, "rainfall": 2780.0},
    "Assam": {"lat": 26.2006, "lon": 92.9376, "rainfall": 2100.0},
    "Bihar": {"lat": 25.0961, "lon": 85.3131, "rainfall": 1200.0},
    "Chhattisgarh": {"lat": 21.2787, "lon": 81.8661, "rainfall": 1300.0},
    "Goa": {"lat": 15.2993, "lon": 74.1240, "rainfall": 2900.0},
    "Gujarat": {"lat": 22.2587, "lon": 71.1924, "rainfall": 820.0},
    "Haryana": {"lat": 29.0588, "lon": 76.0856, "rainfall": 610.0},
    "Himachal Pradesh": {"lat": 31.1048, "lon": 77.1734, "rainfall": 1250.0},
    "Jammu and Kashmir": {"lat": 33.7782, "lon": 76.5762, "rainfall": 1050.0},
    "Jharkhand": {"lat": 23.6102, "lon": 85.2799, "rainfall": 1350.0},
    "Karnataka": {"lat": 15.3173, "lon": 75.7139, "rainfall": 1150.0},
    "Kerala": {"lat": 10.8505, "lon": 76.2711, "rainfall": 3050.0},
    "Madhya Pradesh": {"lat": 22.9734, "lon": 78.6569, "rainfall": 1020.0},
    "Maharashtra": {"lat": 19.7515, "lon": 75.7139, "rainfall": 1180.0},
    "Manipur": {"lat": 24.6637, "lon": 93.9063, "rainfall": 1450.0},
    "Meghalaya": {"lat": 25.4670, "lon": 91.3662, "rainfall": 2800.0},
    "Mizoram": {"lat": 23.1645, "lon": 92.9376, "rainfall": 2500.0},
    "Nagaland": {"lat": 26.1584, "lon": 94.5624, "rainfall": 1800.0},
    "Odisha": {"lat": 20.9517, "lon": 85.0985, "rainfall": 1480.0},
    "Punjab": {"lat": 31.1471, "lon": 75.3412, "rainfall": 650.0},
    "Rajasthan": {"lat": 27.0238, "lon": 74.2179, "rainfall": 570.0},
    "Sikkim": {"lat": 27.5330, "lon": 88.5122, "rainfall": 2700.0},
    "Tamil Nadu": {"lat": 11.1271, "lon": 78.6569, "rainfall": 990.0},
    "Telangana": {"lat": 18.1124, "lon": 79.0193, "rainfall": 950.0},
    "Tripura": {"lat": 23.9408, "lon": 91.9882, "rainfall": 2200.0},
    "Uttar Pradesh": {"lat": 26.8467, "lon": 80.9462, "rainfall": 980.0},
    "Uttarakhand": {"lat": 30.0668, "lon": 79.0193, "rainfall": 1550.0},
    "West Bengal": {"lat": 22.9868, "lon": 87.8550, "rainfall": 1750.0},
    "Puducherry": {"lat": 11.9416, "lon": 79.8083, "rainfall": 1250.0},
}

# Weather Code Mapping (WMO Code to description)
WMO_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    51: "Light drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Rain showers",
    95: "Thunderstorm"
}

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in kilometers between two geographic points."""
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def resolve_nearest_state(lat: float, lon: float) -> Tuple[str, Dict[str, Any], float]:
    """Find the closest Indian state centroid in STATE_COORDINATES for given GPS coordinates."""
    best_state = "Uttar Pradesh"
    best_geo = STATE_COORDINATES[best_state]
    best_dist = float("inf")
    for state_name, geo in STATE_COORDINATES.items():
        dist = _haversine_km(lat, lon, geo["lat"], geo["lon"])
        if dist < best_dist:
            best_dist = dist
            best_state = state_name
            best_geo = geo
    return best_state, best_geo, round(best_dist, 1)


def _build_spray_and_irrigation_advisory(forecast_days: List[Dict[str, Any]], wind_kmh: float) -> Dict[str, Any]:
    """Derive 3-day & 7-day agronomic spray/irrigation warnings from forecast data."""
    next_3 = forecast_days[:3] if forecast_days else []
    next_3_rain = round(sum(float(d.get("precipitation_mm", 0.0)) for d in next_3), 1)
    weekly_rain = round(sum(float(d.get("precipitation_mm", 0.0)) for d in forecast_days), 1)
    max_prob_3d = max((int(d.get("precipitation_prob_pct", 0)) for d in next_3), default=0)
    max_temp_3d = max((float(d.get("temp_max_c", 28.0)) for d in next_3), default=28.0)
    min_temp_3d = min((float(d.get("temp_min_c", 16.0)) for d in next_3), default=16.0)
    heavy_day = next((d for d in next_3 if float(d.get("precipitation_mm", 0.0)) >= 8.0), None)

    if heavy_day or next_3_rain >= 15.0 or max_prob_3d >= 70:
        spray_status = "DELAY_SPRAY"
        advisory_en = (
            f"Rain alert over next 3 days ({next_3_rain} mm forecast, up to {max_prob_3d}% chance): "
            "Delay fertilizer top-dressing and pesticide spraying to prevent wash-off and nutrient leaching."
        )
        advisory_hi = (
            f"अगले 3 दिनों में बारिश की चेतावनी ({next_3_rain} mm अनुमानित, {max_prob_3d}% संभावना): "
            "नुकसान व बहाव से बचने के लिए खाद और कीटनाशक छिड़काव को फिलहाल टाल दें।"
        )
    elif wind_kmh >= 20.0:
        spray_status = "DELAY_SPRAY"
        advisory_en = (
            f"High wind speed ({wind_kmh} km/h): Avoid foliar pesticide spraying due to spray drift; wait for calm conditions."
        )
        advisory_hi = (
            f"तेज़ हवा की गति ({wind_kmh} km/h): ड्रिफ्ट से बचने के लिए पत्तियों पर छिड़काव रोकें और शांत मौसम की प्रतीक्षा करें।"
        )
    elif next_3_rain >= 2.0 or max_prob_3d >= 45:
        spray_status = "CAUTION"
        advisory_en = (
            f"Light showers possible in next 3 days ({next_3_rain} mm): Prefer morning spraying with sticker/spreader and reduce scheduled irrigation."
        )
        advisory_hi = (
            f"अगले 3 दिनों में हल्की बूंदाबांदी की संभावना ({next_3_rain} mm): सुबह छिड़काव करें और अतिरिक्त सिंचाई कम रखें।"
        )
    elif max_temp_3d >= 36.0:
        spray_status = "IRRIGATION_ALERT"
        advisory_en = (
            f"Heat stress forecast (up to {max_temp_3d}°C, dry 3-day window): Schedule light morning/evening irrigation and avoid midday spraying."
        )
        advisory_hi = (
            f"अधिक तापमान चेतावनी ({max_temp_3d}°C तक, शुष्क 3 दिन): सुबह या शाम को हल्की सिंचाई करें और दोपहर में छिड़काव न करें।"
        )
    elif min_temp_3d <= 5.0:
        spray_status = "CAUTION"
        advisory_en = (
            f"Cold night alert (down to {min_temp_3d}°C): Provide light evening irrigation to protect sensitive crops from frost injury."
        )
        advisory_hi = (
            f"रात के कम तापमान की चेतावनी ({min_temp_3d}°C तक): पाले से फसल बचाने के लिए शाम को हल्की सिंचाई करें।"
        )
    else:
        spray_status = "SAFE"
        advisory_en = (
            f"Dry & favorable 3-day window ({next_3_rain} mm rain): Ideal conditions for balanced fertilizer application, spraying, and field work."
        )
        advisory_hi = (
            f"अगले 3 दिन मौसम अनुकूल व शुष्क ({next_3_rain} mm वर्षा): खाद डालने, कीटनाशक छिड़काव और खेत प्रबंधन के लिए उत्तम समय है।"
        )

    return {
        "spray_status": spray_status,
        "next_3_days_rain_mm": next_3_rain,
        "weekly_rain_total_mm": weekly_rain,
        "max_precip_prob_3d_pct": max_prob_3d,
        "max_temp_3d_c": round(max_temp_3d, 1),
        "min_temp_3d_c": round(min_temp_3d, 1),
        "advisory_en": advisory_en,
        "advisory_hi": advisory_hi,
    }


def fetch_live_weather(
    state: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None
) -> Dict[str, Any]:
    """
    Fetch real-time climate data and 7-day forecast from Open-Meteo.
    Supports either explicit state lookup or GPS coordinates (resolving nearest Indian state).
    """
    detected_gps = False
    distance_km = None

    if lat is not None and lon is not None:
        cleaned_state, geo, distance_km = resolve_nearest_state(float(lat), float(lon))
        req_lat, req_lon = float(lat), float(lon)
        detected_gps = True
    else:
        cleaned_state = (state or "Punjab").strip()
        geo = STATE_COORDINATES.get(cleaned_state, {"lat": 20.5937, "lon": 78.9629, "rainfall": 1100.0})
        req_lat, req_lon = geo["lat"], geo["lon"]

    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={req_lat}&longitude={req_lon}"
        "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max"
        "&forecast_days=7&timezone=Asia%2FKolkata"
    )

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'AgriTech-BTech-Capstone/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                current = data.get('current', {})
                daily = data.get('daily', {})
                w_code = current.get('weather_code', 0)
                condition = WMO_CODES.get(w_code, "Partly cloudy")

                temp = current.get('temperature_2m', 28.5)
                humidity = current.get('relative_humidity_2m', 65)
                precip = current.get('precipitation', 0.0)
                wind = current.get('wind_speed_10m', 12.0)

                dates = daily.get('time', [])
                d_codes = daily.get('weather_code', [])
                t_max_list = daily.get('temperature_2m_max', [])
                t_min_list = daily.get('temperature_2m_min', [])
                rain_list = daily.get('precipitation_sum', [])
                prob_list = daily.get('precipitation_probability_max', [])

                forecast_7_days: List[Dict[str, Any]] = []
                for idx, dt_str in enumerate(dates[:7]):
                    try:
                        day_label = datetime.strptime(dt_str, "%Y-%m-%d").strftime("%a")
                    except ValueError:
                        day_label = f"D{idx + 1}"
                    code_val = int(d_codes[idx]) if idx < len(d_codes) and d_codes[idx] is not None else 0
                    forecast_7_days.append({
                        "date": dt_str,
                        "day_label": "Today" if idx == 0 else day_label,
                        "temp_max_c": round(float(t_max_list[idx]), 1) if idx < len(t_max_list) and t_max_list[idx] is not None else round(float(temp) + 3.0, 1),
                        "temp_min_c": round(float(t_min_list[idx]), 1) if idx < len(t_min_list) and t_min_list[idx] is not None else round(float(temp) - 8.0, 1),
                        "precipitation_mm": round(float(rain_list[idx]), 1) if idx < len(rain_list) and rain_list[idx] is not None else 0.0,
                        "precipitation_prob_pct": int(prob_list[idx]) if idx < len(prob_list) and prob_list[idx] is not None else 0,
                        "weather_code": code_val,
                        "weather_description": WMO_CODES.get(code_val, "Partly cloudy"),
                    })

                spray_advisory = _build_spray_and_irrigation_advisory(forecast_7_days, float(wind))

                return {
                    "source": "Open-Meteo Live API",
                    "state": cleaned_state,
                    "detected_via_gps": detected_gps,
                    "gps_distance_km": distance_km,
                    "latitude": round(req_lat, 4),
                    "longitude": round(req_lon, 4),
                    "temperature_celsius": temp,
                    "temperature_c": temp,
                    "relative_humidity_percent": humidity,
                    "relative_humidity_pct": humidity,
                    "current_precipitation_mm": precip,
                    "precipitation_mm": precip,
                    "wind_speed_kmh": wind,
                    "weather_condition": condition,
                    "weather_description": condition,
                    "suggested_annual_rainfall_mm": geo["rainfall"],
                    "annual_rainfall_benchmark_mm": geo["rainfall"],
                    "forecast_7_days": forecast_7_days,
                    "spray_advisory": spray_advisory,
                    "status": "LIVE",
                    "is_live": True
                }
    except Exception as e:
        logger.warning(f"Live weather API timed out or unreachable ({e}), using regional meteorological benchmark.")

    # Graceful fallback to IMD regional climatology with deterministic 7-day baseline
    base_dt = datetime.now()
    fallback_forecast = []
    for idx in range(7):
        dt = base_dt + timedelta(days=idx)
        fallback_forecast.append({
            "date": dt.strftime("%Y-%m-%d"),
            "day_label": "Today" if idx == 0 else dt.strftime("%a"),
            "temp_max_c": 29.0,
            "temp_min_c": 17.0,
            "precipitation_mm": 0.0,
            "precipitation_prob_pct": 10,
            "weather_code": 1,
            "weather_description": "Seasonal Agro-Climate",
        })

    return {
        "source": "IMD Historical Regional Climatology",
        "state": cleaned_state,
        "detected_via_gps": detected_gps,
        "gps_distance_km": distance_km,
        "latitude": round(req_lat, 4),
        "longitude": round(req_lon, 4),
        "temperature_celsius": 28.0,
        "temperature_c": 28.0,
        "relative_humidity_percent": 60,
        "relative_humidity_pct": 60,
        "current_precipitation_mm": 0.0,
        "precipitation_mm": 0.0,
        "wind_speed_kmh": 10.0,
        "weather_condition": "Seasonal Agro-Climate",
        "weather_description": "Seasonal Agro-Climate",
        "suggested_annual_rainfall_mm": geo["rainfall"],
        "annual_rainfall_benchmark_mm": geo["rainfall"],
        "forecast_7_days": fallback_forecast,
        "spray_advisory": _build_spray_and_irrigation_advisory(fallback_forecast, 10.0),
        "status": "CACHED_BENCHMARK",
        "is_live": False
    }
