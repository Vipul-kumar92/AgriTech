import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { StatCard, LoadingSpinner } from '../components/common/StatCard';
import {
  Sprout,
  BarChart3,
  Award,
  TrendingUp,
  History,
  ArrowUpRight,
  Database,
  Calendar,
  CloudSun,
  Droplets,
  Thermometer,
  Compass,
  Map,
  SlidersHorizontal,
  Sparkles,
  Wheat,
  CheckCircle2,
  Info,
  RefreshCw,
  MapPin,
  Wind,
  Mic
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

const AGRI_COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#14b8a6', '#0d9488', '#22c55e'];

const DEFAULT_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

const getCurrentAgroCycle = (isHindi) => {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) {
    return {
      name: isHindi ? 'खरीफ सीजन' : 'Kharif Season',
      phase: isHindi ? 'मानसून बुवाई एवं वृद्धि' : 'Monsoon Sowing & Growth'
    };
  }
  if (month >= 11 || month <= 3) {
    return {
      name: isHindi ? 'रबी सीजन' : 'Rabi Season',
      phase: isHindi ? 'शीतकालीन फसल चक्र' : 'Winter Crop Cycle'
    };
  }
  return {
    name: isHindi ? 'जायद / ग्रीष्म' : 'Zaid / Summer',
    phase: isHindi ? 'पूर्व-मानसून फसल चक्र' : 'Pre-Monsoon Cycle'
  };
};

