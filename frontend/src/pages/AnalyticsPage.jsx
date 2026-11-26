import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { StatCard, LoadingSpinner } from '../components/common/StatCard';
import {
  BarChart3,
  TrendingUp,
  CloudRain,
  Calendar,
  Layers,
  MapPin,
  Download,
  RotateCcw,
  Sprout,
  Database,
  Award,
  Beaker,
  ArrowUpRight,
  Filter,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';

const CROP_COLORS = ['#059669', '#10b981', '#0d9488', '#14b8a6', '#0284c7', '#0ea5e9', '#16a34a', '#22c55e', '#f59e0b', '#d97706'];
const SEASON_COLORS = ['#059669', '#0ea5e9', '#f59e0b', '#8b5cf6', '#14b8a6', '#ef4444'];

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { isHindi, translateCrop, translateSeason, translateState } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  const [selectedState, setSelectedState] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [cropSortMode, setCropSortMode] = useState('volume'); // 'volume' | 'yield'
  const [driverTab, setDriverTab] = useState('rainfall'); // 'rainfall' | 'fertilizer'
  const [tableSearch, setTableSearch] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (stats) setFiltering(true);
      try {
        const params = {};
        if (selectedState) params.state = selectedState;
        if (selectedSeason) params.season = selectedSeason;
        const res = await api.get('/analytics', { params });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
        setFiltering(false);
      }
    };
    fetchAnalytics();
  }, [selectedState, selectedSeason]);

  const cropData = useMemo(() => {
    const raw =
      cropSortMode === 'yield'
        ? stats?.top_yield_crops?.slice(0, 10) || []
        : stats?.crop_distribution?.slice(0, 10) || [];
    return raw.map((d) => ({
      ...d,
      displayCrop: isHindi ? translateCrop(d.crop) : d.crop,
    }));
  }, [stats, cropSortMode, isHindi, translateCrop]);

  const seasonalData = useMemo(() => {
    return (stats?.seasonal_distribution || []).map((d) => ({
      ...d,
      displaySeason: isHindi ? translateSeason(d.season) : d.season,
    }));
  }, [stats, isHindi, translateSeason]);

  const stateData = useMemo(() => {
    const list = stats?.state_productivity || [];
    const topTen = list.slice(0, 10);
    const hasSelected = selectedState && topTen.some((s) => s.state === selectedState);
    const selectedItem = selectedState && !hasSelected ? list.find((s) => s.state === selectedState) : null;
    const finalItems = selectedItem ? [...topTen.slice(0, 9), selectedItem] : topTen;
    return finalItems.map((d) => ({
      ...d,
      displayState: isHindi ? translateState(d.state) : d.state,
    }));
  }, [stats, selectedState, isHindi, translateState]);

  const filteredTableCrops = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return cropData;
    return cropData.filter(
      (r) => r.crop.toLowerCase().includes(q) || r.displayCrop.toLowerCase().includes(q)
    );
  }, [cropData, tableSearch]);

  const maxTableRecords = useMemo(() => {
    return Math.max(...cropData.map((r) => r.record_count || 0), 1);
  }, [cropData]);

  const yearlyData = stats?.yearly_trends || [];
  const rainfallData = stats?.rainfall_trends || [];
  const fertilizerData = stats?.fertilizer_trends || [];

  const handleExportCsv = () => {
    if (!cropData.length) return;
    const rows = [
      ['Crop', 'Average_Yield_t_ha', 'Record_Count', 'State_Filter', 'Season_Filter'],
      ...cropData.map((r) => [
        `"${r.crop}"`,
        r.average_yield,
        r.record_count,
        `"${selectedState || 'ALL'}"`,
        `"${selectedSeason || 'ALL'}"`,
      ]),
    ];
    const blob = new Blob([rows.map((e) => e.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `krishipulse_analytics_${selectedState || 'india'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <LoadingSpinner
        message={isHindi ? 'विस्तृत कृषि डेटा विश्लेषण तैयार किया जा रहा है...' : 'Compiling multi-year agricultural intelligence...'}
      />
    );
  }

  const kpi = stats?.kpi || {};
  const availableStates = stats?.filters?.states || [];
  const availableSeasons = stats?.filters?.seasons || [];
  const topYieldLeader = stats?.top_yield_crops?.[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isHindi ? 'अनुभवजन्य कृषि डेटा विश्लेषण' : 'Empirical Agricultural Intelligence'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isHindi ? 'कृषि अंतर्दृष्टि एवं 24-वर्षीय रुझान' : 'Agri Analytics & 24-Year Historical Trends'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {isHindi
              ? '1997–2020 के वास्तविक भारतीय कृषि और IMD मौसम आंकड़ों का इंटरएक्टिव विश्लेषण।'
              : 'Interactive multivariate analytics across 1997–2020 Indian Ministry of Agriculture & IMD meteorological records.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs text-xs font-bold transition-colors flex-shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'CSV रिपोर्ट डाउनलोड करें' : 'Export Summary CSV'}</span>
        </button>
      </div>

      {/* Interactive Filter Toolbar */}
      <div className="rounded-2xl glass-card-agri p-4 border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'क्षेत्रीय व मौसमी फ़िल्टर:' : 'Slice Dataset By Region & Season:'}</span>
          {filtering && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {isHindi ? 'अपडेट हो रहा है...' : 'Updating...'}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <select
              aria-label="Filter by state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">{isHindi ? 'सभी 30 भारतीय राज्य' : 'All 30 Indian States'}</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {isHindi ? translateState(st) : st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <select
              aria-label="Filter by season"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">{isHindi ? 'सभी 6 कृषि मौसम' : 'All 6 Cropping Seasons'}</option>
              {availableSeasons.map((sn) => (
                <option key={sn} value={sn}>
                  {isHindi ? translateSeason(sn) : sn}
                </option>
              ))}
            </select>
          </div>

          {(selectedState || selectedSeason) && (
            <button
              type="button"
              onClick={() => {
                setSelectedState('');
                setSelectedSeason('');
              }}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isHindi ? 'रीसेट' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Executive KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isHindi ? 'विश्लेषित रिकॉर्ड्स' : 'Analyzed Observations'}
          value={(kpi.dataset_records || 0).toLocaleString()}
          subtitle={`${kpi.total_crops || 0} ${isHindi ? 'फसलें' : 'Crops'} • ${kpi.total_states || 0} ${isHindi ? 'राज्य' : 'States'}`}
          icon={Database}
          color="emerald"
        />
        <StatCard
          title={isHindi ? 'औसत ऐतिहासिक उपज' : 'Empirical Mean Yield'}
          value={kpi.average_yield ?? '—'}
          unit="t/ha"
          subtitle={`${isHindi ? 'माध्यिका (Median):' : 'Median:'} ${kpi.median_yield ?? '—'} t/ha`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title={isHindi ? 'शीर्ष उत्पादक फसल' : 'Highest Yielding Crop'}
          value={topYieldLeader ? (isHindi ? translateCrop(topYieldLeader.crop) : topYieldLeader.crop) : '—'}
          subtitle={topYieldLeader ? `${topYieldLeader.average_yield} t/ha (${topYieldLeader.record_count} recs)` : ''}
          icon={Sprout}
          color="amber"
        />
        <StatCard
          title={isHindi ? 'औसत वार्षिक वर्षा' : 'Mean Annual Rainfall'}
          value={kpi.average_rainfall_mm ?? '—'}
          unit="mm"
          subtitle={`Model R²: ${kpi.model_r2 || '0.8147'}`}
          icon={CloudRain}
          color="purple"
        />
      </div>

      {/* Hero Chart: 24-Year Historical Yield & Rainfall Trajectory */}
      <div className="rounded-2xl glass-card-agri p-5 sm:p-6 border border-emerald-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isHindi ? '24-वर्षीय ऐतिहासिक उपज एवं वर्षा प्रक्षेपवक्र (1997–2020)' : '24-Year Historical Yield & Rainfall Trajectory (1997–2020)'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi
                ? 'समय के साथ राष्ट्रीय/राज्य औसत उपज (t/ha) बनाम वार्षिक वर्षा (mm)'
                : 'Annual mean crop yield (t/ha) overlaid against annual precipitation (mm)'}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            {selectedState ? (isHindi ? translateState(selectedState) : selectedState) : (isHindi ? 'संपूर्ण भारत' : 'Pan-India')}
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yearlyData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="yieldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="yield" width={48} domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#059669' }} unit=" t" />
              <YAxis yAxisId="rain" orientation="right" width={58} domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#0284c7' }} unit=" mm" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0]?.payload;
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1">
                      <p className="font-extrabold text-slate-900">
                        {isHindi ? `वर्ष ${label}` : `Year ${label}`} ({row?.records?.toLocaleString()} {isHindi ? 'रिकॉर्ड्स' : 'records'})
                      </p>
                      <p className="text-emerald-700 font-bold">
                        {isHindi ? 'औसत उपज:' : 'Mean Yield:'} {row?.average_yield} t/ha
                      </p>
                      <p className="text-sky-700 font-bold">
                        {isHindi ? 'औसत वर्षा:' : 'Mean Rainfall:'} {row?.average_rainfall_mm} mm
                      </p>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                yAxisId="yield"
                type="monotone"
                dataKey="average_yield"
                name={isHindi ? 'औसत उपज (t/ha)' : 'Mean Yield (t/ha)'}
                stroke="#059669"
                strokeWidth={2.5}
                fill="url(#yieldAreaGrad)"
              />
              <Line
                yAxisId="rain"
                type="monotone"
                dataKey="average_rainfall_mm"
                name={isHindi ? 'औसत वर्षा (mm)' : 'Mean Rainfall (mm)'}
                stroke="#0284c7"
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle Row: Horizontal Crop Benchmarks & Regional State Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Crop Productivity Benchmarks (Horizontal Bar so labels never clip) */}
        <div className="rounded-2xl glass-card-agri p-5 sm:p-6 border border-emerald-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isHindi ? 'फसल उत्पादकता मानक' : 'Crop Productivity Benchmarks'}
              </h3>
              <p className="text-xs text-slate-500">
                {cropSortMode === 'yield'
                  ? (isHindi ? 'उच्चतम औसत उपज वाली शीर्ष 10 फसलें (t/ha)' : 'Top 10 crops ranked by mean yield (tonnes/ha)')
                  : (isHindi ? 'सर्वाधिक खेती वाली शीर्ष 10 फसलें' : 'Top 10 most widely cultivated crops')}
              </p>
            </div>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCropSortMode('volume')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  cropSortMode === 'volume' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {isHindi ? 'लोकप्रिय' : 'Most Grown'}
              </button>
              <button
                type="button"
                onClick={() => setCropSortMode('yield')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  cropSortMode === 'yield' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {isHindi ? 'शीर्ष उपज' : 'Top Yield'}
              </button>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit=" t/ha" />
                <YAxis
                  type="category"
                  dataKey="displayCrop"
                  width={120}
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1">
                        <p className="font-extrabold text-slate-900">{d.displayCrop}</p>
                        <p className="text-emerald-700 font-bold">
                          {isHindi ? 'औसत उपज:' : 'Mean Yield:'} {d.average_yield} t/ha
                        </p>
                        <p className="text-slate-600">
                          {isHindi ? 'नमूना रिकॉर्ड्स:' : 'Records:'} {d.record_count.toLocaleString()}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="average_yield" radius={[0, 6, 6, 0]}>
                  {cropData.map((_, index) => (
                    <Cell key={`c1-${index}`} fill={CROP_COLORS[index % CROP_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Regional Productivity Leaders (Horizontal Bar with click-to-filter) */}
        <div className="rounded-2xl glass-card-agri p-5 sm:p-6 border border-emerald-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isHindi ? 'क्षेत्रीय उत्पादकता में अग्रणी राज्य' : 'Regional Productivity Leaders'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? 'फ़िल्टर करने के लिए किसी भी राज्य के बार पर क्लिक करें'
                  : 'Click any state bar to filter the entire analytics workspace'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {isHindi ? 'इंटरएक्टिव' : 'Interactive'}
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit=" t/ha" />
                <YAxis
                  type="category"
                  dataKey="displayState"
                  width={130}
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1">
                        <p className="font-extrabold text-slate-900">{d.displayState}</p>
                        <p className="text-sky-700 font-bold">
                          {isHindi ? 'औसत उपज:' : 'Average Yield:'} {d.average_yield} t/ha
                        </p>
                        <p className="text-slate-600">
                          {isHindi ? 'रिकॉर्ड्स:' : 'Records:'} {d.record_count.toLocaleString()}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="average_yield"
                  radius={[0, 6, 6, 0]}
                  onClick={(entry) =>
                    setSelectedState((prev) => (prev === entry.state ? '' : entry.state))
                  }
                >
                  {stateData.map((entry) => (
                    <Cell
                      key={entry.state}
                      cursor="pointer"
                      fill={selectedState === entry.state ? '#059669' : '#0284c7'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Seasonal Variations & Climate/Nutrient Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 4: Seasonal Productivity Comparison */}
        <div className="rounded-2xl glass-card-agri p-5 sm:p-6 border border-emerald-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isHindi ? 'कृषि-मौसम के अनुसार उपज अंतर' : 'Agro-Seasonal Productivity'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi ? 'सभी 6 कृषि मौसमों में फसल उत्पादकता की तुलना' : 'Harvest output compared across Indian cropping seasons'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {isHindi ? 'मौसमी' : 'Seasonal'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displaySeason" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                <YAxis width={48} tick={{ fontSize: 11, fill: '#64748b' }} unit=" t" />
                <Tooltip
                  formatter={(val) => [`${val} t/ha`, isHindi ? 'औसत उपज' : 'Avg Yield']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="average_yield" radius={[8, 8, 0, 0]}>
                  {seasonalData.map((_, idx) => (
                    <Cell key={`sn-${idx}`} fill={SEASON_COLORS[idx % SEASON_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Tabbed Rainfall Brackets vs Fertilizer Intensity */}
        <div className="rounded-2xl glass-card-agri p-5 sm:p-6 border border-emerald-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {driverTab === 'rainfall'
                  ? (isHindi ? 'वर्षा स्तर एवं उपज गतिशीलता' : 'Rainfall Precipitation Dynamics')
                  : (isHindi ? 'उर्वरक तीव्रता बनाम उपज' : 'Fertilizer Intensity vs. Yield')}
              </h3>
              <p className="text-xs text-slate-500">
                {driverTab === 'rainfall'
                  ? (isHindi ? 'वार्षिक वर्षा स्तरों (mm) के आधार पर औसत उपज' : 'Mean yield segmented by annual rainfall brackets (mm)')
                  : (isHindi ? 'प्रति हेक्टेयर खाद (kg/ha) के अनुसार औसत उपज' : 'Mean yield segmented by fertilizer intensity (kg/ha)')}
              </p>
            </div>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setDriverTab('rainfall')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                  driverTab === 'rainfall' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <CloudRain className="w-3 h-3" />
                <span>{isHindi ? 'वर्षा' : 'Rainfall'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDriverTab('fertilizer')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                  driverTab === 'fertilizer' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <Beaker className="w-3 h-3" />
                <span>{isHindi ? 'उर्वरक' : 'Fertilizer'}</span>
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={driverTab === 'rainfall' ? rainfallData : fertilizerData}
                margin={{ top: 10, right: 12, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey={driverTab === 'rainfall' ? 'rainfall_bracket' : 'fertilizer_bracket'}
                  tick={{ fontSize: 10.5, fill: '#475569', fontWeight: 600 }}
                />
                <YAxis width={48} tick={{ fontSize: 11, fill: '#64748b' }} unit=" t" />
                <Tooltip
                  formatter={(val) => [`${val} t/ha`, isHindi ? 'औसत उपज' : 'Avg Yield']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar
                  dataKey="average_yield"
                  fill={driverTab === 'rainfall' ? '#0d9488' : '#10b981'}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Crop Benchmark Intelligence Table */}
      <div className="rounded-2xl glass-card-agri overflow-hidden border border-emerald-100">
        <div className="p-5 sm:p-6 border-b border-emerald-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isHindi ? 'फसल उत्पादकता एवं रिकॉर्ड तालिका' : 'Crop Benchmark Summary Matrix'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi
                ? 'किसी भी फसल के लिए सीधे AI पूर्वानुमान या व्हाट-इफ़ सिमुलेशन खोलें'
                : 'Inspect empirical benchmarks and launch ML forecasts or What-If simulations'}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder={isHindi ? 'फसल खोजें...' : 'Filter crops...'}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none w-40 sm:w-48"
              />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap">
              {filteredTableCrops.length} {isHindi ? 'फ़सलें' : 'Crops'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-emerald-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-emerald-100">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">{isHindi ? 'फसल' : 'Crop'}</th>
                <th className="px-6 py-3">{isHindi ? 'औसत उपज' : 'Mean Yield'}</th>
                <th className="px-6 py-3">{isHindi ? 'नमूना वितरण' : 'Sample Coverage'}</th>
                <th className="px-6 py-3 text-right">{isHindi ? 'कार्रवाई' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTableCrops.map((row, idx) => {
                const coveragePct = Math.max(8, Math.round((row.record_count / maxTableRecords) * 100));
                return (
                  <tr key={row.crop} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {isHindi ? translateCrop(row.crop) : row.crop}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-100/80 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                        {row.average_yield} t/ha
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                            style={{ width: `${coveragePct}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 tabular-nums">
                          {row.record_count.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => navigate('/simulator')}
                          className="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-800 hover:underline"
                          title={isHindi ? 'व्हाट-इफ़ सिम्युलेटर खोलें' : 'Open What-If Simulator'}
                        >
                          <SlidersHorizontal className="w-3 h-3 mr-1" />
                          <span>{isHindi ? 'सिमुलेट' : 'Simulate'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate('/predict', {
                              state: {
                                presetCrop: row.crop,
                                presetState: selectedState || undefined,
                                presetSeason: selectedSeason || undefined,
                              },
                            })
                          }
                          className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline"
                        >
                          <span>{isHindi ? 'पूर्वानुमान' : 'Forecast'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
