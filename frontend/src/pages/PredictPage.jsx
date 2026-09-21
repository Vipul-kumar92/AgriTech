import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  HelpCircle
} from 'lucide-react';

const PredictPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({
    crops: [],
    states: [],
    seasons: []
  });
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    crop: 'Rice',
    season: 'Kharif',
    state: 'Punjab',
    area: 50.0,
    annual_rainfall: 1100.0,
    fertilizer: 7500.0,
    pesticide: 175.0,
    crop_year: 2024
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch unique categories directly from backend dataset stats
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.get('/dataset/stats');
        setCategories({
          crops: res.data.crops || [],
          states: res.data.states || [],
          seasons: res.data.seasons || []
        });
        if (res.data.crops?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            crop: res.data.crops.includes('Rice') ? 'Rice' : res.data.crops[0],
            state: res.data.states.includes('Punjab') ? 'Punjab' : res.data.states[0],
            season: res.data.seasons.includes('Kharif') ? 'Kharif' : res.data.seasons[0]
          }));
        }
      } catch (err) {
        console.error('Failed to load dataset categories:', err);
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

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
          <span>Production ML Inference</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Crop Yield Prediction
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Input your agricultural and environmental parameters. Our trained Random Forest pipeline will generate an empirical yield forecast in <span className="font-semibold text-emerald-700">tonnes/hectare</span>.
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
            <h3 className="text-base font-bold text-slate-900">1. Crop & Geographic Location</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Crop Species
              </label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {categories.crops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">54 distinct varieties supported</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                State / Region
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {categories.states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">30 Indian States & UTs</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Cropping Season
              </label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {categories.seasons.map((sn) => (
                  <option key={sn} value={sn}>
                    {sn}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Kharif, Rabi, Whole Year, etc.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Cultivated Land & Weather */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <CloudRain className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">2. Land Extent & Climate Precipitation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Cultivated Area (Hectares)
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
              <p className="text-[11px] text-slate-400 mt-1">1 Hectare ≈ 2.471 Acres</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Annual Cumulative Rainfall (mm)
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
              <p className="text-[11px] text-slate-400 mt-1">India national average: 600mm – 2200mm</p>
            </div>
          </div>
        </div>

        {/* Section 3: Agricultural Chemical Management */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Beaker className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">3. Agricultural Inputs & Management</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Total Fertilizer Applied (kg)
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
                <span>Calculated Fertilizer Intensity:</span>
                <span className="font-bold">{fertPerHa} kg/ha</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Total Pesticide Applied (kg)
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
                <span>Calculated Pesticide Intensity:</span>
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
            {submitting ? 'Executing Machine Learning Pipeline...' : 'Generate Prediction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictPage;