const getDynamicAdvisory = (weather, isHindi) => {
  if (!weather) {
    return null;
  }
  const temp = Number(weather.temperature_c ?? weather.temperature_celsius ?? 28);
  const humidity = Number(weather.relative_humidity_pct ?? weather.relative_humidity_percent ?? 60);
  const precip = Number(weather.current_precipitation_mm ?? weather.precipitation_mm ?? 0);

  if (precip >= 5) {
    return isHindi
      ? 'सक्रिय वर्षा दर्ज की गई है: खेत में जल निकासी (ड्रेनेज) की जांच करें और भारी बारिश के दौरान उर्वरक छिड़काव से बचें।'
      : 'Active rainfall detected: verify field drainage channels and defer foliar fertilizer or pesticide spraying until dry.';
  }
  if (temp >= 35) {
    return isHindi
      ? 'उच्च तापमान चेतावनी: वाष्पीकरण तनाव कम करने के लिए सुबह या शाम के समय हल्की सिंचाई की योजना बनाएं।'
      : 'Elevated temperature alert: schedule light irrigation during early morning or evening to reduce evapotranspiration stress.';
  }
  if (humidity >= 80) {
    return isHindi
      ? 'उच्च आर्द्रता (>80%): पत्तियों में फफूंद/रतुआ रोग के शुरुआती लक्षणों की नियमित निगरानी करें।'
      : 'High relative humidity (>80%): inspect crops closely for early fungal blight or rust symptoms.';
  }
  return isHindi
    ? 'वर्तमान मौसम फसल वृद्धि के लिए अनुकूल है: संतुलित NPK पोषण बनाए रखें और जड़ क्षेत्र की नमी की जांच करते रहें।'
    : 'Favorable agro-climatic conditions: maintain balanced NPK application and monitor root-zone moisture ahead of flowering.';
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { t, isHindi, translateCrop, translateSeason, translateState } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [statesList, setStatesList] = useState(DEFAULT_STATES);
  const [selectedState, setSelectedState] = useState(
    () => localStorage.getItem('agritech_weather_state') || 'Punjab'
  );
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLiveWeather = async (targetState) => {
    const stateToQuery = targetState || selectedState;
    if (!stateToQuery) return;
    setWeatherLoading(true);
    setWeatherError('');
    try {
      const res = await api.get('/weather/live', { params: { state: stateToQuery } });
      setLiveWeather(res.data);
    } catch (err) {
      console.error('Failed to fetch live weather:', err);
      setWeatherError(isHindi ? 'मौसम डेटा लोड नहीं हो सका' : 'Unable to sync live weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, predsRes, statsRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/predictions?limit=5'),
          api.get('/dataset/stats').catch(() => null)
        ]);
        setAnalytics(analyticsRes.data);
        setRecentPredictions(predsRes.data.items || []);
        if (statsRes?.data?.states?.length) {
          setStatesList(statsRes.data.states);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    localStorage.setItem('agritech_weather_state', selectedState);
    fetchLiveWeather(selectedState);
  }, [selectedState]);

  if (loading) {
    return <LoadingSpinner message={t('loading_dashboard', 'Aggregating agricultural dashboard & telemetry...')} />;
  }

  const kpi = analytics?.kpi || {};
  const rawCropData = analytics?.crop_distribution?.slice(0, 7) || [];
  const rawSeasonalData = analytics?.seasonal_distribution || [];

  // Translate crop & season data for recharts
  const cropData = rawCropData.map((item) => ({
    ...item,
    displayName: translateCrop(item.crop),
  }));

  const seasonalData = rawSeasonalData.map((item) => ({
    ...item,
    displayName: translateSeason(item.season),
  }));

  const agroCycle = getCurrentAgroCycle(isHindi);
  const dynamicAdvisory = getDynamicAdvisory(liveWeather, isHindi);
  const displayTemp = liveWeather ? `${liveWeather.temperature_c ?? liveWeather.temperature_celsius}°C` : (weatherLoading ? '...' : '—');
  const displayHumidity = liveWeather ? `${liveWeather.relative_humidity_pct ?? liveWeather.relative_humidity_percent}%` : (weatherLoading ? '...' : '—');
  const displayAnnualRain = liveWeather ? `${liveWeather.annual_rainfall_benchmark_mm ?? liveWeather.suggested_annual_rainfall_mm} mm` : (weatherLoading ? '...' : '—');
  const displayCurrentRain = liveWeather ? `${liveWeather.current_precipitation_mm ?? liveWeather.precipitation_mm ?? 0} mm` : '0 mm';
  const displayWind = liveWeather ? `${liveWeather.wind_speed_kmh ?? 0} km/h` : '—';

  return (
    <div className="space-y-6 pb-14">
      {/* ========================================================================= */}
      {/* 1. HERO AGRICULTURE BANNER WITH CINEMATIC PHOTO & GLASSMORPHISM OVERLAY   */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/20 border border-emerald-400/30 group">
        {/* Background Agriculture Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: `url('/agri_hero_banner.jpg')` }}
        />

        {/* Crisp Cinematic Gradient Scrim (lets lush emerald fields show clearly on right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/68 to-emerald-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/55 via-transparent to-transparent" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-7 md:p-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-300/40 text-emerald-100 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('live_cycle', 'Agro-Climatic Cycle: Active')}</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-300/35 text-amber-200 text-[11px] font-semibold backdrop-blur-md">
                <span>🌱 {t('ai_precision_badge', '100% Empirical Machine Learning')}</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-white/90 text-[11px] font-semibold backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                <span>RF v1.0 • R² {kpi.model_r2 || '0.8147'}</span>
              </span>
            </div>

            {/* Title & Greeting */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              {t('dashboard_title', 'AgriTech Workspace Dashboard')}
            </h1>

            <p className="text-xs sm:text-base text-emerald-50/90 font-normal leading-relaxed">
              {recentPredictions.length === 0
                ? (isHindi ? 'स्वागत है' : 'Welcome')
                : t('welcome_back', 'Welcome back')}
              ,{' '}
              <span className="font-bold text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-lg border border-amber-300/30">
                {user?.name || (isHindi ? 'किसान' : 'Farmer')}
              </span>
              . {t('dashboard_subtitle', 'Real-time predictive agriculture insights & empirical farm intelligence.')}
            </p>
          </div>

          {/* Right Column: Farmer Profile Card + Primary Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto">
            <Link
              to="/profile"
              className="flex items-center space-x-3 px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/25 shadow-lg transition-all"
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'Farmer'}
                  className="w-8 h-8 rounded-full border border-emerald-300/60 object-cover bg-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 font-black text-xs flex items-center justify-center shadow-inner">
                  {(user?.name || 'F').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-white truncate max-w-[150px]">
                  {user?.name || (isHindi ? 'किसान' : 'Farmer')}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                  {user?.role || 'FARMER'} • {isHindi ? 'सत्यापित' : 'Verified'}
                </p>
              </div>
            </Link>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <Link
                to="/predict"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-950/30 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Sprout className="w-4 h-4 mr-2" />
                {t('new_prediction', 'New Prediction')}
              </Link>

              <Link
                to="/predict"
                state={{ startVoice: true }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 sm:py-3 bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 font-bold text-xs sm:text-sm rounded-2xl border border-amber-300/40 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200"
                title={isHindi ? 'बोलकर उपज का अनुमान लगाएं' : 'Predict by speaking parameters'}
              >
                <Mic className="w-4 h-4 mr-1.5 text-amber-300" />
                {isHindi ? 'बोलकर पूछें' : 'Voice Predict'}
              </Link>

              <Link
                to="/map"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 sm:py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm rounded-2xl border border-white/30 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Map className="w-4 h-4 mr-2 text-emerald-300" />
                {t('yield_map', 'Yield Map')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. AGRO-CLIMATIC WEATHER & FARM ADVISORY WIDGET (TRANSLUCENT GLASS)       */}
      {/* ========================================================================= */}
      <div className="rounded-2xl glass-card-agri p-4 sm:p-5 border border-emerald-200/80 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3.5 border-b border-emerald-100/80">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                {liveWeather?.is_live && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveWeather?.is_live ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                {t('agro_advisory_title', "Today's Agro-Climatic Weather & Field Advisory")}
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {liveWeather
                ? `${liveWeather.source} • ${isHindi ? translateState(liveWeather.state) : liveWeather.state} (${liveWeather.weather_description || 'Seasonal'})`
                : t('agro_advisory_subtitle', 'Live local parameters optimized for Kharif / Rabi cultivation')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* State Selector */}
            <div className="flex items-center space-x-1.5 bg-white/90 border border-emerald-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <select
                aria-label={isHindi ? 'मौसम के लिए राज्य चुनें' : 'Select state for weather'}
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {isHindi ? translateState(st) : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchLiveWeather(selectedState)}
              disabled={weatherLoading}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition-colors"
              title={isHindi ? 'मौसम रीफ़्रेश करें' : 'Sync live weather'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin' : ''}`} />
              <span>{weatherLoading ? (isHindi ? 'सिंक...' : 'Syncing...') : (isHindi ? 'सिंक करें' : 'Sync')}</span>
            </button>

            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              liveWeather?.is_live
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200/60'
                : 'bg-amber-100 text-amber-800 border-amber-200/60'
            }`}>
              {liveWeather?.is_live ? '● Open-Meteo Live' : '● IMD Benchmark'}
            </span>
          </div>
        </div>

        {weatherError && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            {weatherError}
          </div>
        )}

        {/* 4 Micro Weather & Soil Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-4">
          <div className="flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">{t('temp_label', 'Temperature')}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{displayTemp}</p>
              <p className="text-[9px] sm:text-[10px] text-emerald-700 truncate">
                {liveWeather?.weather_description || t('temp_status', 'Optimal growth')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-xl bg-teal-50/70 border border-teal-100">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">
                {isHindi ? 'सापेक्ष आर्द्रता' : 'Relative Humidity'}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{displayHumidity}</p>
              <p className="text-[9px] sm:text-[10px] text-teal-700 truncate flex items-center gap-1">
                <Wind className="w-3 h-3 inline flex-shrink-0" />
                <span>{isHindi ? `हवा: ${displayWind}` : `Wind: ${displayWind}`}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-xl bg-sky-50/70 border border-sky-100">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center flex-shrink-0">
              <CloudSun className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">
                {isHindi ? 'वार्षिक वर्षा मानक' : 'Annual Rainfall'}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{displayAnnualRain}</p>
              <p className="text-[9px] sm:text-[10px] text-sky-700 truncate">
                {isHindi ? `वर्तमान: ${displayCurrentRain}` : `Current precip: ${displayCurrentRain}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-xl bg-amber-50/70 border border-amber-100">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
              <Wheat className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">{t('active_season_label', 'Current Cycle')}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{agroCycle.name}</p>
              <p className="text-[9px] sm:text-[10px] text-amber-700 truncate">{agroCycle.phase}</p>
            </div>
          </div>
        </div>

        {/* Daily Tip Alert */}
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-l-4 border-emerald-500 text-xs text-slate-700 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-900 font-bold">{t('advisory_tip_title', 'Agricultural Advisory for Today:')} </strong>
            <span>{dynamicAdvisory || t('advisory_tip_content', 'Recommended: Maintain optimal NPK nitrogen balance and monitor soil moisture prior to grain filling.')}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. KPI STAT CARDS (GLASSMORPHISM WITH AGRICULTURE THEME ACCENTS)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('kpi_total_preds', 'Total Predictions Logged')}
          value={kpi.total_predictions || 0}
          subtitle={t('kpi_total_preds_sub', 'Verified agricultural audit records')}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title={t('kpi_avg_yield', 'Average Predicted Yield')}
          value={kpi.average_predicted_yield || '4.12'}
          unit={t('unit_tonnes_ha', 'tonnes/ha')}
          subtitle={t('kpi_avg_yield_sub', 'Empirical platform mean')}
          icon={Sprout}
          color="amber"
        />
        <StatCard
          title={t('kpi_most_crop', 'Most Predicted Crop')}
          value={translateCrop(kpi.most_predicted_crop || 'Rice')}
          subtitle={t('kpi_most_crop_sub', 'Highest query volume')}
          icon={Database}
          color="blue"
        />
        <StatCard
          title={t('kpi_model_score', 'Active Model R² Score')}
          value={kpi.model_r2 || '0.8147'}
          subtitle={t('kpi_model_sub', 'Random Forest Tuned')}
          icon={Award}
          color="purple"
        />
      </div>

      {/* ========================================================================= */}
      {/* 4. SMART FARMING QUICK ACTION TILES                                        */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            {t('quick_actions_title', 'Farm Intelligence & Analytical Suites')}
          </h2>
          <span className="text-xs text-slate-500">AgriTech Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Predict Yield */}
          <Link
            to="/predict"
            className="group relative overflow-hidden p-5 rounded-2xl glass-card-agri ring-1 ring-white/70 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/15 transition-all flex flex-col justify-between"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-400/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t('action_predict_title', 'Predict Crop Yield')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t('action_predict_desc', 'Run multi-variable ML models with NPK, rainfall & soil data.')}
              </p>
            </div>
            <div className="relative z-10 mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>{isHindi ? 'पूर्वानुमान लगाएं' : 'Start Inference'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 2: Yield Map */}
          <Link
            to="/map"
            className="group relative overflow-hidden p-5 rounded-2xl glass-card-agri ring-1 ring-white/70 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/15 transition-all flex flex-col justify-between"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-teal-400/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/25 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                {t('action_map_title', 'Agri Yield Map')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t('action_map_desc', 'Interactive state-level productivity and geographic crop zones.')}
              </p>
            </div>
            <div className="relative z-10 mt-4 flex items-center text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
              <span>{isHindi ? 'मानचित्र देखें' : 'View Geospatial Map'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 3: What-If Simulator */}
          <Link
            to="/simulator"
            className="group relative overflow-hidden p-5 rounded-2xl glass-card-agri ring-1 ring-white/70 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/15 transition-all flex flex-col justify-between"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-400/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                {t('action_sim_title', 'What-If Lab Simulator')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t('action_sim_desc', 'Simulate climate sensitivity, fertilizer tweaks, and yield impact.')}
              </p>
            </div>
            <div className="relative z-10 mt-4 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>{isHindi ? 'सिमुलेशन करें' : 'Open Simulator'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 4: Historical Analytics */}
          <Link
            to="/analytics"
            className="group relative overflow-hidden p-5 rounded-2xl glass-card-agri ring-1 ring-white/70 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/15 transition-all flex flex-col justify-between"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-purple-400/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-purple-500/25 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                {t('action_analytics_title', 'Agri Analytics')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t('action_analytics_desc', 'Explore 24 years of crop distributions, trends, and seasonal yields.')}
              </p>
            </div>
            <div className="relative z-10 mt-4 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              <span>{isHindi ? 'विश्लेषण देखें' : 'View Deep Insights'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE CHARTS GRID (GLASSMORPHISM WITH NATURE ACCENTS)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop-wise Productivity Benchmark */}
        <div className="rounded-2xl glass-card-agri p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('chart_crop_title', 'Historical Crop Yield Benchmarks')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('chart_crop_subtitle', 'Mean productivity across top cultivated crops (tonnes/ha)')}
              </p>
            </div>
            <Link to="/analytics" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
              {t('chart_crop_link', 'Full Analytics')} <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayName" angle={-25} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(val) => [`${val} ${t('unit_tonnes_ha', 'tonnes/ha')}`, t('mean_yield', 'Mean Yield')]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="average_yield" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {cropData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={AGRI_COLORS[index % AGRI_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Yield Analysis */}
        <div className="rounded-2xl glass-card-agri p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('chart_season_title', 'Seasonal Productivity Variations')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('chart_season_subtitle', 'Average harvest yield categorized by agro-season')}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {t('six_seasons_badge', '6 Agro-Seasons')}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayName" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(val) => [`${val} ${t('unit_tonnes_ha', 'tonnes/ha')}`, t('avg_yield', 'Avg Yield')]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="average_yield" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. RECENT PREDICTIONS TABLE (GLASSMORPHISM WITH BILINGUAL ROWS)           */}
      {/* ========================================================================= */}
      <div className="rounded-2xl glass-card-agri overflow-hidden border border-emerald-100 shadow-md">
        <div className="p-6 border-b border-emerald-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('recent_title', 'Recent Crop Predictions')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('recent_subtitle', 'Latest agricultural model inference logs & yield estimations')}
              </p>
            </div>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center"
          >
            {t('view_all_history', 'View All History')} <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-emerald-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-emerald-100">
              <tr>
                <th className="px-6 py-3.5">{t('col_crop', 'Crop')}</th>
                <th className="px-6 py-3.5">{t('col_state', 'State')}</th>
                <th className="px-6 py-3.5">{t('col_season', 'Season')}</th>
                <th className="px-6 py-3.5">{t('col_area', 'Cultivated Area')}</th>
                <th className="px-6 py-3.5">{t('col_pred_yield', 'Predicted Yield')}</th>
                <th className="px-6 py-3.5">{t('col_total_prod', 'Total Production')}</th>
                <th className="px-6 py-3.5 text-right">{t('col_action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPredictions.length > 0 ? (
                recentPredictions.map((pred) => (
                  <tr key={pred.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-2.5 flex-shrink-0">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <span>{translateCrop(pred.crop)}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{pred.state}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {translateSeason(pred.season)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{pred.area} ha</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 font-extrabold text-sm border border-emerald-200">
                        {pred.predicted_yield} <span className="text-[11px] font-normal text-slate-600 ml-1">{pred.unit || 'tonnes/ha'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {pred.predicted_total_production} tonnes
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/predict/result/${pred.id}`}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        {t('action_breakdown', 'View Breakdown →')}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10">
                    <div className="max-w-2xl mx-auto text-center space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-extrabold text-slate-900">
                          {isHindi ? 'आपका फ़ार्म डैशबोर्ड तैयार है!' : 'Your Smart Farm Workspace is Ready!'}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500">
                          {isHindi
                            ? 'अपना पहला फसल उपज पूर्वानुमान चलाने के लिए नीचे एक त्वरित प्रीसेट चुनें या कस्टम फ़ॉर्म खोलें।'
                            : 'Start your first ML crop yield prediction using a 1-click regional preset below or open the custom lab.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                        <Link
                          to="/predict"
                          state={{ presetCrop: 'Rice', presetState: 'Punjab' }}
                          className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
                        >
                          🌾 {isHindi ? 'पंजाब • चावल (खरीफ)' : 'Punjab • Rice Preset'}
                        </Link>
                        <Link
                          to="/predict"
                          state={{ presetCrop: 'Wheat', presetState: 'Uttar Pradesh' }}
                          className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
                        >
                          🌿 {isHindi ? 'उत्तर प्रदेश • गेहूं' : 'UP • Wheat Preset'}
                        </Link>
                        <Link
                          to="/predict"
                          className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                        >
                          <Sprout className="w-3.5 h-3.5 mr-1.5" />
                          {t('run_first_pred', 'Run First Prediction')}
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
