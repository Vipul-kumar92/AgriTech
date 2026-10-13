import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  Sprout,
  MapPin,
  CloudRain,
  Beaker,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  CloudSun,
  Thermometer,
  Droplets,
  Sparkles,
  RefreshCw,
  Compass
} from 'lucide-react';

const PredictPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isHindi, translateCrop, translateSeason } = useLanguage();
  const [categories, setCategories] = useState({
    crops: [],
    states: [],
    seasons: []
  });
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  // Live weather detection state
  const [liveWeather, setLiveWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherNotice, setWeatherNotice] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    crop: location.state?.presetCrop || 'Rice',
    season: 'Kharif',
    state: location.state?.presetState || 'Punjab',
    area: 50.0,
    annual_rainfall: 1100.0,
    fertilizer: 7500.0,
    pesticide: 175.0,
    crop_year: 2024
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch live meteorological parameters for a state
  const fetchLiveWeather = async (targetState) => {
    const stateName = targetState || formData.state;
    if (!stateName) return;

    setLoadingWeather(true);
    setWeatherNotice('');
    try {
      const res = await api.get('/weather/live', { params: { state: stateName } });
      setLiveWeather(res.data);
      if (res.data.annual_rainfall_benchmark_mm) {
        setFormData((prev) => ({
          ...prev,
          annual_rainfall: res.data.annual_rainfall_benchmark_mm
        }));
        setWeatherNotice(
          `Auto-applied meteorological annual precipitation (${res.data.annual_rainfall_benchmark_mm} mm) for ${res.data.state}.`
        );
      }
    } catch (err) {
      console.warn('Weather service unreachable:', err);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Fetch unique categories directly from backend dataset stats
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.get('/dataset/stats');
        const crops = res.data.crops || [];
        const states = res.data.states || [];
        const seasons = res.data.seasons || [];

        setCategories({ crops, states, seasons });

        // Prepopulate based on location state (e.g. from /map) or defaults
        const defaultCrop = location.state?.presetCrop && crops.includes(location.state.presetCrop)
          ? location.state.presetCrop
          : crops.includes('Rice') ? 'Rice' : crops[0] || 'Rice';

        const defaultState = location.state?.presetState && states.includes(location.state.presetState)
          ? location.state.presetState
          : states.includes('Punjab') ? 'Punjab' : states[0] || 'Punjab';

        setFormData((prev) => ({
          ...prev,
          crop: defaultCrop,
          state: defaultState,
          season: seasons.includes('Kharif') ? 'Kharif' : seasons[0] || 'Kharif'
        }));

        // Automatically fetch live climate for initial state
        fetchLiveWeather(defaultState);
      } catch (err) {
        console.error('Failed to load dataset categories:', err);
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'crop' || name === 'season' || name === 'state' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.area <= 0) {
      setError('Cultivated area must be strictly greater than 0 hectares.');
      return;
    }
    if (formData.annual_rainfall < 0) {
      setError('Annual rainfall cannot be negative.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/predict', formData);
      navigate(`/predict/result/${res.data.prediction_id}`, { state: { prediction: res.data } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate prediction. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMetadata) {
    return <LoadingSpinner message="Loading agricultural categories and regional parameters..." />;
  }

  // Calculate live agronomic intensities
  const fertPerHa = formData.area > 0 ? (formData.fertilizer / formData.area).toFixed(1) : 0;
  const pestPerHa = formData.area > 0 ? (formData.pesticide / formData.area).toFixed(2) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sprout className="w-3.5 h-3.5" />
          <span>{isHindi ? 'मशीन लर्निंग इनफेरेंस' : 'Production ML Inference'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('predict_header_title', 'Agricultural Yield Prediction Lab')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isHindi
            ? 'अपने कृषि और पर्यावरणीय पैरामीटर दर्ज करें। हमारा प्रशिक्षित रैंडम फॉरेस्ट मॉडल टन/हेक्टेयर में सटीक उपज का अनुमान लगाएगा।'
            : 'Input your agricultural and environmental parameters. Our trained Random Forest pipeline will generate an empirical yield forecast in tonnes/hectare.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Crop & Regional Location */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {isHindi ? '1. फसल एवं भौगोलिक स्थिति' : '1. Crop & Geographic Location'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('predict_crop_label', 'Target Crop')}
              </label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium text-slate-800"
              >
                {categories.crops.map((c) => (
                  <option key={c} value={c}>
                    {translateCrop(c)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                {isHindi ? '54 विभिन्न फसल किस्में समर्थित' : '54 distinct varieties supported'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('predict_state_label', 'State / Region')}
                </label>
                <button
                  type="button"
                  onClick={() => fetchLiveWeather(formData.state)}
                  disabled={loadingWeather}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1"
                  title="Query Open-Meteo for real-time climate"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingWeather ? 'animate-spin' : ''}`} />
                  <span>{loadingWeather ? (isHindi ? 'प्राप्त हो रहा है...' : 'Syncing...') : (isHindi ? 'मौसम सिंक' : 'Sync Weather')}</span>
                </button>
              </div>
              <select
                name="state"
                value={formData.state}
                onChange={(e) => {
                  handleChange(e);
                  fetchLiveWeather(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium text-slate-800"
              >
                {categories.states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                {isHindi ? '30 भारतीय राज्य एवं केंद्र शासित प्रदेश' : '30 Indian States & UTs'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('predict_season_label', 'Cropping Season')}
              </label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium text-slate-800"
              >
                {categories.seasons.map((sn) => (
                  <option key={sn} value={sn}>
                    {translateSeason(sn)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                {isHindi ? 'खरीफ, रबी, संपूर्ण वर्ष, इत्यादि' : 'Kharif, Rabi, Whole Year, etc.'}
              </p>
            </div>
          </div>

          {/* Live Open-Meteo Meteorological Badge */}
          {liveWeather && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live Meteorological Snapshot ({liveWeather.state})
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-ping" />
                      {liveWeather.is_live ? 'Open-Meteo Live' : 'IMD Climate'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {liveWeather.weather_description} • Recorded via Open-Meteo Geospatial Coordinates
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-medium text-slate-700">
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span className="font-bold">{liveWeather.temperature_c}°C</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>Humidity: <strong className="text-slate-900">{liveWeather.relative_humidity_pct}%</strong></span>
                </div>
                <div className="flex items-center space-x-1">
                  <CloudRain className="w-4 h-4 text-teal-600" />
                  <span>IMD Benchmark: <strong className="text-slate-900">{liveWeather.annual_rainfall_benchmark_mm} mm</strong></span>
                </div>
              </div>
            </div>
          )}

          {weatherNotice && (
            <div className="text-xs text-emerald-700 bg-emerald-50/80 px-3.5 py-2 rounded-lg border border-emerald-200 flex items-center justify-between">
              <span className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                {weatherNotice}
              </span>
              <button
                type="button"
                onClick={() => setWeatherNotice('')}
                className="text-emerald-500 hover:text-emerald-700 font-bold ml-2 text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Cultivated Land & Weather */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <CloudRain className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {isHindi ? '2. भूमि क्षेत्रफल एवं वार्षिक वर्षा' : '2. Land Extent & Climate Precipitation'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('predict_area_label', 'Cultivated Area (Hectares)')}
                </label>
                <span className="text-xs font-bold text-emerald-600">{formData.area} ha</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.1"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {isHindi ? '1 हेक्टेयर ≈ 2.471 एकड़' : '1 Hectare ≈ 2.471 Acres'}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('predict_rainfall_label', 'Annual Rainfall (mm)')}
                </label>
                <span className="text-xs font-bold text-emerald-600">{formData.annual_rainfall} mm</span>
              </div>
              <input
                type="number"
                step="1"
                min="0"
                name="annual_rainfall"
                value={formData.annual_rainfall}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{isHindi ? 'भारतीय औसत: 600mm – 2200mm' : 'India historical avg: 600mm – 2200mm'}</span>
                {liveWeather && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, annual_rainfall: liveWeather.annual_rainfall_benchmark_mm }))
                    }
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    {isHindi ? `${liveWeather.annual_rainfall_benchmark_mm} मिमी सेट करें` : `Reset to ${liveWeather.annual_rainfall_benchmark_mm} mm`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Agricultural Chemical Management */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Beaker className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {isHindi ? '3. कृषि इनपुट व प्रबंधन (खाद व कीटनाशक)' : '3. Agricultural Inputs & Management'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('predict_fert_label', 'Total Fertilizer Input (kg)')}
                </label>
                <span className="text-xs font-bold text-slate-600">{formData.fertilizer} kg</span>
              </div>
              <input
                type="number"
                step="10"
                min="0"
                name="fertilizer"
                value={formData.fertilizer}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <span>{isHindi ? 'प्रति हेक्टेयर खाद दर:' : 'Calculated Fertilizer Intensity:'}</span>
                <span className="font-bold">{fertPerHa} kg/ha</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('predict_pest_label', 'Total Pesticide Usage (kg)')}
                </label>
                <span className="text-xs font-bold text-slate-600">{formData.pesticide} kg</span>
              </div>
              <input
                type="number"
                step="1"
                min="0"
                name="pesticide"
                value={formData.pesticide}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <span>{isHindi ? 'प्रति हेक्टेयर कीटनाशक दर:' : 'Calculated Pesticide Intensity:'}</span>
                <span className="font-bold">{pestPerHa} kg/ha</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Sprout className="w-5 h-5 mr-2" />
            )}
            {submitting
              ? t('predict_submitting', 'Running Hyper-Tuned Random Forest...')
              : t('predict_submit_btn', 'Generate Machine Learning Prediction')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictPage;
