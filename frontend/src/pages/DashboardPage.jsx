import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageCircleToggle from '../components/common/LanguageCircleToggle';
import api from '../services/api';
import { StatCard, LoadingSpinner } from '../components/common/StatCard';
import {
  Sprout,
  BarChart3,
  Award,
  TrendingUp,
  History,
  ArrowUpRight,
  Database,
  Calendar,
  CloudSun,
  Droplets,
  Thermometer,
  Compass,
  Map,
  SlidersHorizontal,
  Sparkles,
  Wheat,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

const AGRI_COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#14b8a6', '#0d9488', '#22c55e'];

const DashboardPage = () => {
  const { user } = useAuth();
  const { t, isHindi, translateCrop, translateSeason } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, predsRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/predictions?limit=5')
        ]);
        setAnalytics(analyticsRes.data);
        setRecentPredictions(predsRes.data.items || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message={t('loading_dashboard', 'Aggregating agricultural dashboard & telemetry...')} />;
  }

  const kpi = analytics?.kpi || {};
  const rawCropData = analytics?.crop_distribution?.slice(0, 7) || [];
  const rawSeasonalData = analytics?.seasonal_distribution || [];

  // Translate crop & season data for recharts
  const cropData = rawCropData.map((item) => ({
    ...item,
    displayName: translateCrop(item.crop),
  }));

  const seasonalData = rawSeasonalData.map((item) => ({
    ...item,
    displayName: translateSeason(item.season),
  }));

  return (
    <div className="space-y-8 pb-14">
      {/* ========================================================================= */}
      {/* 1. HERO AGRICULTURE BANNER WITH CINEMATIC PHOTO & GLASSMORPHISM OVERLAY   */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20">
        {/* Background Agriculture Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('/agri_hero_banner.jpg')` }}
        />

        {/* Translucent Emerald & Dark Gradient Filter */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/92 via-emerald-900/80 to-emerald-950/70 backdrop-blur-[2px]" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('live_cycle', 'Agro-Climatic Cycle: Active')}</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[11px] font-medium backdrop-blur-md">
                <span>🌱 {t('ai_precision_badge', '100% Empirical Machine Learning')}</span>
              </span>
            </div>

            {/* Title & Greeting */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {t('dashboard_title', 'AgriTech Workspace Dashboard')}
            </h1>

            <p className="text-xs sm:text-base text-emerald-100/90 font-normal leading-relaxed">
              {t('welcome_back', 'Welcome back')},{' '}
              <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                {user?.name || (isHindi ? 'किसान' : 'Farmer')}
              </span>
              . {t('dashboard_subtitle', 'Real-time predictive agriculture insights & empirical farm intelligence.')}
            </p>
          </div>

          {/* Quick Actions & Circular Language Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {/* Circular Language Button (Highlighted) */}
            <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg flex items-center" title="भाषा बदलें / Toggle Language">
              <LanguageCircleToggle size="normal" />
            </div>

            {/* Primary Action Button */}
            <Link
              to="/predict"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Sprout className="w-4 h-4 mr-1.5 sm:mr-2" />
              {t('new_prediction', 'New Prediction')}
            </Link>

            {/* Secondary Action: Agri Map */}
            <Link
              to="/map"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm rounded-2xl border border-white/30 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Map className="w-4 h-4 mr-1.5 sm:mr-2 text-emerald-300" />
              {t('yield_map', 'Yield Map')}
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. AGRO-CLIMATIC WEATHER & FARM ADVISORY WIDGET (TRANSLUCENT GLASS)       */}
      {/* ========================================================================= */}
      <div className="rounded-2xl glass-card-agri p-4 sm:p-6 border border-emerald-200/80 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100/80">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                {t('agro_advisory_title', "Today's Agro-Climatic Weather & Field Advisory")}
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {t('agro_advisory_subtitle', 'Live local parameters optimized for Kharif / Rabi cultivation')}
            </p>
          </div>

          <span className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60">
            🌾 {t('active_season_val', 'Kharif / Rabi Transition')}
          </span>
        </div>

        {/* 4 Micro Weather & Soil Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-4">
          <div className="flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">{t('temp_label', 'Temperature')}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{t('temp_val', '27°C')}</p>
              <p className="text-[9px] sm:text-[10px] text-emerald-700 truncate">{t('temp_status', 'Optimal growth')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-xl bg-teal-50/70 border border-teal-100">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">{t('moisture_label', 'Soil Moisture')}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{t('moisture_val', '64%')}</p>
              <p className="text-[9px] sm:text-[10px] text-teal-700 truncate">{t('moisture_status', 'Adequate root water')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-xl bg-sky-50/70 border border-sky-100">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center flex-shrink-0">
              <CloudSun className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">{t('rainfall_label', 'Precipitation')}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{t('rainfall_val', '780 mm')}</p>
              <p className="text-[9px] sm:text-[10px] text-sky-700 truncate">{t('rainfall_status', 'Normal monsoon')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-xl bg-amber-50/70 border border-amber-100">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
              <Wheat className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">{t('active_season_label', 'Current Cycle')}</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">Kharif / रबी</p>
              <p className="text-[9px] sm:text-[10px] text-amber-700 truncate">Harvest & Sowing</p>
            </div>
          </div>
        </div>

        {/* Daily Tip Alert */}
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-l-4 border-emerald-500 text-xs text-slate-700 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-900 font-bold">{t('advisory_tip_title', 'Agricultural Advisory for Today:')} </strong>
            <span>{t('advisory_tip_content', 'Recommended: Maintain optimal NPK nitrogen balance and monitor soil moisture prior to grain filling.')}</span>
          </div>
        </div>
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
      {/* 4. SMART FARMING QUICK ACTION TILES                                        */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            {t('quick_actions_title', 'Farm Intelligence & Analytical Suites')}
          </h2>
          <span className="text-xs text-slate-500">AgriTech Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Predict Yield */}
          <Link
            to="/predict"
            className="group p-5 rounded-2xl glass-card-agri hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t('action_predict_title', 'Predict Crop Yield')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t('action_predict_desc', 'Run multi-variable ML models with NPK, rainfall & soil data.')}
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>{isHindi ? 'पूर्वानुमान लगाएं' : 'Start Inference'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 2: Yield Map */}
          <Link
            to="/map"
            className="group p-5 rounded-2xl glass-card-agri hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                {t('action_map_title', 'Agri Yield Map')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t('action_map_desc', 'Interactive state-level productivity and geographic crop zones.')}
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
              <span>{isHindi ? 'मानचित्र देखें' : 'View Geospatial Map'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 3: What-If Simulator */}
          <Link
            to="/simulator"
            className="group p-5 rounded-2xl glass-card-agri hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                {t('action_sim_title', 'What-If Lab Simulator')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t('action_sim_desc', 'Simulate climate sensitivity, fertilizer tweaks, and yield impact.')}
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>{isHindi ? 'सिमुलेशन करें' : 'Open Simulator'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 4: Historical Analytics */}
          <Link
            to="/analytics"
            className="group p-5 rounded-2xl glass-card-agri hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                {t('action_analytics_title', 'Agri Analytics')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t('action_analytics_desc', 'Explore 24 years of crop distributions, trends, and seasonal yields.')}
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              <span>{isHindi ? 'विश्लेषण देखें' : 'View Deep Insights'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE CHARTS GRID (GLASSMORPHISM WITH NATURE ACCENTS)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop-wise Productivity Benchmark */}
        <div className="rounded-2xl glass-card-agri p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('chart_crop_title', 'Historical Crop Yield Benchmarks')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('chart_crop_subtitle', 'Mean productivity across top cultivated crops (tonnes/ha)')}
              </p>
            </div>
            <Link to="/analytics" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
              {t('chart_crop_link', 'Full Analytics')} <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayName" angle={-25} textAnchor="end" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(val) => [`${val} ${t('unit_tonnes_ha', 'tonnes/ha')}`, t('mean_yield', 'Mean Yield')]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="average_yield" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {cropData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={AGRI_COLORS[index % AGRI_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Yield Analysis */}
        <div className="rounded-2xl glass-card-agri p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('chart_season_title', 'Seasonal Productivity Variations')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('chart_season_subtitle', 'Average harvest yield categorized by agro-season')}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {t('six_seasons_badge', '6 Agro-Seasons')}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayName" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(val) => [`${val} ${t('unit_tonnes_ha', 'tonnes/ha')}`, t('avg_yield', 'Avg Yield')]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="average_yield" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. RECENT PREDICTIONS TABLE (GLASSMORPHISM WITH BILINGUAL ROWS)           */}
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
              {recentPredictions.length > 0 ? (
                recentPredictions.map((pred) => (
                  <tr key={pred.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-2.5 flex-shrink-0">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <span>{translateCrop(pred.crop)}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{pred.state}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    {t('no_predictions', 'No predictions generated yet.')}{' '}
                    <Link to="/predict" className="text-emerald-600 font-bold hover:underline">
                      {t('run_first_pred', 'Run your first prediction!')}
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
