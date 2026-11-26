import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { StatCard, LoadingSpinner } from '../components/common/StatCard';
import { parseAgriVoiceTranscript } from '../utils/voiceParser';
import {
  Sprout,
  Award,
  TrendingUp,
  ArrowUpRight,
  Database,
  CloudSun,
  Droplets,
  Thermometer,
  Map,
  Sparkles,
  Wheat,
  Info,
  RefreshCw,
  MapPin,
  Wind,
  Mic,
  MicOff,
  X,
  Navigation,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

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
  if (weather.spray_advisory) {
    return isHindi ? weather.spray_advisory.advisory_hi : weather.spray_advisory.advisory_en;
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
  const navigate = useNavigate();
  const { t, isHindi, translateCrop, translateSeason, translateState } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [statesList, setStatesList] = useState(DEFAULT_STATES);
  const [datasetCategories, setDatasetCategories] = useState({ crops: [], states: DEFAULT_STATES, seasons: [] });
  const [selectedState, setSelectedState] = useState(
    () => localStorage.getItem('agritech_weather_state') || 'Punjab'
  );
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [loading, setLoading] = useState(true);
  const skipNextWeatherFetchRef = useRef(false);

  // In-place Dashboard Voice Assistant state
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [voiceParsed, setVoiceParsed] = useState(null);
  const [voicePredicting, setVoicePredicting] = useState(false);
  const recognitionRef = useRef(null);

  const handleDashboardVoice = () => {
    setVoiceOpen(true);
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
    setVoiceParsed(null);
    setVoiceStatus(
      isHindi
        ? 'सुन रहा हूँ... उदाहरण बोलें: "50 हेक्टेयर चावल पंजाब खरीफ"'
        : 'Listening... try saying: "50 hectare Rice Punjab Kharif 1100 mm"'
    );

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setVoiceTranscript(transcript);
      const { updates, matchedFields } = parseAgriVoiceTranscript(transcript, datasetCategories);
      if (Object.keys(updates).length > 0) {
        setVoiceParsed(updates);
        if (updates.state && statesList.includes(updates.state)) {
          setSelectedState(updates.state);
        }
        setVoiceStatus(
          isHindi
            ? `पहचाना गया: ${matchedFields.join(' • ')}`
            : `Detected: ${matchedFields.join(' • ')}`
        );
      } else {
        setVoiceStatus(
          isHindi
            ? 'कोई फसल/राज्य नहीं मिला — उदाहरण: "50 hectare Rice Punjab Kharif"'
            : 'No crop/state matched — try e.g. "50 hectare Rice Punjab Kharif"'
        );
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceStatus(isHindi ? 'माइक्रोफ़ोन त्रुटि या अनुमति अस्वीकृत' : 'Microphone error or permission denied');
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const handleVoiceInstantPredict = async () => {
    if (!voiceParsed) return;
    setVoicePredicting(true);
    try {
      const targetState = voiceParsed.state || selectedState || 'Punjab';
      const rainFallback = Number(liveWeather?.annual_rainfall_benchmark_mm ?? 1100);
      const areaVal = Number(voiceParsed.area ?? 50);
      const payload = {
        crop: voiceParsed.crop || 'Rice',
        state: targetState,
        season: voiceParsed.season || 'Kharif',
        area: areaVal,
        annual_rainfall: Number(voiceParsed.annual_rainfall ?? rainFallback),
        fertilizer: Number(voiceParsed.fertilizer ?? Math.round(areaVal * 150)),
        pesticide: Number(voiceParsed.pesticide ?? Math.round(areaVal * 3.5)),
        crop_year: 2024
      };
      const res = await api.post('/predict', payload);
      navigate(`/predict/result/${res.data.prediction_id}`, { state: { prediction: res.data } });
    } catch (err) {
      setVoiceStatus(err.response?.data?.detail || (isHindi ? 'पूर्वानुमान विफल रहा' : 'Instant prediction failed'));
    } finally {
      setVoicePredicting(false);
    }
  };

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

  const handleUseGpsLocation = () => {
    if (!navigator.geolocation) {
      setWeatherError(
        isHindi ? 'इस ब्राउज़र में GPS लोकेशन समर्थित नहीं है।' : 'GPS location is not supported in this browser.'
      );
      return;
    }

    setLocatingGps(true);
    setWeatherError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await api.get('/weather/live', {
            params: { lat: latitude, lon: longitude }
          });
          setLiveWeather(res.data);
          if (res.data?.state && res.data.state !== selectedState) {
            skipNextWeatherFetchRef.current = true;
            localStorage.setItem('agritech_weather_state', res.data.state);
            setSelectedState(res.data.state);
          }
        } catch (err) {
          console.error('GPS weather lookup failed:', err);
          setWeatherError(isHindi ? 'GPS से मौसम प्राप्त नहीं हो सका' : 'Failed to fetch weather from GPS location');
        } finally {
          setLocatingGps(false);
        }
      },
      () => {
        setWeatherError(
          isHindi
            ? 'GPS अनुमति अस्वीकृत या अनुपलब्ध — कृपया ऊपर से राज्य चुनें।'
            : 'Location permission denied or unavailable — please choose your state manually.'
        );
        setLocatingGps(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
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
          setDatasetCategories({
            crops: statsRes.data.crops || [],
            states: statsRes.data.states || DEFAULT_STATES,
            seasons: statsRes.data.seasons || []
          });
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
    if (skipNextWeatherFetchRef.current) {
      skipNextWeatherFetchRef.current = false;
      return;
    }
    fetchLiveWeather(selectedState);
  }, [selectedState]);

  if (loading) {
    return <LoadingSpinner message={t('loading_dashboard', 'Aggregating agricultural dashboard & telemetry...')} />;
  }

  const kpi = analytics?.kpi || {};
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

        {/* Content Container: Clean Unified Hero Layout */}
        <div className="relative z-10 p-6 sm:p-8 md:p-9 space-y-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              {t('dashboard_title', 'KrishiPulse.AI Workspace')}
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

          {/* Unified Single-Row Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to="/predict"
              className="inline-flex items-center justify-center px-5 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-950/30 transition-all duration-200 whitespace-nowrap"
            >
              <Sprout className="w-4 h-4 mr-2" />
              {t('new_prediction', 'New Prediction')}
            </Link>

            <button
              type="button"
              onClick={handleDashboardVoice}
              className={`inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 font-bold text-xs sm:text-sm rounded-2xl border backdrop-blur-md transition-all duration-200 whitespace-nowrap ${
                isListening
                  ? 'bg-red-500/85 hover:bg-red-500 text-white border-red-300 shadow-lg'
                  : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 border-amber-300/40'
              }`}
              title={isHindi ? 'बोलकर उपज का अनुमान लगाएं' : 'Predict by speaking parameters'}
            >
              {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2 text-amber-300" />}
              <span>{isListening ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'बोलकर पूछें' : 'Voice Predict')}</span>
            </button>

            <Link
              to="/map"
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm rounded-2xl border border-white/25 backdrop-blur-md transition-all duration-200 whitespace-nowrap"
            >
              <Map className="w-4 h-4 mr-2 text-emerald-300" />
              <span>{t('yield_map', 'Yield Map')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1B. LIVE VOICE PREDICT ASSISTANT PANEL (OPENS ON VOICE CLICK)             */}
      {/* ========================================================================= */}
      {voiceOpen && (
        <div className="rounded-2xl glass-card-agri p-4 sm:p-5 border-2 border-amber-300/80 shadow-lg space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${
                isListening ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-br from-amber-500 to-orange-500'
              }`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHindi ? 'वॉयस-आधारित स्मार्ट पूर्वानुमान' : 'KrishiPulse Voice Assistant'}
                </h3>
                <p className="text-xs text-slate-600">{voiceStatus}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDashboardVoice}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isListening ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'फिर से बोलें' : 'Speak Again')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (recognitionRef.current) recognitionRef.current.stop();
                  setIsListening(false);
                  setVoiceOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close voice panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {voiceTranscript && (
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
              “{voiceTranscript}”
            </div>
          )}

          {voiceParsed && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-100">
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                {voiceParsed.crop && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    🌾 {translateCrop(voiceParsed.crop)}
                  </span>
                )}
                {voiceParsed.state && (
                  <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800">
                    📍 {translateState(voiceParsed.state)}
                  </span>
                )}
                {voiceParsed.season && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
                    ☀️ {translateSeason(voiceParsed.season)}
                  </span>
                )}
                {voiceParsed.area && (
                  <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800">
                    📐 {voiceParsed.area} ha
                  </span>
                )}
                {voiceParsed.annual_rainfall && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                    🌧️ {voiceParsed.annual_rainfall} mm
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/predict"
                  state={{
                    presetCrop: voiceParsed.crop,
                    presetState: voiceParsed.state,
                    presetSeason: voiceParsed.season,
                    presetArea: voiceParsed.area,
                    presetRainfall: voiceParsed.annual_rainfall,
                    presetFertilizer: voiceParsed.fertilizer,
                    presetPesticide: voiceParsed.pesticide,
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold transition-colors"
                >
                  {isHindi ? 'फ़ॉर्म में खोलें' : 'Edit in Lab'}
                </Link>
                <button
                  type="button"
                  onClick={handleVoiceInstantPredict}
                  disabled={voicePredicting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md disabled:opacity-60 transition-all"
                >
                  {voicePredicting
                    ? (isHindi ? 'गणना हो रही है...' : 'Predicting...')
                    : (isHindi ? 'तुरंत अनुमान देखें →' : 'Instant Predict →')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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

            {/* GPS Auto-Location Button */}
            <button
              type="button"
              onClick={handleUseGpsLocation}
              disabled={locatingGps}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs transition-colors disabled:opacity-60"
              title={isHindi ? 'अपनी GPS लोकेशन से नजदीकी राज्य चुनें' : 'Detect nearest state via GPS'}
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${locatingGps ? 'animate-pulse' : ''}`} />
              <span>{locatingGps ? (isHindi ? 'खोज...' : 'Locating...') : (isHindi ? 'मेरी GPS लोकेशन' : 'Use My GPS Location')}</span>
            </button>

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

        {/* Daily Tip & Spraying Warning Alert */}
        <div
          className={`mt-4 p-3.5 rounded-xl border-l-4 text-xs flex items-start space-x-2.5 ${
            liveWeather?.spray_advisory?.spray_status === 'DELAY_SPRAY'
              ? 'bg-red-50/90 border-red-500 text-red-900'
              : liveWeather?.spray_advisory?.spray_status === 'CAUTION' || liveWeather?.spray_advisory?.spray_status === 'IRRIGATION_ALERT'
                ? 'bg-amber-50/90 border-amber-500 text-amber-900'
                : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500 text-slate-700'
          }`}
        >
          {liveWeather?.spray_advisory?.spray_status === 'DELAY_SPRAY' || liveWeather?.spray_advisory?.spray_status === 'CAUTION' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <strong className="font-bold">
              {liveWeather?.spray_advisory?.spray_status === 'DELAY_SPRAY'
                ? (isHindi ? 'छिड़काव एवं वर्षा चेतावनी: ' : 'Spraying & Rain Warning: ')
                : t('advisory_tip_title', 'Agricultural Advisory for Today: ')}{' '}
            </strong>
            <span>{dynamicAdvisory || t('advisory_tip_content', 'Recommended: Maintain optimal NPK nitrogen balance and monitor soil moisture prior to grain filling.')}</span>
          </div>
        </div>

        {/* 7-Day Agro-Weather Forecast Strip */}
        {Array.isArray(liveWeather?.forecast_7_days) && liveWeather.forecast_7_days.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-emerald-100/80 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? '7-दिवसीय वर्षा एवं तापमान पूर्वानुमान' : '7-Day Rain & Temperature Forecast'}</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-600">
                <span>
                  {isHindi ? 'अगले 3 दिन वर्षा:' : 'Next 3d Rain:'}{' '}
                  <strong className="text-sky-700">{liveWeather.spray_advisory?.next_3_days_rain_mm ?? 0} mm</strong>
                </span>
                <span>
                  {isHindi ? 'साप्ताहिक योग:' : '7-Day Total:'}{' '}
                  <strong className="text-emerald-700">{liveWeather.spray_advisory?.weekly_rain_total_mm ?? 0} mm</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {liveWeather.forecast_7_days.map((day) => {
                const isWet = Number(day.precipitation_mm) >= 5 || Number(day.precipitation_prob_pct) >= 60;
                return (
                  <div
                    key={day.date}
                    className={`rounded-xl p-2.5 border text-center transition-colors ${
                      isWet
                        ? 'bg-sky-50/90 border-sky-200'
                        : 'bg-white/85 border-emerald-100'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold text-slate-800">{day.day_label}</div>
                    <div className="text-[10px] text-slate-500 truncate mb-1" title={day.weather_description}>
                      {day.weather_description}
                    </div>
                    <div className="text-xs font-black text-slate-900">
                      {day.temp_max_c}° <span className="text-slate-400 font-semibold">/ {day.temp_min_c}°</span>
                    </div>
                    <div className={`mt-1 inline-flex items-center justify-center space-x-1 text-[10px] font-bold ${
                      isWet ? 'text-sky-700' : 'text-slate-500'
                    }`}>
                      <CloudRain className="w-3 h-3" />
                      <span>{day.precipitation_mm}mm ({day.precipitation_prob_pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
      {/* 4. RECENT PREDICTIONS TABLE (GLASSMORPHISM WITH BILINGUAL ROWS)           */}
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

        {recentPredictions.length > 0 ? (
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
                {recentPredictions.map((pred) => (
                  <tr key={pred.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-2.5 flex-shrink-0">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <span>{translateCrop(pred.crop)}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{translateState(pred.state)}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10">
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
                    ? 'अपना पहला फसल उपज पूर्वानुमान चलाने के लिए नीचे एक त्वरित प्रीसेट चुनें, बोलकर पूछें, या कस्टम फ़ॉर्म खोलें।'
                    : 'Start your first ML crop yield prediction with a 1-click regional preset, voice input, or the custom lab.'}
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
                <button
                  type="button"
                  onClick={handleDashboardVoice}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  {isHindi ? 'बोलकर भरें' : 'Voice Quick Predict'}
                </button>
                <Link
                  to="/predict"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Sprout className="w-3.5 h-3.5 mr-1.5" />
                  {t('run_first_pred', 'Run First Prediction')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
