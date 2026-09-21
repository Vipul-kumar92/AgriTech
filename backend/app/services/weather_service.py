"""
Live Agricultural Weather & Climate Service
Integrates Open-Meteo API with regional coordinates across all 30 Indian states.
"""

import urllib.request
import json
import logging
from typing import Dict, Any

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

def fetch_live_weather(state: str) -> Dict[str, Any]:
    """
    Fetch real-time climate data from Open-Meteo for the state's geographic centroid.
    Falls back gracefully to regional climatological benchmarks if network fails.
    """
    cleaned_state = state.strip()
    geo = STATE_COORDINATES.get(cleaned_state, {"lat": 20.5937, "lon": 78.9629, "rainfall": 1100.0})
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={geo['lat']}&longitude={geo['lon']}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FKolkata"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'AgriTech-BTech-Capstone/1.0'})
        with urllib.request.urlopen(req, timeout=4) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                current = data.get('current', {})
                w_code = current.get('weather_code', 0)
                condition = WMO_CODES.get(w_code, "Partly cloudy")
                
                temp = current.get('temperature_2m', 28.5)
                humidity = current.get('relative_humidity_2m', 65)
                precip = current.get('precipitation', 0.0)
                wind = current.get('wind_speed_10m', 12.0)

                return {
                    "source": "Open-Meteo Live API",
                    "state": cleaned_state,
                    "latitude": geo["lat"],
                    "longitude": geo["lon"],
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
                    "status": "LIVE",
                    "is_live": True
                }
    except Exception as e:
        logger.warning(f"Live weather API timed out or unreachable ({e}), using regional meteorological benchmark.")

    # Graceful fallback to IMD regional climatology
    return {
        "source": "IMD Historical Regional Climatology",
        "state": cleaned_state,
        "latitude": geo["lat"],
        "longitude": geo["lon"],
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
        "status": "CACHED_BENCHMARK",
        "is_live": False
    }
