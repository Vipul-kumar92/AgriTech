import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/StatCard';
import { parseAgriVoiceTranscript } from '../utils/voiceParser';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Sprout,
  MapPin,
  CloudRain,
  Beaker,
  AlertCircle,
  CloudSun,
  Thermometer,
  Droplets,
  Sparkles,
  RefreshCw,
  Mic,
  MicOff,
  Trophy,
  TrendingUp,
  IndianRupee,
  BarChart3,
  ArrowRight,
  SlidersHorizontal,
  Navigation,
  AlertTriangle,
  CalendarDays
} from 'lucide-react';

const PredictPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isHindi, translateCrop, translateSeason, translateState } = useLanguage();
  const [categories, setCategories] = useState({
    crops: [],
    states: [],
    seasons: []
  });
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  // Live weather detection state
  const [liveWeather, setLiveWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [weatherNotice, setWeatherNotice] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    crop: location.state?.presetCrop || 'Rice',
    season: location.state?.presetSeason || 'Kharif',
    state: location.state?.presetState || 'Punjab',
    area: location.state?.presetArea ?? 50.0,
    annual_rainfall: location.state?.presetRainfall ?? 1100.0,
    fertilizer: location.state?.presetFertilizer ?? 7500.0,
    pesticide: location.state?.presetPesticide ?? 175.0,
    crop_year: 2024
  });

  const [mode, setMode] = useState(location.state?.mode === 'recommend' ? 'recommend' : 'single');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [recommendingCropRun, setRecommendingCropRun] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef(null);
  const resultsRef = useRef(null);

  // Fetch live meteorological parameters for a state
  const fetchLiveWeather = async (targetState, preservePresetRainfall = false) => {
    const stateName = targetState || formData.state;
    if (!stateName) return;

    setLoadingWeather(true);
    setWeatherNotice('');
    try {
      const res = await api.get('/weather/live', { params: { state: stateName } });
      setLiveWeather(res.data);
      if (res.data.annual_rainfall_benchmark_mm && !preservePresetRainfall) {
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

  const handleUseGpsLocation = () => {
    if (!navigator.geolocation) {
      setWeatherNotice(
        isHindi ? 'इस ब्राउज़र में GPS लोकेशन समर्थित नहीं है।' : 'GPS location is not supported in this browser.'
      );
      return;
    }

    setLocatingGps(true);
    setWeatherNotice('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await api.get('/weather/live', {
            params: { lat: latitude, lon: longitude }
          });
          setLiveWeather(res.data);
          if (res.data?.state) {
            setFormData((prev) => ({
              ...prev,
              state: res.data.state,
              annual_rainfall: res.data.annual_rainfall_benchmark_mm ?? prev.annual_rainfall
            }));
            setWeatherNotice(
              isHindi
                ? `GPS द्वारा नजदीकी राज्य "${translateState(res.data.state)}" और वर्षा (${res.data.annual_rainfall_benchmark_mm} mm) सेट किया गया।`
                : `Auto-selected nearest state "${res.data.state}" via GPS (${res.data.annual_rainfall_benchmark_mm} mm rain benchmark).`
            );
          }
        } catch (err) {
          console.warn('GPS location lookup failed:', err);
          setWeatherNotice(isHindi ? 'GPS लोकेशन से मौसम प्राप्त नहीं हो सका।' : 'Unable to resolve weather from GPS location.');
        } finally {
          setLocatingGps(false);
        }
      },
      () => {
        setWeatherNotice(
          isHindi
            ? 'GPS अनुमति अस्वीकृत — कृपया सूची से अपना राज्य चुनें।'
            : 'Location access denied — please select your state manually.'
        );
        setLocatingGps(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
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

        // Prepopulate based on location state (e.g. from /map or Dashboard voice) or defaults
        const defaultCrop = location.state?.presetCrop && crops.includes(location.state.presetCrop)
          ? location.state.presetCrop
          : crops.includes('Rice') ? 'Rice' : crops[0] || 'Rice';

        const defaultState = location.state?.presetState && states.includes(location.state.presetState)
          ? location.state.presetState
          : states.includes('Punjab') ? 'Punjab' : states[0] || 'Punjab';

        const defaultSeason = location.state?.presetSeason && seasons.includes(location.state.presetSeason)
          ? location.state.presetSeason
          : seasons.includes('Kharif') ? 'Kharif' : seasons[0] || 'Kharif';

        setFormData((prev) => ({
          ...prev,
          crop: defaultCrop,
          state: defaultState,
          season: defaultSeason
        }));

        // Automatically fetch live climate for initial state (preserve spoken rainfall if provided)
        fetchLiveWeather(defaultState, Boolean(location.state?.presetRainfall));
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
      if (mode === 'recommend') {
        const res = await api.post('/recommend-crops', {
          state: formData.state,
          season: formData.season,
          area: formData.area,
          annual_rainfall: formData.annual_rainfall,
          fertilizer: formData.fertilizer,
          pesticide: formData.pesticide,
          crop_year: formData.crop_year,
          top_n: 5
        });
        setRecommendationResult(res.data);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      } else {
        const res = await api.post('/predict', formData);
        navigate(`/predict/result/${res.data.prediction_id}`, { state: { prediction: res.data } });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        (mode === 'recommend'
          ? 'Failed to generate crop recommendations. Please check inputs.'
          : 'Failed to generate prediction. Please check inputs.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePredictRecommendedCrop = async (cropName) => {
    setError('');
    setRecommendingCropRun(cropName);
    try {
      const payload = { ...formData, crop: cropName };
      const res = await api.post('/predict', payload);
      navigate(`/predict/result/${res.data.prediction_id}`, { state: { prediction: res.data } });
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to run detailed prediction for ${cropName}.`);
    } finally {
      setRecommendingCropRun('');
    }
  };

  const handleVoiceInput = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus(
        isHindi
          ? 'इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है (Chrome या Edge का उपयोग करें)।'
          : 'Voice input is not supported in this browser (try Chrome or Edge).'
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setVoiceStatus(isHindi ? 'सुन रहा हूँ... फसल, राज्य, मौसम या क्षेत्रफल बोलें' : 'Listening... speak crop, state, season, or area');

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setVoiceTranscript(transcript);
      const { updates, matchedFields } = parseAgriVoiceTranscript(transcript, categories);

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({ ...prev, ...updates }));
        if (updates.state) {
          fetchLiveWeather(updates.state);
        }
        setVoiceStatus(
          isHindi
            ? `लागू किया गया: ${matchedFields.join(', ')}`
            : `Applied from voice: ${matchedFields.join(', ')}`
        );
      } else {
        setVoiceStatus(
          isHindi
            ? 'कोई ज्ञात फ़ील्ड नहीं मिला — उदाहरण: "50 हेक्टेयर चावल पंजाब खरीफ"'
            : 'No known parameters matched — try e.g. "50 hectare Rice Punjab Kharif"'
        );
      }
    };

    recognition.onerror = () => {
      setVoiceStatus(isHindi ? 'माइक्रोफ़ोन त्रुटि या अनुमति अस्वीकृत' : 'Microphone error or permission denied');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  // Auto-trigger voice listening if navigated from Dashboard "Voice Predict"
  useEffect(() => {
    if (!loadingMetadata && location.state?.startVoice) {
      handleVoiceInput();
      window.history.replaceState({}, document.title);
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [loadingMetadata]);

  if (loadingMetadata) {
    return <LoadingSpinner message="Loading agricultural categories and regional parameters..." />;
  }

  // Calculate live agronomic intensities
  const fertPerHa = formData.area > 0 ? (formData.fertilizer / formData.area).toFixed(1) : 0;
  const pestPerHa = formData.area > 0 ? (formData.pesticide / formData.area).toFixed(2) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sprout className="w-3.5 h-3.5" />
            <span>{isHindi ? 'मशीन लर्निंग इनफेरेंस' : 'Production ML Inference'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'recommend'
              ? (isHindi ? 'सर्वश्रेष्ठ फसल सलाहकार (टॉप-5 लाभ और उपज)' : 'Best Crop Recommender (Top-5 Profit & Yield)')
              : t('predict_header_title', 'Agricultural Yield Prediction Lab')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'recommend'
              ? (isHindi
                ? 'अपना राज्य, मौसम, क्षेत्रफल, वर्षा और खाद दर्ज करें — हम आपकी ज़मीन के लिए टॉप-5 सबसे लाभदायक फसलें रैंक करेंगे।'
                : 'Enter your state, season, land area, rainfall, and inputs — our ML + CACP MSP engine ranks the top 5 most profitable crops.')
              : (isHindi
                ? 'अपने कृषि और पर्यावरणीय पैरामीटर दर्ज करें। हमारा प्रशिक्षित रैंडम फॉरेस्ट मॉडल टन/हेक्टेयर में सटीक उपज का अनुमान लगाएगा।'
                : 'Input your agricultural and environmental parameters. Our trained Random Forest pipeline will generate an empirical yield forecast in tonnes/hectare.')}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200 shadow-xs self-start md:self-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('single');
              setError('');
            }}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'single'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>{isHindi ? 'एकल फसल पूर्वानुमान' : 'Single Crop'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('recommend');
              setError('');
            }}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'recommend'
              ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{isHindi ? 'टॉप-5 फसल सलाहकार' : 'Top-5 Recommender'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Voice Query Input Assistant */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
            <Mic className="w-4 h-4 text-emerald-600" />
            <span>{isHindi ? 'वॉयस-आधारित फ़ॉर्म इनपुट (Voice Query)' : 'Voice-Assisted Parameter Input'}</span>
          </div>
          <p className="text-[11px] text-emerald-800/80">
            {voiceStatus ||
              (isHindi
                ? 'उदाहरण बोलें: "50 hectare Rice Punjab Kharif"'
                : 'Try speaking: "50 hectare Rice Punjab Kharif 1100 mm"')}
          </p>
          {voiceTranscript && (
            <p className="text-[11px] text-slate-600 italic">“{voiceTranscript}”</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex-shrink-0 ${isListening
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isListening ? (isHindi ? 'रोकें (सुन रहा है)' : 'Stop Listening') : (isHindi ? 'बोलकर भरें' : 'Speak Inputs')}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Crop & Regional Location */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'recommend'
                ? (isHindi ? '1. भौगोलिक स्थिति और बुवाई का मौसम' : '1. Geographic Location & Cropping Season')
                : (isHindi ? '1. फसल एवं भौगोलिक स्थिति' : '1. Crop & Geographic Location')}
            </h3>
          </div>

          <div className={`grid grid-cols-1 ${mode === 'recommend' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-5`}>
            {mode !== 'recommend' && (
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
            )}

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('predict_state_label', 'State / Region')}
                </label>
                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={handleUseGpsLocation}
                    disabled={locatingGps}
                    className="text-[11px] text-teal-700 hover:text-teal-800 font-bold flex items-center space-x-1 disabled:opacity-60"
                    title={isHindi ? 'अपनी GPS लोकेशन से राज्य चुनें' : 'Auto-detect nearest Indian state via GPS'}
                  >
                    <Navigation className={`w-3 h-3 ${locatingGps ? 'animate-pulse' : ''}`} />
                    <span>{locatingGps ? (isHindi ? 'खोज...' : 'Locating...') : (isHindi ? 'GPS लोकेशन' : 'Use My GPS Location')}</span>
                  </button>
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

          {/* Live Open-Meteo Meteorological Snapshot Widget */}
          {liveWeather && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-blue-50/80 border border-emerald-200/90 shadow-sm space-y-3">
              {/* Header: Icon, State Title, Status Pill */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
                    <CloudSun className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        {isHindi ? 'लाइव मौसम विवरण' : 'Live Meteorological Snapshot'}
                        <span className="text-emerald-700 ml-1">({isHindi ? translateState(liveWeather.state) : liveWeather.state})</span>
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {liveWeather.weather_description || 'Clear sky'} • {isHindi ? 'ओपन-मेटियो उपग्रह डेटा' : 'Recorded via Open-Meteo Geospatial Coordinates'}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
                  {liveWeather.is_live ? 'Open-Meteo Live' : 'IMD Climate'}
                </span>
              </div>

              {/* 3 Dedicated Structured Metric Tiles (Grid 3 cols) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2.5 border-t border-emerald-100/90">
                {/* Metric 1: Temperature */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/90 border border-amber-200/60 shadow-xs flex items-center space-x-2 sm:space-x-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      {isHindi ? 'तापमान' : 'Temp'}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">
                      {liveWeather.temperature_c}°C
                    </span>
                  </div>
                </div>

                {/* Metric 2: Humidity */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/90 border border-blue-200/60 shadow-xs flex items-center space-x-2 sm:space-x-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      {isHindi ? 'आर्द्रता' : 'Humidity'}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">
                      {liveWeather.relative_humidity_pct}%
                    </span>
                  </div>
                </div>

                {/* Metric 3: IMD Rainfall Benchmark */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/90 border border-teal-200/60 shadow-xs flex items-center space-x-2 sm:space-x-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-500/15 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <CloudRain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      {isHindi ? 'आईएमडी वर्षा' : 'Rain Benchmark'}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
                      {liveWeather.annual_rainfall_benchmark_mm} mm
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Day Spraying / Irrigation Advisory Alert */}
              {liveWeather.spray_advisory && (
                <div
                  className={`p-2.5 rounded-xl border text-[11px] flex items-start space-x-2 ${liveWeather.spray_advisory.spray_status === 'DELAY_SPRAY'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : liveWeather.spray_advisory.spray_status === 'CAUTION' || liveWeather.spray_advisory.spray_status === 'IRRIGATION_ALERT'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold">
                      {isHindi ? 'स्प्रे / सिंचाई सलाह:' : 'Spray & Irrigation Advisory:'}{' '}
                    </span>
                    <span>
                      {isHindi ? liveWeather.spray_advisory.advisory_hi : liveWeather.spray_advisory.advisory_en}
                    </span>
                  </div>
                </div>
              )}

              {/* Compact 7-Day Rain & Min/Max Temp Forecast */}
              {Array.isArray(liveWeather.forecast_7_days) && liveWeather.forecast_7_days.length > 0 && (
                <div className="pt-2 border-t border-emerald-100/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="inline-flex items-center space-x-1">
                      <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isHindi ? '7-दिवसीय वर्षा और तापमान पूर्वानुमान' : '7-Day Rain & Min/Max Temp Forecast'}</span>
                    </span>
                    <span className="text-sky-700">
                      {isHindi ? 'अगले 3 दिन:' : 'Next 3d:'} {liveWeather.spray_advisory?.next_3_days_rain_mm ?? 0} mm
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                    {liveWeather.forecast_7_days.map((day) => {
                      const wet = Number(day.precipitation_mm) >= 5 || Number(day.precipitation_prob_pct) >= 60;
                      return (
                        <div
                          key={day.date}
                          className={`rounded-lg p-1.5 border text-center ${wet ? 'bg-sky-50 border-sky-200' : 'bg-white/90 border-slate-200/80'
                            }`}
                        >
                          <div className="text-[10px] font-extrabold text-slate-800">{day.day_label}</div>
                          <div className="text-[11px] font-black text-slate-900">
                            {day.temp_max_c}°<span className="text-slate-400 font-semibold">/{day.temp_min_c}°</span>
                          </div>
                          <div className={`text-[10px] font-bold ${wet ? 'text-sky-700' : 'text-slate-500'}`}>
                            {day.precipitation_mm}mm
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
            className={`w-full sm:w-auto px-8 py-4 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50 ${mode === 'recommend'
              ? 'bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 hover:from-amber-600 hover:to-teal-700 shadow-emerald-600/25'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : mode === 'recommend' ? (
              <Trophy className="w-5 h-5 mr-2" />
            ) : (
              <Sprout className="w-5 h-5 mr-2" />
            )}
            {submitting
              ? mode === 'recommend'
                ? (isHindi ? 'टॉप-5 लाभदायक फसलों की गणना हो रही है...' : 'Ranking Regional Crops by Yield & MSP Profit...')
                : t('predict_submitting', 'Running Hyper-Tuned Random Forest...')
              : mode === 'recommend'
                ? (isHindi ? 'टॉप-5 लाभदायक फसलें खोजें' : 'Find Top-5 Profitable Crops')
                : t('predict_submit_btn', 'Generate Machine Learning Prediction')}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* TOP-5 PROFITABLE CROPS RECOMMENDER RESULTS                                */}
      {/* ========================================================================= */}
      {mode === 'recommend' && recommendationResult && (
        <div ref={resultsRef} className="space-y-6 pt-4">
          {/* Context Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                <Trophy className="w-3.5 h-3.5" />
                <span>
                  {isHindi
                    ? `${recommendationResult.evaluated_crops_count} क्षेत्रीय फसलों का मूल्यांकन पूर्ण`
                    : `Evaluated ${recommendationResult.evaluated_crops_count} Regionally Suited Crops`}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight">
                {isHindi
                  ? `${translateState(recommendationResult.state)} • ${translateSeason(recommendationResult.season)} के लिए शीर्ष अनुशंसाएँ`
                  : `Top Crop Recommendations for ${recommendationResult.state} (${recommendationResult.season})`}
              </h2>
              <p className="text-xs text-emerald-100/80">
                {recommendationResult.area_hectares} ha • {recommendationResult.annual_rainfall_mm} mm {isHindi ? 'वर्षा' : 'rain'} • {recommendationResult.pricing_source}
              </p>
            </div>
          </div>

          {/* Head-to-Head Spotlight: Best Profit Crop vs Best Yield Crop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Best Profit Crop Card */}
            {recommendationResult.best_profit_crop && (
              <div className="bg-gradient-to-br from-amber-50 via-white to-emerald-50 rounded-2xl p-6 border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {isHindi ? 'सर्वोच्च शुद्ध लाभ फसल (Best Profit)' : 'Best Profit Crop'}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      {translateCrop(recommendationResult.best_profit_crop.crop)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {isHindi ? 'अनुमानित शुद्ध लाभ' : 'Est. Net Profit'}
                    </span>
                    <span className="text-2xl font-black text-emerald-700">
                      ₹{recommendationResult.best_profit_crop.estimated_net_return_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 block">
                      (₹{recommendationResult.best_profit_crop.estimated_net_return_lakhs} {isHindi ? 'लाख' : 'Lakhs'})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-amber-200/70 text-xs">
                  <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {isHindi ? 'अपेक्षित उपज' : 'Expected Yield'}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {recommendationResult.best_profit_crop.predicted_yield_t_ha} t/ha
                    </span>
                  </div>
                  <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {isHindi ? 'MSP / भाव' : 'MSP / Rate'}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{recommendationResult.best_profit_crop.msp_rate_per_quintal_inr}/q
                    </span>
                  </div>
                  <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {isHindi ? 'लाभ मार्जिन' : 'Profit Margin'}
                    </span>
                    <span className="font-extrabold text-emerald-700">
                      {recommendationResult.best_profit_crop.profit_margin_percent}%
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePredictRecommendedCrop(recommendationResult.best_profit_crop.crop)}
                  disabled={recommendingCropRun === recommendationResult.best_profit_crop.crop}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center transition-colors disabled:opacity-60"
                >
                  <span>{isHindi ? 'विस्तृत ML रिपोर्ट देखें' : 'Generate Full ML Prediction Report'}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            )}

            {/* Best Yield Crop Card */}
            {recommendationResult.best_yield_crop && (
              <div className="bg-gradient-to-br from-teal-50 via-white to-sky-50 rounded-2xl p-6 border-2 border-teal-300 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-100 text-teal-900 border border-teal-300">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {isHindi ? 'सर्वाधिक उपज वाली फसल (Best Yield)' : 'Best Yield Crop'}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      {translateCrop(recommendationResult.best_yield_crop.crop)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {isHindi ? 'अपेक्षित उपज' : 'Expected Yield'}
                    </span>
                    <span className="text-2xl font-black text-teal-700">
                      {recommendationResult.best_yield_crop.predicted_yield_t_ha} <span className="text-sm font-bold">t/ha</span>
                    </span>
                    <span className="text-xs font-bold text-teal-600 block">
                      {recommendationResult.best_yield_crop.total_production_tonnes.toLocaleString('en-IN')} {isHindi ? 'टन कुल' : 'tonnes total'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-teal-200/70 text-xs">
                  <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {isHindi ? 'शुद्ध लाभ' : 'Net Profit'}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{recommendationResult.best_yield_crop.estimated_net_return_lakhs} L
                    </span>
                  </div>
                  <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {isHindi ? 'MSP / भाव' : 'MSP / Rate'}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{recommendationResult.best_yield_crop.msp_rate_per_quintal_inr}/q
                    </span>
                  </div>
                  <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {isHindi ? 'स्थिति' : 'Match'}
                    </span>
                    <span className="font-extrabold text-teal-700">
                      {recommendationResult.is_same_winner
                        ? (isHindi ? 'दोनों #1 विजेता' : 'Dual Winner')
                        : (isHindi ? 'उच्चतम बायोमास' : 'Max Biomass')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePredictRecommendedCrop(recommendationResult.best_yield_crop.crop)}
                  disabled={recommendingCropRun === recommendationResult.best_yield_crop.crop}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center transition-colors disabled:opacity-60"
                >
                  <span>{isHindi ? 'विस्तृत ML रिपोर्ट देखें' : 'Generate Full ML Prediction Report'}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            )}
          </div>

          {/* Best Profit Crop vs Best Yield Crop Comparison Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
                  {isHindi
                    ? 'सर्वोच्च लाभ फसल बनाम सर्वाधिक उपज फसल तुलना चार्ट'
                    : 'Best Profit Crop vs Best Yield Crop Comparison'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHindi
                    ? 'अनुमानित शुद्ध लाभ (₹ लाख) और अपेक्षित उपज (टन/हेक्टेयर) की सीधी तुलना'
                    : 'Dual-axis comparison of Estimated Net Return (₹ Lakhs) against Predicted Yield (tonnes/ha)'}
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(recommendationResult.comparison_chart || []).map((item) => ({
                    ...item,
                    cropLabel: translateCrop(item.crop)
                  }))}
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="cropLabel"
                    tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="profit"
                    orientation="left"
                    tick={{ fill: '#059669', fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: isHindi ? 'शुद्ध लाभ (₹ लाख)' : 'Net Profit (₹ Lakhs)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#059669',
                      fontSize: 11
                    }}
                  />
                  <YAxis
                    yAxisId="yield"
                    orientation="right"
                    tick={{ fill: '#d97706', fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: isHindi ? 'उपज (t/ha)' : 'Yield (t/ha)',
                      angle: 90,
                      position: 'insideRight',
                      fill: '#d97706',
                      fontSize: 11
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1">
                          <div className="font-extrabold text-slate-900 text-sm">{d.cropLabel}</div>
                          <div className="text-emerald-700 font-bold">
                            {isHindi ? 'शुद्ध लाभ:' : 'Net Profit:'} ₹{d.estimated_net_return_inr.toLocaleString('en-IN')} ({d.estimated_net_return_lakhs} L)
                          </div>
                          <div className="text-amber-700 font-bold">
                            {isHindi ? 'अपेक्षित उपज:' : 'Expected Yield:'} {d.predicted_yield_t_ha} t/ha ({d.total_production_tonnes} t)
                          </div>
                          <div className="text-slate-600">
                            MSP / Rate: ₹{d.msp_rate_per_quintal_inr}/quintal
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <Bar
                    yAxisId="profit"
                    dataKey="estimated_net_return_lakhs"
                    name={isHindi ? 'शुद्ध लाभ (₹ लाख)' : 'Est. Net Profit (₹ Lakhs)'}
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                  <Bar
                    yAxisId="yield"
                    dataKey="predicted_yield_t_ha"
                    name={isHindi ? 'अपेक्षित उपज (t/ha)' : 'Expected Yield (t/ha)'}
                    fill="#d97706"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranked Top-5 Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {isHindi ? 'टॉप-5 सबसे अधिक लाभदायक फसलों की रैंकिंग' : 'Top-5 Most Profitable Crops Ranking'}
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {isHindi ? 'CACP MSP 2024–25 के अनुसार क्रमबद्ध' : 'Ranked by Estimated Net Return (INR)'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-5 py-3">{isHindi ? 'रैंक' : 'Rank'}</th>
                    <th className="px-5 py-3">{isHindi ? 'फसल' : 'Crop'}</th>
                    <th className="px-5 py-3">{isHindi ? 'अपेक्षित उपज' : 'Expected Yield'}</th>
                    <th className="px-5 py-3">{isHindi ? 'MSP / भाव' : 'MSP Rate'}</th>
                    <th className="px-5 py-3">{isHindi ? 'अनुमानित शुद्ध लाभ' : 'Est. Net Profit'}</th>
                    <th className="px-5 py-3 text-right">{isHindi ? 'कार्रवाई' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(recommendationResult.recommendations || []).map((rec) => (
                    <tr key={rec.crop} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${rec.rank === 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : rec.rank === 2
                              ? 'bg-slate-200 text-slate-800'
                              : rec.rank === 3
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                          #{rec.rank}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{translateCrop(rec.crop)}</div>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {rec.suitability}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-extrabold text-slate-900">{rec.predicted_yield_t_ha} t/ha</div>
                        <div className="text-[11px] text-slate-500">
                          {rec.total_production_tonnes.toLocaleString('en-IN')} {isHindi ? 'टन' : 'tonnes'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700">
                        ₹{rec.msp_rate_per_quintal_inr.toLocaleString('en-IN')}/q
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-black text-emerald-700">
                          ₹{rec.estimated_net_return_inr.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ₹{rec.estimated_net_return_lakhs} L • {rec.profit_margin_percent}% margin
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => handlePredictRecommendedCrop(rec.crop)}
                          disabled={recommendingCropRun === rec.crop}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                        >
                          {recommendingCropRun === rec.crop ? '...' : isHindi ? 'रिपोर्ट' : 'Full Report'}
                        </button>
                        <Link
                          to="/simulator"
                          state={{
                            crop: rec.crop,
                            state: recommendationResult.state,
                            season: recommendationResult.season,
                            area: formData.area,
                            annual_rainfall: formData.annual_rainfall,
                            fertilizer: formData.fertilizer,
                            pesticide: formData.pesticide
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                          title="Simulate What-If Economics"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                          {isHindi ? 'सिमुलेट' : 'Simulate'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictPage;
