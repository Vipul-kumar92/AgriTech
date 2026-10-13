import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  MapPin,
  Sprout,
  CloudRain,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Layers,
  Award
} from 'lucide-react';

const AgriMapPage = () => {
  const navigate = useNavigate();
  const { t, isHindi, translateCrop, translateState } = useLanguage();
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await api.get('/map/states');
        setStates(res.data || []);
        if (res.data?.length > 0) {
          setSelectedState(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to load map state data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  if (loading) {
    return <LoadingSpinner message={isHindi ? 'क्षेत्रीय कृषि उपज एवं जलवायु डेटा लोड हो रहा है...' : 'Loading regional geographic yield data and agro-climatic tiers...'} />;
  }

  const filteredStates = states.filter((s) => {
    const matchSearch =
      s.state.toLowerCase().includes(search.toLowerCase()) ||
      s.top_crop.toLowerCase().includes(search.toLowerCase()) ||
      translateState(s.state).toLowerCase().includes(search.toLowerCase()) ||
      translateCrop(s.top_crop).toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'ALL' || s.tier.includes(tierFilter);
    return matchSearch && matchTier;
  });

  const handlePredictForState = (stateName, topCrop) => {
    navigate('/predict', {
      state: {
        presetState: stateName,
        presetCrop: topCrop
      }
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{isHindi ? 'भौगोलिक कृषि बुद्धिमत्ता' : 'Geospatial Agricultural Intelligence'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isHindi ? 'भारत का कृषि उपज मानचित्र' : 'Agricultural Yield Map of India'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {isHindi
            ? '30 भारतीय राज्यों में क्षेत्रीय फसल उत्पादकता स्तर, ऐतिहासिक बायोमास और प्राथमिक फसलों का अन्वेषण करें।'
            : 'Explore regional crop productivity tiers across 30 Indian states, historical biomass outputs, and local primary crops.'}
        </p>
      </div>

      {/* Productivity Tier Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setTierFilter('High')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            tierFilter === 'High' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20' : 'bg-white/80 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {isHindi ? 'उच्च उत्पादकता क्षेत्र' : 'High Productivity Zone'}
            </span>
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">&gt; 6.0 t/ha</p>
          <p className="text-xs text-slate-500 mt-1">
            {isHindi ? 'गन्ना, आलू व बागवानी गहन राज्य' : 'States with intensive sugarcane, potato, and horticulture'}
          </p>
        </div>

        <div
          onClick={() => setTierFilter('Moderate')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            tierFilter === 'Moderate' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20' : 'bg-white/80 border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {isHindi ? 'मध्यम उत्पादकता क्षेत्र' : 'Moderate Productivity'}
            </span>
            <span className="w-3 h-3 rounded-full bg-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">2.5 – 6.0 t/ha</p>
          <p className="text-xs text-slate-500 mt-1">
            {isHindi ? 'सिंचित अनाज पट्टियां (पंजाब, हरियाणा, बंगाल)' : 'Irrigated cereal belts (Punjab, Haryana, West Bengal)'}
          </p>
        </div>

        <div
          onClick={() => setTierFilter('Rainfed')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            tierFilter === 'Rainfed' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20' : 'bg-white/80 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {isHindi ? 'वर्षा आधारित / मोटे अनाज' : 'Rainfed / Coarse Grain'}
            </span>
            <span className="w-3 h-3 rounded-full bg-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">&lt; 2.5 t/ha</p>
          <p className="text-xs text-slate-500 mt-1">
            {isHindi ? 'शुष्क दलहन, तिलहन व मोटे अनाज' : 'Arid pulses, oilseeds, and coarse grain zones'}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isHindi ? 'राज्य या फसल खोजें (उदा. पंजाब, गेहूं)...' : 'Search state (e.g. Punjab, Maharashtra) or crop...'}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
        <button
          onClick={() => {
            setSearch('');
            setTierFilter('ALL');
          }}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          {isHindi ? 'फ़िल्टर हटाएं' : 'Reset Filters'}
        </button>
      </div>

      {/* Main Grid: Interactive State Cards + State Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: State Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              {isHindi ? `भारतीय राज्य निर्देशिका (${filteredStates.length} राज्य)` : `Indian States Directory (${filteredStates.length} States)`}
            </h3>
            <span className="text-xs text-slate-500">{isHindi ? 'विवरण देखने के लिए राज्य पर क्लिक करें' : 'Click a state to inspect'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredStates.map((s) => {
              const isSelected = selectedState?.state === s.state;
              return (
                <div
                  key={s.state}
                  onClick={() => setSelectedState(s)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer card-hover ${
                    isSelected
                      ? 'bg-emerald-50/85 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white/85 backdrop-blur-sm border-slate-200/80 hover:border-emerald-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-base">
                      {isHindi ? translateState(s.state) : s.state}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                  </div>

                  <div className="mt-3 flex items-baseline space-x-1.5">
                    <span className="text-2xl font-black text-slate-900">{s.average_yield}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {isHindi ? 'टन/हेक्टेयर औसत' : 'tonnes/ha avg'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center">
                      <Sprout className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      {isHindi ? 'प्रमुख: ' : 'Top: '}
                      <strong className="ml-1 text-slate-800">
                        {isHindi ? translateCrop(s.top_crop) : s.top_crop}
                      </strong>
                    </span>
                    <span className="text-slate-500">{s.average_rainfall_mm} mm</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: State Inspector Panel */}
        {selectedState && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-lg space-y-6 h-fit sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isHindi ? 'चयनित क्षेत्र' : 'Selected Region'}
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {isHindi ? translateState(selectedState.state) : selectedState.state}
                </h3>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: selectedState.color }}
              >
                {selectedState.average_yield} {isHindi ? 'टन/हे.' : 't/ha'}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">{isHindi ? 'उत्पादकता श्रेणी:' : 'Productivity Category:'}</span>
                <span className="text-xs font-bold text-slate-900">{selectedState.tier}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">{isHindi ? 'प्राथमिक फसल:' : 'Primary Cultivated Crop:'}</span>
                <span className="text-xs font-bold text-emerald-700">
                  {isHindi ? translateCrop(selectedState.top_crop) : selectedState.top_crop}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">{isHindi ? 'वार्षिक सामान्य वर्षा:' : 'Annual Normal Rainfall:'}</span>
                <span className="text-xs font-bold text-slate-900">{selectedState.average_rainfall_mm} mm</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">{isHindi ? 'विश्लेषण किए गए रिकॉर्ड्स:' : 'Historical Records Analyzed:'}</span>
                <span className="text-xs font-bold text-slate-900">{selectedState.records_count} {isHindi ? 'फसलें' : 'crops'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">{isHindi ? 'निर्देशांक (अक्षांश/देशांतर):' : 'Centroid Coordinates:'}</span>
                <span className="text-xs font-mono text-slate-600">
                  {selectedState.latitude}°N, {selectedState.longitude}°E
                </span>
              </div>
            </div>

            <button
              onClick={() => handlePredictForState(selectedState.state, selectedState.top_crop)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center hover:scale-[1.02] active:scale-95"
            >
              <Sprout className="w-4 h-4 mr-2" />
              {isHindi ? `${translateState(selectedState.state)} हेतु पूर्वानुमान करें` : `Run Prediction for ${selectedState.state}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgriMapPage;
