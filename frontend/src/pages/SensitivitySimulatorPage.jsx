import React, { useState, useEffect, useRef } from 'react';
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
  MicOff
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const SensitivitySimulatorPage = () => {
  const { t, isHindi, translateCrop, translateSeason, translateState } = useLanguage();
  const [params, setParams] = useState({
    crop: 'Wheat',
    state: 'Punjab',
    season: 'Rabi',
    area: 50.0,
    annual_rainfall: 700.0,
    fertilizer: 7000.0,
    pesticide: 150.0
  });

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState({ crops: [], states: [], seasons: [] });
  const [isListening, setIsListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const recognitionRef = useRef(null);

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
            ? 'मौसम संबंधी आघातों एवं कृषि इनपुट को गतिशील रूप से समायोजित कर वास्तविक समय में उपज प्रतिक्रिया वक्र का अनुकरण करें।'
            : 'Dynamically adjust climate shocks and management inputs to simulate real-time crop yield response curves.'}
        </p>
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
          </div>
        </div>

        {/* Right: Dynamic Response Curves */}
        <div className="lg:col-span-2 space-y-6">
          {/* Base Yield & MSP Economics Callout */}
          <div className="bg-emerald-50/85 backdrop-blur-sm rounded-2xl p-5 border border-emerald-200 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  {isHindi
                    ? `सिम्युलेटेड आधार उपज (${translateCrop(params.crop)} - ${translateState(params.state)})`
                    : `Simulated Baseline Yield (${params.crop} in ${params.state})`}
                </p>
                <p className="text-3xl font-black text-emerald-900 mt-1">
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
                  <YAxis yAxisId="yield" unit=" t/ha" tick={{ fontSize: 11, fill: '#0284c7' }} />
                  <YAxis yAxisId="profit" orientation="right" unit=" L" tick={{ fontSize: 11, fill: '#d97706' }} />
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
                  <YAxis yAxisId="yield" unit=" t/ha" tick={{ fontSize: 11, fill: '#059669' }} />
                  <YAxis yAxisId="profit" orientation="right" unit=" L" tick={{ fontSize: 11, fill: '#d97706' }} />
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
