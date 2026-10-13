import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout,
  BarChart3,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Database,
  Layers,
  Award,
  Map,
  SlidersHorizontal
} from 'lucide-react';

const LandingPage = () => {
  const { t, isHindi } = useLanguage();

  return (
    <div className="space-y-16 pb-20">
      {/* ========================================================================= */}
      {/* 1. FULL-PAGE HERO WITH TRANSPARENT GLASSMORPHISM                          */}
      {/* ========================================================================= */}
      <section className="relative pt-6 pb-8 text-center space-y-8">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10 bg-emerald-50/50 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-emerald-200/60 shadow-xl shadow-emerald-950/5">
          {/* Top Badge */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold tracking-wide uppercase backdrop-blur-md shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t('landing_badge', 'AI-Powered Precision Agriculture • Machine Learning')}</span>
            </div>
          </div>

          {/* Hero Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.15]">
            {t('landing_hero_h1', 'Predict. Plan.')}{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
              {t('landing_hero_h1_span', 'Grow.')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
            {t('landing_hero_desc', 'AI-powered crop yield prediction using 24 years of authentic agricultural, environmental, and farming management data across 30 Indian states. No dummy metrics. 100% empirical machine learning.')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/predict"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-xl shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Sprout className="w-5 h-5 mr-2" />
              {t('landing_btn_predict', 'Predict Crop Yield')}
            </Link>
            <Link
              to="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-slate-800 bg-white/90 hover:bg-white border border-emerald-200/80 backdrop-blur-md rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Map className="w-5 h-5 mr-2 text-emerald-600" />
              {t('yield_map', 'Yield Map')}
            </Link>
          </div>

          {/* 4 Soft Light Green Key Metrics Text Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
            <div className="bg-emerald-50/60 hover:bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-emerald-200/60 shadow-xs card-hover transition-all">
              <p className="text-2xl sm:text-3xl font-black text-emerald-800">19,407</p>
              <p className="text-xs font-semibold text-emerald-950/80 mt-1">{t('landing_metric_records', 'Authentic Records')}</p>
            </div>
            <div className="bg-emerald-50/60 hover:bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-emerald-200/60 shadow-xs card-hover transition-all">
              <p className="text-2xl sm:text-3xl font-black text-teal-800">54 Crops</p>
              <p className="text-xs font-semibold text-emerald-950/80 mt-1">{t('landing_metric_crops', '54 Crops • 30 Indian States')}</p>
            </div>
            <div className="bg-emerald-50/60 hover:bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-emerald-200/60 shadow-xs card-hover transition-all">
              <p className="text-2xl sm:text-3xl font-black text-amber-800">0.81 R²</p>
              <p className="text-xs font-semibold text-emerald-950/80 mt-1">{t('landing_metric_r2', 'Random Forest Tuned')}</p>
            </div>
            <div className="bg-emerald-50/60 hover:bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-emerald-200/60 shadow-xs card-hover transition-all">
              <p className="text-2xl sm:text-3xl font-black text-emerald-800">tonnes/ha</p>
              <p className="text-xs font-semibold text-emerald-950/80 mt-1">{t('landing_metric_unit', 'Standard Target Unit')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. WHY CROP YIELD PREDICTION MATTERS (SOFT LIGHT GREEN CARDS)             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('landing_why_title', 'Why Crop Yield Prediction Matters')}
          </h2>
          <p className="text-sm sm:text-base text-slate-700">
            {t('landing_why_desc', 'Climate variability, unpredictable precipitation, and changing soil nutrient demands make empirical agricultural forecasting crucial for food security, credit risk assessment, and farmer livelihoods.')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-emerald-50/55 hover:bg-emerald-50/75 backdrop-blur-md rounded-3xl p-7 border border-emerald-200/60 shadow-md shadow-emerald-950/5 card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t('landing_card1_title', 'Farmer Decision Support')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {t('landing_card1_desc', 'Provides farmers with data-driven yield expectations based on seasonal rainfall, cultivated land size, and chemical input intensity, assisting in harvest logistics.')}
            </p>
          </div>

          <div className="bg-emerald-50/55 hover:bg-emerald-50/75 backdrop-blur-md rounded-3xl p-7 border border-emerald-200/60 shadow-md shadow-emerald-950/5 card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center mb-5 shadow-xs">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t('landing_card2_title', 'Explainable AI (XAI)')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {t('landing_card2_desc', 'Demystifies machine learning predictions by displaying feature influence ranking, clarifying how crop genotype, geography, and inputs shape model behavior without false causality.')}
            </p>
          </div>

          <div className="bg-emerald-50/55 hover:bg-emerald-50/75 backdrop-blur-md rounded-3xl p-7 border border-emerald-200/60 shadow-md shadow-emerald-950/5 card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-100/80 text-teal-800 flex items-center justify-center mb-5 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t('landing_card3_title', 'Policy & Agricultural Credit')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {t('landing_card3_desc', 'Enables agricultural banks, insurance providers, and government procurement agencies to benchmark seasonal productivity variations across diverse agro-climatic zones.')}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS 4-STEP PIPELINE (SOFT LIGHT GREEN SECTION & BOXES)        */}
      {/* ========================================================================= */}
      <section className="bg-emerald-50/45 backdrop-blur-md py-14 px-6 sm:px-10 rounded-3xl border border-emerald-200/50 shadow-xl shadow-emerald-950/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('landing_how_title', 'How It Works')}
            </h2>
            <p className="text-slate-700 text-sm sm:text-base">
              {t('landing_how_desc', 'A transparent, leak-free 4-step pipeline from raw farm data to explainable yield estimates.')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-emerald-50/60 hover:bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/60 shadow-xs relative card-hover transition-all">
              <span className="text-4xl font-extrabold text-emerald-200/60 absolute top-4 right-4">01</span>
              <h4 className="text-base font-bold text-slate-900 mb-2">{t('landing_step1_title', 'Enter Farm Parameters')}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {t('landing_step1_desc', 'Select your crop, region, cropping season, cultivated area, annual precipitation, and fertilizer/pesticide usage.')}
              </p>
            </div>

            <div className="bg-emerald-50/60 hover:bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/60 shadow-xs relative card-hover transition-all">
              <span className="text-4xl font-extrabold text-emerald-200/60 absolute top-4 right-4">02</span>
              <h4 className="text-base font-bold text-slate-900 mb-2">{t('landing_step2_title', 'Pipeline Preprocessing')}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {t('landing_step2_desc', 'Scikit-Learn ColumnTransformer calculates application intensities (kg/ha), scales numerical inputs, and one-hot encodes categories.')}
              </p>
            </div>

            <div className="bg-emerald-50/60 hover:bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/60 shadow-xs relative card-hover transition-all">
              <span className="text-4xl font-extrabold text-emerald-200/60 absolute top-4 right-4">03</span>
              <h4 className="text-base font-bold text-slate-900 mb-2">{t('landing_step3_title', 'Random Forest Regression')}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {t('landing_step3_desc', 'Hyperparameter-optimized ensemble model generates an authentic yield prediction in tonnes/ha with empirical interval bounds.')}
              </p>
            </div>

            <div className="bg-emerald-50/60 hover:bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/60 shadow-xs relative card-hover transition-all">
              <span className="text-4xl font-extrabold text-emerald-200/60 absolute top-4 right-4">04</span>
              <h4 className="text-base font-bold text-slate-900 mb-2">{t('landing_step4_title', 'Audit & Insights')}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {t('landing_step4_desc', 'Prediction is securely saved to the platform registry. Explore historical trends, feature influences, and regional productivity comparisons.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FINAL CALL TO ACTION (FROSTED GLASS BANNER)                            */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center text-white space-y-6 shadow-2xl border border-emerald-500/30">
          {/* Background Image: Golden Harvest */}
          <div
            className="absolute inset-0 bg-cover bg-center -z-20 scale-105"
            style={{ backgroundImage: `url('/agri_harvest_field.jpg')` }}
          />
          {/* Translucent Emerald Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/92 via-emerald-900/85 to-emerald-950/92 backdrop-blur-[2px] -z-10" />

          <h3 className="text-2xl sm:text-4xl font-black tracking-tight relative z-10">
            {t('landing_cta_title', 'Ready to test agricultural predictions?')}
          </h3>
          <p className="max-w-2xl mx-auto text-emerald-100 text-sm sm:text-base relative z-10">
            {t('landing_cta_desc', 'Experience our machine learning models with real Indian agricultural data and explore interactive state-level productivity maps.')}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              to="/predict"
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all"
            >
              {t('landing_cta_btn1', 'Start Prediction Now')}
            </Link>
            <Link
              to="/map"
              className="px-8 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl border border-white/40 backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
            >
              {t('yield_map', 'Yield Map')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
