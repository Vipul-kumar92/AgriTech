import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  Sliders,
  CloudRain,
  Beaker,
  Sprout,
  Activity,
  TrendingUp,
  AlertCircle,
  Sparkles
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
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            {isHindi ? 'परिदृश्य पैरामीटर्स' : 'Scenario Parameters'}
          </h3>

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
          {/* Base Yield Callout */}
          <div className="bg-emerald-50/85 backdrop-blur-sm rounded-2xl p-5 border border-emerald-200 flex items-center justify-between shadow-xs">
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
            <div className="text-right text-xs text-emerald-700">
              <span className="font-bold">{isHindi ? 'कुल अनुमानित फसल: ' : 'Total Harvest: '}</span>
              {((simulation?.base_yield_t_ha || 0) * params.area).toFixed(1)} {isHindi ? 'टन' : 'tonnes'}
            </div>
          </div>

          {/* Curve 1: Rainfall Shock Sensitivity */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <CloudRain className="w-4 h-4 mr-1.5 text-blue-600" />
                  {isHindi
                    ? 'वर्षा आघात संवेदनशीलता वक्र (-40% सूखा से +40% अतिरिक्त मानसून)'
                    : 'Precipitation Shock Curve (-40% Drought to +40% Surplus Monsoon)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isHindi
                    ? 'जलवायु आघात परिदृश्यों में अनुमानित उपज प्रतिक्रिया'
                    : 'Predicted yield response across climate shock scenarios'}
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulation?.rainfall_sensitivity_curve || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="scenario" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit=" t/ha" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val) => [`${val} t/ha`, isHindi ? 'उपज' : 'Yield']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted_yield_t_ha"
                    stroke="#0284c7"
                    strokeWidth={3}
                    dot={{ fill: '#0284c7', r: 4 }}
                    activeDot={{ r: 6 }}
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
                    ? 'उर्वरक तीव्रता प्रतिक्रिया (50 kg/ha से 250 kg/ha)'
                    : 'Fertilizer Intensity Response (50 kg/ha to 250 kg/ha)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isHindi
                    ? 'खाद घनत्व परिवर्तन के अनुसार उपज में वृद्धि / स्थिरता'
                    : 'Yield output as fertilizer density changes'}
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulation?.fertilizer_sensitivity_curve || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fertilizer_intensity_kg_ha" unit=" kg/ha" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit=" t/ha" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val) => [`${val} t/ha`, isHindi ? 'उपज' : 'Yield']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted_yield_t_ha"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ fill: '#059669', r: 4 }}
                    activeDot={{ r: 6 }}
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
