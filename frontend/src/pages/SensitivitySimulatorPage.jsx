import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/StatCard';
import { parseAgriVoiceTranscript } from '../utils/voiceParser';
import {
  Sliders,
  CloudRain,
  Beaker,
  Sprout,
  Activity,
  TrendingUp,
  AlertCircle,
  Sparkles,
  IndianRupee,
  Mic,
  MicOff,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Target,
  CloudSun
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';

const DEFAULT_SIM_PARAMS = {
  crop: 'Wheat',
  state: 'Punjab',
  season: 'Rabi',
  area: 50.0,
  annual_rainfall: 700.0,
  fertilizer: 7000.0,
  pesticide: 150.0
};

const SensitivitySimulatorPage = () => {
  const navigate = useNavigate();
  const { t, isHindi, translateCrop, translateSeason, translateState } = useLanguage();
  const [params, setParams] = useState(DEFAULT_SIM_PARAMS);

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncingWeather, setSyncingWeather] = useState(false);
  const [categories, setCategories] = useState({ crops: [], states: [], seasons: [] });
  const [isListening, setIsListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const recognitionRef = useRef(null);

  // Derive actionable decision-support insights directly from live simulation curves
  const insights = useMemo(() => {
    const rainCurve = simulation?.rainfall_sensitivity_curve || [];
    const fertCurve = simulation?.fertilizer_sensitivity_curve || [];
    if (!rainCurve.length || !fertCurve.length) return null;

    const basePt = rainCurve.find((p) => p.scenario === '+0% Rain') || rainCurve[4];
    const droughtPt = rainCurve.find((p) => p.scenario === '-30% Rain') || rainCurve[1];
    const bestRainPt = [...rainCurve].sort((a, b) => b.predicted_yield_t_ha - a.predicted_yield_t_ha)[0];
    const optimalFertPt = [...fertCurve].sort((a, b) => b.net_farm_return_lakhs - a.net_farm_return_lakhs)[0];

    const droughtYieldDeltaPct =
      basePt?.predicted_yield_t_ha > 0
        ? (((droughtPt.predicted_yield_t_ha - basePt.predicted_yield_t_ha) / basePt.predicted_yield_t_ha) * 100).toFixed(1)
        : '0.0';
    const droughtProfitDelta = +(droughtPt.net_farm_return_lakhs - basePt.net_farm_return_lakhs).toFixed(2);

    return {
      droughtYieldDeltaPct,
      droughtProfitDelta,
      bestRainPt,
      optimalFertPt,
    };
  }, [simulation]);

  const handleSyncStateWeather = async (targetState) => {
    const stateToUse = targetState || params.state;
    setSyncingWeather(true);
    try {
      const res = await api.get('/weather/live', { params: { state: stateToUse } });
      if (res.data?.annual_rainfall_benchmark_mm) {
        setParams((prev) => ({
          ...prev,
          annual_rainfall: Math.round(res.data.annual_rainfall_benchmark_mm)
        }));
      }
    } catch (err) {
      console.warn('Weather sync unavailable:', err);
    } finally {
      setSyncingWeather(false);
    }
  };

  const handleVoiceScenario = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNote(isHindi ? 'वॉयस इनपुट समर्थित नहीं है' : 'Voice not supported in this browser');
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    setIsListening(true);
    setVoiceNote(isHindi ? 'सुन रहा है...' : 'Listening...');
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      const { updates, matchedFields } = parseAgriVoiceTranscript(transcript, categories);
      if (Object.keys(updates).length > 0) {
        setParams((prev) => ({ ...prev, ...updates }));
        setVoiceNote(isHindi ? `लागू: ${matchedFields.join(', ')}` : `Applied: ${matchedFields.join(', ')}`);
      } else {
        setVoiceNote(`"${transcript}"`);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceNote(isHindi ? 'माइक्रोफ़ोन त्रुटि' : 'Mic error / denied');
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.start();
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/dataset/stats');
        setCategories({
          crops: res.data.crops || [],
          states: res.data.states || [],
          seasons: res.data.seasons || []
        });
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.post('/simulate', params);
      setSimulation(res.data);
    } catch (err) {
      console.error('Failed to run simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [params]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: name === 'crop' || name === 'state' || name === 'season' ? value : parseFloat(value) || 0
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>{isHindi ? 'निर्णय समर्थन प्रयोगशाला' : 'Decision Support Laboratory'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isHindi ? 'कृषि संवेदनशीलता एवं व्हाट-इफ़ सिम्युलेटर' : 'What-If Agronomic Sensitivity Simulator'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isHindi
              ? 'मौसम संबंधी आघातों एवं कृषि इनपुट को गतिशील रूप से समायोजित कर वास्तविक समय में उपज व लाभ वक्र का अनुकरण करें।'
              : 'Stress-test climate shocks and fertilizer intensity in real time to optimize crop yield and MSP net profit.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate('/predict', {
              state: {
                presetCrop: params.crop,
                presetState: params.state,
                presetSeason: params.season,
                presetArea: params.area,
                presetRainfall: params.annual_rainfall,
                presetFertilizer: params.fertilizer,
                presetPesticide: params.pesticide,
              }
            })
          }
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex-shrink-0"
        >
          <Sprout className="w-4 h-4 mr-1.5" />
          <span>{isHindi ? 'इस परिदृश्य से प्रमाणपत्र बनाएं' : 'Generate Official Forecast'}</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </button>
      </div>

      {/* 1-Click Scenario Stress-Test Presets */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-emerald-100 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1.5">
            {isHindi ? 'त्वरित परिदृश्य:' : 'Quick Stress Tests:'}
          </span>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, annual_rainfall: Math.max(200, Math.round(p.annual_rainfall * 0.7)) }))}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
          >
            ☀️ {isHindi ? 'सूखा (-30% वर्षा)' : 'Drought Shock (-30% Rain)'}
          </button>
          <button
            type="button"
            onClick={() => handleSyncStateWeather(params.state)}
            disabled={syncingWeather}
            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-colors inline-flex items-center"
          >
            <CloudSun className="w-3.5 h-3.5 mr-1.5" />
            {syncingWeather ? (isHindi ? 'सिंक...' : 'Syncing...') : (isHindi ? 'राज्य की सामान्य वर्षा' : 'Sync State Normal Rain')}
          </button>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, annual_rainfall: Math.min(3000, Math.round(p.annual_rainfall * 1.3)) }))}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors"
          >
            🌧️ {isHindi ? 'अतिरिक्त मानसून (+30%)' : 'Heavy Monsoon (+30%)'}
          </button>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, fertilizer: Math.round(p.area * 75) }))}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
          >
            🌱 {isHindi ? 'कम खाद (75 kg/ha)' : 'Low-Input (75 kg/ha)'}
          </button>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, fertilizer: Math.min(30000, Math.round(p.area * 225)) }))}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-colors"
          >
            ⚗️ {isHindi ? 'उच्च NPK (225 kg/ha)' : 'High-NPK (225 kg/ha)'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setParams(DEFAULT_SIM_PARAMS)}
          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          {isHindi ? 'रीसेट' : 'Reset'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Interactive Control Sliders */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              {isHindi ? 'परिदृश्य पैरामीटर्स' : 'Scenario Parameters'}
            </h3>
            <button
              type="button"
              onClick={handleVoiceScenario}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                isListening
                  ? 'bg-red-600 text-white'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
              }`}
              title={isHindi ? 'बोलकर परिदृश्य बदलें' : 'Speak scenario parameters'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'बोलें' : 'Voice')}</span>
            </button>
          </div>
          {voiceNote && (
            <p className="text-[11px] text-emerald-700 font-medium -mt-3">{voiceNote}</p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {isHindi ? 'फसल' : 'Crop'}
              </label>
              <select
                name="crop"
                value={params.crop}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {categories.crops.map((c) => (
                  <option key={c} value={c}>
                    {isHindi ? translateCrop(c) : c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {isHindi ? 'राज्य' : 'State'}
              </label>
              <select
                name="state"
                value={params.state}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {categories.states.map((s) => (
                  <option key={s} value={s}>
                    {isHindi ? translateState(s) : s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {isHindi ? 'मौसम' : 'Season'}
              </label>
              <select
                name="season"
                value={params.season}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {categories.seasons.map((sn) => (
                  <option key={sn} value={sn}>
                    {isHindi ? translateSeason(sn) : sn}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">{isHindi ? 'कृषि क्षेत्रफल' : 'Cultivated Area'}</span>
                <span className="text-emerald-700 font-bold">{params.area} {isHindi ? 'हेक्टेयर' : 'ha'}</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                name="area"
                value={params.area}
                onChange={handleChange}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">{isHindi ? 'आधार वार्षिक वर्षा' : 'Base Annual Rainfall'}</span>
                <span className="text-emerald-700 font-bold">{params.annual_rainfall} mm</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                name="annual_rainfall"
                value={params.annual_rainfall}
                onChange={handleChange}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">{isHindi ? 'कुल खाद (उर्वरक)' : 'Gross Fertilizer'}</span>
                <span className="text-emerald-700 font-bold">{params.fertilizer} kg</span>
              </div>
              <input
                type="range"
                min="500"
                max="30000"
                step="500"
                name="fertilizer"
                value={params.fertilizer}
                onChange={handleChange}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isHindi ? 'तीव्रता: ' : 'Intensity: '}
                {(params.fertilizer / params.area).toFixed(1)} {isHindi ? 'किलो/हेक्टेयर' : 'kg/ha'}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">{isHindi ? 'कुल कीटनाशक' : 'Gross Pesticide'}</span>
                <span className="text-emerald-700 font-bold">{params.pesticide} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                name="pesticide"
                value={params.pesticide}
                onChange={handleChange}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isHindi ? 'तीव्रता: ' : 'Intensity: '}
                {(params.pesticide / params.area).toFixed(2)} {isHindi ? 'किलो/हेक्टेयर' : 'kg/ha'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Response Curves */}
        <div className="lg:col-span-2 space-y-6">
          {/* Base Yield & MSP Economics Callout */}
          <div className="bg-gradient-to-br from-emerald-50/95 via-white/90 to-teal-50/90 backdrop-blur-sm rounded-2xl p-5 border border-emerald-200 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    {isHindi
                      ? `सिम्युलेटेड आधार उपज (${translateCrop(params.crop)} - ${translateState(params.state)})`
                      : `Simulated Baseline (${params.crop} in ${params.state})`}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    loading
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {loading ? (isHindi ? 'सिम्युलेटिंग...' : 'Updating...') : (isHindi ? '18 परिदृश्य लाइव' : '18 Scenarios Live')}
                  </span>
                </div>
                <p className="text-3xl font-black text-emerald-900 mt-1 tabular-nums">
                  {simulation?.base_yield_t_ha || '—'}{' '}
                  <span className="text-sm font-normal text-emerald-700">
                    {isHindi ? 'टन/हेक्टेयर' : 'tonnes/hectare'}
                  </span>
                </p>
              </div>
              <div className="sm:text-right text-xs text-emerald-800 space-y-1">
                <div>
                  <span className="font-bold">{isHindi ? 'कुल अनुमानित फसल: ' : 'Total Harvest: '}</span>
                  {((simulation?.base_yield_t_ha || 0) * params.area).toFixed(1)} {isHindi ? 'टन' : 'tonnes'}
                </div>
                {simulation?.base_economics && (
                  <div className="text-[11px] text-emerald-700">
                    {isHindi ? 'MSP दर: ' : 'MSP Reference: '}
                    <span className="font-bold">₹{simulation.base_economics.msp_per_quintal_inr?.toLocaleString('en-IN')}/qtl</span>
                  </div>
                )}
              </div>
            </div>

            {simulation?.base_economics && (
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-emerald-200/70">
                <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isHindi ? 'सकल राजस्व (MSP)' : 'Gross Revenue'}
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600 mr-0.5" />
                    {simulation.base_economics.gross_revenue_lakhs} {isHindi ? 'लाख' : 'Lakhs'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isHindi ? 'रासायनिक लागत' : 'Chemical Input Cost'}
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-amber-700 mt-0.5 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                    {(simulation.base_economics.total_chemical_cost_inr / 100000).toFixed(2)} {isHindi ? 'लाख' : 'Lakhs'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isHindi ? 'शुद्ध लाभ (MSP)' : 'Est. Net Return'}
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-0.5 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                    {simulation.base_economics.estimated_net_return_lakhs} {isHindi ? 'लाख' : 'Lakhs'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actionable Optimization & Climate Risk Summary */}
          {insights && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/95 border border-emerald-200 p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      {isHindi ? 'इष्टतम उर्वरक लक्ष्य' : 'Profit-Optimal Fertilizer'}
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {insights.optimalFertPt.fertilizer_intensity_kg_ha} kg/ha{' '}
                      <span className="text-xs font-semibold text-emerald-700">
                        (₹{insights.optimalFertPt.net_farm_return_lakhs} {isHindi ? 'लाख शुद्ध लाभ' : 'L net'})
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isHindi
                        ? `अनुमानित उपज: ${insights.optimalFertPt.predicted_yield_t_ha} t/ha`
                        : `Yield at optimum: ${insights.optimalFertPt.predicted_yield_t_ha} t/ha`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setParams((p) => ({
                      ...p,
                      fertilizer: Math.min(30000, Math.max(500, Math.round(insights.optimalFertPt.fertilizer_intensity_kg_ha * p.area)))
                    }))
                  }
                  className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  {isHindi ? 'इष्टतम खाद दर लागू करें' : 'Apply Optimal Fertilizer Rate'}
                </button>
              </div>

              <div className="rounded-2xl bg-white/95 border border-amber-200 p-4 shadow-xs flex flex-col justify-between space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      {isHindi ? 'जलवायु जोखिम (-30% सूखा)' : 'Drought Stress Impact (-30% Rain)'}
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {insights.droughtYieldDeltaPct}% {isHindi ? 'उपज बदलाव' : 'yield shift'}{' '}
                      <span className={`text-xs font-bold ${insights.droughtProfitDelta < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        ({insights.droughtProfitDelta >= 0 ? '+' : ''}₹{insights.droughtProfitDelta} L)
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isHindi
                        ? `सर्वश्रेष्ठ वर्षा स्तर: ${insights.bestRainPt.scenario} (${insights.bestRainPt.predicted_yield_t_ha} t/ha)`
                        : `Peak rain scenario: ${insights.bestRainPt.scenario} (${insights.bestRainPt.predicted_yield_t_ha} t/ha)`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Curve 1: Rainfall Shock Sensitivity */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <CloudRain className="w-4 h-4 mr-1.5 text-blue-600" />
                  {isHindi
                    ? 'वर्षा आघात संवेदनशीलता वक्र एवं शुद्ध लाभ (-40% से +40%)'
                    : 'Precipitation Shock: Yield & MSP Net Return (-40% to +40%)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isHindi
                    ? 'जलवायु आघात परिदृश्यों में अनुमानित उपज और शुद्ध आय प्रतिक्रिया'
                    : 'Predicted yield (t/ha) and estimated MSP net return (₹ Lakhs) across climate shocks'}
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulation?.rainfall_sensitivity_curve || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="scenario" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="yield" width={54} domain={['auto', 'auto']} unit=" t/ha" tick={{ fontSize: 11, fill: '#0284c7' }} />
                  <YAxis yAxisId="profit" width={48} domain={['auto', 'auto']} orientation="right" unit=" L" tick={{ fontSize: 11, fill: '#d97706' }} />
                  <ReferenceLine yAxisId="yield" x="+0% Rain" stroke="#10b981" strokeDasharray="4 4" />
                  <Tooltip
                    formatter={(val, name) =>
                      name.includes('Net') || name.includes('लाभ')
                        ? [`₹${val} Lakhs`, name]
                        : [`${val} t/ha`, name]
                    }
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    yAxisId="yield"
                    type="monotone"
                    dataKey="predicted_yield_t_ha"
                    name={isHindi ? 'उपज (t/ha)' : 'Yield (t/ha)'}
                    stroke="#0284c7"
                    strokeWidth={3}
                    dot={{ fill: '#0284c7', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="profit"
                    type="monotone"
                    dataKey="net_farm_return_lakhs"
                    name={isHindi ? 'शुद्ध लाभ (₹ लाख)' : 'Net Return (₹ Lakhs)'}
                    stroke="#d97706"
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                    dot={{ fill: '#d97706', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Curve 2: Fertilizer Intensity Curve */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <Beaker className="w-4 h-4 mr-1.5 text-emerald-600" />
                  {isHindi
                    ? 'उर्वरक तीव्रता प्रतिक्रिया एवं शुद्ध लाभ (50 से 250 kg/ha)'
                    : 'Fertilizer Intensity: Yield & MSP Net Return (50–250 kg/ha)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isHindi
                    ? 'खाद घनत्व और बढ़ती लागत के अनुसार उपज व शुद्ध लाभ में बदलाव'
                    : 'Yield output vs. net return after scaling fertilizer input costs'}
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulation?.fertilizer_sensitivity_curve || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fertilizer_intensity_kg_ha" unit=" kg/ha" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="yield" width={54} domain={['auto', 'auto']} unit=" t/ha" tick={{ fontSize: 11, fill: '#059669' }} />
                  <YAxis yAxisId="profit" width={48} domain={['auto', 'auto']} orientation="right" unit=" L" tick={{ fontSize: 11, fill: '#d97706' }} />
                  {insights?.optimalFertPt && (
                    <ReferenceLine
                      yAxisId="yield"
                      x={insights.optimalFertPt.fertilizer_intensity_kg_ha}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                    />
                  )}
                  <Tooltip
                    formatter={(val, name) =>
                      name.includes('Net') || name.includes('लाभ')
                        ? [`₹${val} Lakhs`, name]
                        : [`${val} t/ha`, name]
                    }
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    yAxisId="yield"
                    type="monotone"
                    dataKey="predicted_yield_t_ha"
                    name={isHindi ? 'उपज (t/ha)' : 'Yield (t/ha)'}
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ fill: '#059669', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="profit"
                    type="monotone"
                    dataKey="net_farm_return_lakhs"
                    name={isHindi ? 'शुद्ध लाभ (₹ लाख)' : 'Net Return (₹ Lakhs)'}
                    stroke="#d97706"
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                    dot={{ fill: '#d97706', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensitivitySimulatorPage;
