import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  MapPin,
  Sprout,
  CloudRain,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Layers,
  Award,
  BarChart3,
  Globe2,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  Sparkles
} from 'lucide-react';

// Bounding box projection for Indian subcontinent
const projectCoordinates = (lat, lon) => {
  const minLat = 7.5;
  const maxLat = 37.2;
  const minLon = 68.0;
  const maxLon = 97.5;

  const width = 640;
  const height = 690;
  const offsetX = 60;
  const offsetY = 50;

  const x = ((lon - minLon) / (maxLon - minLon)) * width + offsetX;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height + offsetY;

  return { x: Math.round(x), y: Math.round(y) };
};

const AgriMapPage = () => {
  const navigate = useNavigate();
  const { t, isHindi, translateCrop, translateState } = useLanguage();
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('map'); // 'map', 'leaderboard', 'grid'
  const [metricMode, setMetricMode] = useState('yield'); // 'yield' or 'rainfall'

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const res = await api.get('/map/states');
        const data = res.data || [];
        setStates(data);
        if (data.length > 0) {
          setSelectedState(data[0]);
        }
      } catch (err) {
        console.error('Failed to load map state data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // National agricultural summary metrics
  const nationalStats = useMemo(() => {
    if (!states.length) return { avgYield: 0, topState: null, topRainState: null, totalRecords: 0 };
    const totalYield = states.reduce((sum, s) => sum + s.average_yield, 0);
    const avgYield = +(totalYield / states.length).toFixed(2);
    const topState = [...states].sort((a, b) => b.average_yield - a.average_yield)[0];
    const topRainState = [...states].sort((a, b) => b.average_rainfall_mm - a.average_rainfall_mm)[0];
    const totalRecords = states.reduce((sum, s) => sum + s.records_count, 0);
    return { avgYield, topState, topRainState, totalRecords };
  }, [states]);

  const filteredStates = useMemo(() => {
    return states.filter((s) => {
      const matchSearch =
        s.state.toLowerCase().includes(search.toLowerCase()) ||
        s.top_crop.toLowerCase().includes(search.toLowerCase()) ||
        translateState(s.state).toLowerCase().includes(search.toLowerCase()) ||
        translateCrop(s.top_crop).toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === 'ALL' || s.tier.includes(tierFilter);
      return matchSearch && matchTier;
    });
  }, [states, search, tierFilter, translateState, translateCrop]);

  const leaderboardData = useMemo(() => {
    return [...filteredStates]
      .sort((a, b) => (metricMode === 'yield' ? b.average_yield - a.average_yield : b.average_rainfall_mm - a.average_rainfall_mm))
      .slice(0, 15);
  }, [filteredStates, metricMode]);

  const handlePredictForState = (stateName, topCrop) => {
    navigate('/predict', {
      state: {
        presetState: stateName,
        presetCrop: topCrop
      }
    });
  };

  if (loading) {
    return (
      <LoadingSpinner
        message={isHindi ? 'क्षेत्रीय कृषि उपज एवं जलवायु डेटा लोड हो रहा है...' : 'Loading regional geographic yield data and agro-climatic tiers...'}
      />
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Globe2 className="w-3.5 h-3.5" />
            <span>{isHindi ? 'भौगोलिक कृषि बुद्धिमत्ता' : 'Geospatial Agricultural Intelligence'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isHindi ? 'भारत का कृषि उपज मानचित्र' : 'Agricultural Yield Map of India'}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {isHindi
              ? '30 भारतीय राज्यों में क्षेत्रीय फसल उत्पादकता स्तर, ऐतिहासिक बायोमास और प्राथमिक फसलों का इंटरएक्टिव अन्वेषण करें।'
              : 'Interactive agro-climatic map visualizer exploring crop productivity tiers, historical rainfall patterns, and leading crops across 30 Indian states.'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-inner space-x-1 overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              viewMode === 'map'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isHindi ? 'मानचित्र दृश्य' : 'Map View'}</span>
          </button>
          <button
            onClick={() => setViewMode('leaderboard')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              viewMode === 'leaderboard'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{isHindi ? 'रैंकिंग' : 'Leaderboard'}</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isHindi ? 'राज्य कार्ड्स' : 'Directory'}</span>
          </button>
        </div>
      </div>

      {/* National KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>{isHindi ? 'राष्ट्रीय औसत उपज' : 'National Avg Yield'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
            {nationalStats.avgYield} <span className="text-xs font-semibold text-slate-500">t/ha</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-1 block">
            {isHindi ? '30 भारतीय राज्यों का औसत' : '30 States Benchmark'}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>{isHindi ? 'सर्वोच्च उत्पादक राज्य' : 'Top Producer'}</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2 truncate">
            {nationalStats.topState ? (isHindi ? translateState(nationalStats.topState.state) : nationalStats.topState.state) : '—'}
          </p>
          <span className="text-[10px] sm:text-[11px] text-amber-600 font-semibold mt-1 block truncate">
            {nationalStats.topState?.average_yield} t/ha • {nationalStats.topState ? (isHindi ? translateCrop(nationalStats.topState.topCrop) : nationalStats.topState.top_crop) : ''}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>{isHindi ? 'सर्वाधिक वर्षा क्षेत्र' : 'Highest Rainfall'}</span>
            <CloudRain className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2 truncate">
            {nationalStats.topRainState ? (isHindi ? translateState(nationalStats.topRainState.state) : nationalStats.topRainState.state) : '—'}
          </p>
          <span className="text-[10px] sm:text-[11px] text-blue-600 font-semibold mt-1 block">
            {nationalStats.topRainState?.average_rainfall_mm} mm/year
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>{isHindi ? 'सत्यापित डेटा' : 'Analyzed Records'}</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
            {nationalStats.totalRecords.toLocaleString()}
          </p>
          <span className="text-[10px] sm:text-[11px] text-teal-600 font-semibold mt-1 block">
            {isHindi ? 'भारतीय कृषि डेटासेट रिकॉर्ड्स' : 'Historical Crop Datapoints'}
          </span>
        </div>
      </div>

      {/* Tier Filter Pills & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/90 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-sm">
        {/* Tier Badges */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setTierFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              tierFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isHindi ? 'सभी क्षेत्र (30)' : 'All Zones (30)'}
          </button>
          <button
            onClick={() => setTierFilter('High')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              tierFilter === 'High'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{isHindi ? 'उच्च उपज (>6 t/ha)' : 'High (>6 t/ha)'}</span>
          </button>
          <button
            onClick={() => setTierFilter('Moderate')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              tierFilter === 'Moderate'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>{isHindi ? 'मध्यम (2.5–6 t/ha)' : 'Moderate (2.5–6 t/ha)'}</span>
          </button>
          <button
            onClick={() => setTierFilter('Rainfed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 ${
              tierFilter === 'Rainfed'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{isHindi ? 'वर्षा आधारित (<2.5 t/ha)' : 'Rainfed (<2.5 t/ha)'}</span>
          </button>
        </div>

        {/* Search Input & Metric Mode */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {viewMode === 'map' && (
            <div className="flex items-center text-xs bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={() => setMetricMode('yield')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  metricMode === 'yield' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                {isHindi ? 'उपज' : 'Yield'}
              </button>
              <button
                onClick={() => setMetricMode('rainfall')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  metricMode === 'rainfall' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                {isHindi ? 'वर्षा' : 'Rainfall'}
              </button>
            </div>
          )}

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isHindi ? 'राज्य या फसल खोजें...' : 'Search state or crop...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace: Visual Area (Left 2 cols) + Inspector Card (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Dynamic View Mode */}
        <div className="lg:col-span-2">
          {/* VIEW 1: Interactive Geospatial India Map Canvas */}
          {viewMode === 'map' && (
            <>
              <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-800 shadow-2xl overflow-hidden min-h-[460px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col justify-between">
              {/* Futuristic Cyber Agricultural Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

              {/* Ambient Map Glow */}
              <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Map Title Overlay */}
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'इंटरएक्टिव जियोस्पेशियल कैनवास' : 'Interactive Geospatial Canvas'}</span>
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                    {isHindi ? 'भारत का क्षेत्रीय कृषि नोड मानचित्र' : 'Indian Agro-Climatic Node Visualizer'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                    {isHindi ? 'सक्रिय पैमाना' : 'Active Scale'}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {metricMode === 'yield' ? 'Yield (t/ha)' : 'Annual Rain (mm)'}
                  </span>
                </div>
              </div>

              {/* SVG Visual India Map Canvas */}
              <div className="relative z-10 w-full flex items-center justify-center my-2 sm:my-4 overflow-x-auto">
                <svg
                  viewBox="0 0 760 760"
                  className="w-full max-w-[620px] h-auto drop-shadow-2xl select-none max-h-[440px] sm:max-h-[560px]"
                >
                  <defs>
                    <radialGradient id="highYieldGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
                    </radialGradient>
                    <radialGradient id="modYieldGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
                    </radialGradient>
                    <radialGradient id="rainfedGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
                    </radialGradient>
                    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Stylized Silhouette Contour of Indian Subcontinent */}
                  <path
                    d="M 230,120 L 290,105 L 340,140 L 400,165 L 430,225 L 520,250 L 590,260 L 630,290 L 580,340 L 520,340 L 480,380 L 470,440 L 410,500 L 370,550 L 320,640 L 280,680 L 250,650 L 240,580 L 210,510 L 170,470 L 140,430 L 120,380 L 150,330 L 190,270 L 220,180 Z"
                    fill="rgba(15, 23, 42, 0.65)"
                    stroke="rgba(51, 65, 85, 0.45)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Connecting Agro-climatic Region Lines */}
                  {filteredStates.map((s, idx) => {
                    if (idx % 3 !== 0 || idx >= filteredStates.length - 1) return null;
                    const next = filteredStates[idx + 1];
                    const p1 = projectCoordinates(s.latitude, s.longitude);
                    const p2 = projectCoordinates(next.latitude, next.longitude);
                    return (
                      <line
                        key={`link-${s.state}-${next.state}`}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke="rgba(16, 185, 129, 0.12)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    );
                  })}

                  {/* Interactive State Nodes */}
                  {filteredStates.map((s) => {
                    const pos = projectCoordinates(s.latitude, s.longitude);
                    const isSelected = selectedState?.state === s.state;
                    const isHovered = hoveredState?.state === s.state;
                    const isTopYield = s.average_yield >= 7.0;

                    // Dynamic Radius based on metric
                    const radius =
                      metricMode === 'yield'
                        ? Math.min(22, Math.max(9, Math.round(s.average_yield * 1.8)))
                        : Math.min(22, Math.max(9, Math.round(s.average_rainfall_mm / 140)));

                    // Dynamic Color
                    const nodeColor =
                      s.average_yield >= 6.0 ? '#10b981' : s.average_yield >= 2.5 ? '#0ea5e9' : '#f59e0b';

                    return (
                      <g
                        key={s.state}
                        className="cursor-pointer transition-transform duration-200"
                        onClick={() => setSelectedState(s)}
                        onMouseEnter={() => setHoveredState(s)}
                        onMouseLeave={() => setHoveredState(null)}
                      >
                        {/* Invisible expanded tap target circle for effortless mobile finger tapping */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={Math.max(22, radius + 8)}
                          fill="transparent"
                        />

                        {/* Pulse Ring for high producing regions */}
                        {isTopYield && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={radius + 8}
                            fill="none"
                            stroke={nodeColor}
                            strokeWidth="1.5"
                            opacity="0.3"
                            className="animate-ping"
                          />
                        )}

                        {/* Outer Selection Highlight Ring */}
                        {(isSelected || isHovered) && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={radius + 6}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeDasharray={isSelected ? 'none' : '3 3'}
                            filter="url(#glowEffect)"
                          />
                        )}

                        {/* Main Node Circle */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={radius}
                          fill={nodeColor}
                          opacity={isSelected || isHovered ? 1 : 0.85}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                          filter="url(#glowEffect)"
                        />

                        {/* State Abbreviation inside bubble */}
                        <text
                          x={pos.x}
                          y={pos.y + 3.5}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={radius > 14 ? '9' : '8'}
                          fontWeight="bold"
                          className="pointer-events-none select-none font-mono"
                        >
                          {s.state.slice(0, 2).toUpperCase()}
                        </text>

                        {/* Interactive Floating Label on Hover or Active Selection */}
                        {(isSelected || isHovered) && (
                          <g className="pointer-events-none">
                            <rect
                              x={pos.x - 55}
                              y={pos.y - radius - 32}
                              width="110"
                              height="26"
                              rx="8"
                              fill="#0f172a"
                              stroke={nodeColor}
                              strokeWidth="1.5"
                              filter="url(#glowEffect)"
                            />
                            <text
                              x={pos.x}
                              y={pos.y - radius - 15}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {s.state}: {s.average_yield} t/ha
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Map Legend & Legend Footnote */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>&gt; 6.0 t/ha (High)</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>2.5 – 6.0 t/ha (Moderate)</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>&lt; 2.5 t/ha (Rainfed)</span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {isHindi ? 'किसी भी नोड पर क्लिक करके विवरण देखें' : 'Click any state node to inspect regional details'}
                </div>
              </div>
            </div>

            {/* Mobile Quick State Summary Card (lg:hidden) */}
            {selectedState && (
              <div className="lg:hidden mt-4 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-200 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        {isHindi ? translateState(selectedState.state) : selectedState.state}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {selectedState.tier} Zone
                      </span>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-black text-white shadow-xs"
                    style={{
                      backgroundColor:
                        selectedState.average_yield >= 6.0
                          ? '#059669'
                          : selectedState.average_yield >= 2.5
                          ? '#0284c7'
                          : '#d97706'
                    }}
                  >
                    {selectedState.average_yield} t/ha
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block font-medium">{isHindi ? 'प्राथमिक फसल' : 'Leading Crop'}</span>
                    <span className="font-bold text-emerald-800 text-xs">
                      {isHindi ? translateCrop(selectedState.top_crop) : selectedState.top_crop}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                    <span className="text-[10px] text-slate-500 block font-medium">{isHindi ? 'वार्षिक वर्षा' : 'Annual Rain'}</span>
                    <span className="font-bold text-blue-800 text-xs">{selectedState.average_rainfall_mm} mm</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handlePredictForState(selectedState.state, selectedState.top_crop)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5"
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'इस राज्य का पूर्वानुमान' : 'Predict For This State'}</span>
                  </button>
                  <a
                    href="#state-details"
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center"
                  >
                    {isHindi ? 'विस्तृत विवरण' : 'Details'} ↓
                  </a>
                </div>
              </div>
            )}
          </>
          )}

          {/* VIEW 2: National Leaderboard Rankings View */}
          {viewMode === 'leaderboard' && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {isHindi ? 'शीर्ष 15 राज्य - कृषि उत्पादकता रैंकिंग' : 'Top 15 States - Agricultural Productivity Leaderboard'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isHindi
                      ? 'राष्ट्रीय स्तर पर औसत उपज एवं बायोमास की तुलना'
                      : 'Comparative biomass and yield benchmarking against national averages.'}
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  {metricMode === 'yield' ? 'Yield (t/ha)' : 'Rainfall (mm)'}
                </span>
              </div>

              <div className="h-[480px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leaderboardData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
                  >
                    <XAxis type="number" domain={[0, 'auto']} />
                    <YAxis
                      dataKey="state"
                      type="category"
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 text-xs space-y-1">
                            <p className="font-bold">{d.state}</p>
                            <p className="text-emerald-400">
                              Yield: <strong>{d.average_yield} t/ha</strong>
                            </p>
                            <p className="text-blue-400">
                              Rainfall: <strong>{d.average_rainfall_mm} mm</strong>
                            </p>
                            <p className="text-slate-300">
                              Primary Crop: <strong>{d.top_crop}</strong>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey={metricMode === 'yield' ? 'average_yield' : 'average_rainfall_mm'}
                      radius={[0, 8, 8, 0]}
                      onClick={(entry) => setSelectedState(entry)}
                    >
                      {leaderboardData.map((entry) => (
                        <Cell
                          key={entry.state}
                          cursor="pointer"
                          fill={
                            selectedState?.state === entry.state
                              ? '#059669'
                              : entry.average_yield >= 6.0
                              ? '#10b981'
                              : entry.average_yield >= 2.5
                              ? '#0ea5e9'
                              : '#f59e0b'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* VIEW 3: State Directory Cards Grid */}
          {viewMode === 'grid' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {isHindi
                    ? `भारतीय राज्य निर्देशिका (${filteredStates.length} राज्य)`
                    : `Indian States Directory (${filteredStates.length} States)`}
                </h3>
                <span className="text-xs text-slate-500">
                  {isHindi ? 'विवरण देखने के लिए राज्य पर क्लिक करें' : 'Click a state to inspect'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1">
                {filteredStates.map((s) => {
                  const isSelected = selectedState?.state === s.state;
                  return (
                    <div
                      key={s.state}
                      onClick={() => setSelectedState(s)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer card-hover ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white/85 backdrop-blur-sm border-slate-200/80 hover:border-emerald-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-base">
                          {isHindi ? translateState(s.state) : s.state}
                        </span>
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              s.average_yield >= 6.0 ? '#10b981' : s.average_yield >= 2.5 ? '#0ea5e9' : '#f59e0b'
                          }}
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
                        <span className="text-slate-500 flex items-center">
                          <CloudRain className="w-3 h-3 mr-1 text-blue-500" />
                          {s.average_rainfall_mm} mm
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Selected State Inspector Panel */}
        {selectedState && (
          <div id="state-details" className="bg-white/95 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 lg:p-7 border border-emerald-200/80 shadow-2xl space-y-6 lg:sticky lg:top-24 scroll-mt-24">
            {/* Top State Title with Badge */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-1">
                  {isHindi ? 'चयनित राज्य विश्लेषण' : 'Selected Region Analytics'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {isHindi ? translateState(selectedState.state) : selectedState.state}
                </h3>
              </div>
              <div className="text-right">
                <span
                  className="px-3 py-1 rounded-full text-xs font-black text-white shadow-sm inline-block"
                  style={{
                    backgroundColor:
                      selectedState.average_yield >= 6.0
                        ? '#059669'
                        : selectedState.average_yield >= 2.5
                        ? '#0284c7'
                        : '#d97706'
                  }}
                >
                  {selectedState.average_yield} t/ha
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {nationalStats.avgYield > 0
                    ? `${(
                        ((selectedState.average_yield - nationalStats.avgYield) / nationalStats.avgYield) *
                        100
                      ).toFixed(0)}% vs national`
                    : ''}
                </span>
              </div>
            </div>

            {/* Yield Progress Bar Meter */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span>{isHindi ? 'उत्पादकता स्तर (0 - 12 t/ha)' : 'Productivity Gauge'}</span>
                <span className="text-emerald-700 font-black">{selectedState.average_yield} t/ha</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${Math.min(100, (selectedState.average_yield / 12) * 100)}%` }}
                />
              </div>
            </div>

            {/* Detailed Geographic Attributes */}
            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">{isHindi ? 'उत्पादकता श्रेणी:' : 'Productivity Tier:'}</span>
                <span className="text-xs font-bold text-slate-900">{selectedState.tier}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium flex items-center">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                  {isHindi ? 'प्राथमिक फसल:' : 'Primary Crop:'}
                </span>
                <span className="text-xs font-extrabold text-emerald-800">
                  {isHindi ? translateCrop(selectedState.top_crop) : selectedState.top_crop}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/80 flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium flex items-center">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                  {isHindi ? 'वार्षिक औसत वर्षा:' : 'Annual Normal Rainfall:'}
                </span>
                <span className="text-xs font-extrabold text-blue-900">{selectedState.average_rainfall_mm} mm</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">{isHindi ? 'विश्लेषण किए गए रिकॉर्ड्स:' : 'Sample Records:'}</span>
                <span className="text-xs font-bold text-slate-900">{selectedState.records_count} {isHindi ? 'फसलें' : 'crops'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                  {isHindi ? 'भौगोलिक निर्देशांक:' : 'Geographic Coordinates:'}
                </span>
                <span className="text-xs font-mono text-slate-600">
                  {selectedState.latitude}°N, {selectedState.longitude}°E
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => handlePredictForState(selectedState.state, selectedState.top_crop)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group"
            >
              <Sprout className="w-4 h-4 mr-2" />
              <span>
                {isHindi
                  ? `${translateState(selectedState.state)} हेतु AI पूर्वानुमान करें`
                  : `Run AI Prediction for ${selectedState.state}`}
              </span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgriMapPage;
