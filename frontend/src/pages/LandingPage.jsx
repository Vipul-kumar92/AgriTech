import React from 'react';
import { Link } from 'react-router-dom';
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
  Award
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.100),theme(colors.white))] opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Final-Year B.Tech Capstone Project • AI & AgriTech</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Predict. Plan. <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Grow.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 font-normal leading-relaxed">
            AI-powered crop yield prediction using 24 years of authentic agricultural, environmental, and farming management data across 30 Indian states. No dummy metrics. 100% empirical machine learning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/predict"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
            >
              <Sprout className="w-5 h-5 mr-2" />
              Predict Crop Yield
            </Link>
            <Link
              to="/analytics"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
            >
              <BarChart3 className="w-5 h-5 mr-2 text-slate-500" />
              Explore Analytics
            </Link>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">19,407</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Authentic Records</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">54 Crops</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">30 Indian States</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">0.81 R²</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Random Forest Tuned</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">tonnes/ha</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Standard Target Unit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Crop Yield Prediction? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Crop Yield Prediction Matters
          </h2>
          <p className="text-base text-slate-600">
            Climate variability, unpredictable precipitation, and changing soil nutrient demands make empirical agricultural forecasting crucial for food security, credit risk assessment, and farmer livelihoods.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm card-hover">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Farmer Decision Support</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Provides farmers with data-driven yield expectations based on seasonal rainfall, cultivated land size, and chemical input intensity, assisting in harvest logistics.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm card-hover">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Explainable AI (XAI)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Demystifies machine learning predictions by displaying feature influence ranking, clarifying how crop genotype, geography, and inputs shape model behavior without false causality.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm card-hover">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Policy & Agricultural Credit</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enables agricultural banks, insurance providers, and government procurement agencies to benchmark seasonal productivity variations across diverse agro-climatic zones.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-slate-100/70 to-white py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-600 text-base">
              A transparent, leak-free 4-step pipeline from raw farm data to explainable yield estimates.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-extrabold text-emerald-100 absolute top-4 right-4">01</span>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Enter Farm Parameters</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your crop, region, cropping season, cultivated area, annual precipitation, and fertilizer/pesticide usage.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-extrabold text-emerald-100 absolute top-4 right-4">02</span>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Pipeline Preprocessing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scikit-Learn ColumnTransformer calculates application intensities (kg/ha), scales numerical inputs, and one-hot encodes categories.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-extrabold text-emerald-100 absolute top-4 right-4">03</span>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Random Forest Regression</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hyperparameter-optimized ensemble model generates an authentic yield prediction in tonnes/ha with empirical interval bounds.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-extrabold text-emerald-100 absolute top-4 right-4">04</span>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Audit & Insights</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prediction is recorded to MongoDB. Explore historical trends, feature influences, and regional productivity comparisons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Full-Stack Technology Stack</h2>
          <p className="text-slate-600 text-base mt-2">Enterprise-grade architecture built to university engineering capstone standards.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="font-bold text-slate-900 text-base">React 18</p>
            <p className="text-xs text-slate-500 mt-1">Tailwind CSS + Vite</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="font-bold text-slate-900 text-base">FastAPI</p>
            <p className="text-xs text-slate-500 mt-1">Python Async REST</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="font-bold text-slate-900 text-base">Scikit-Learn</p>
            <p className="text-xs text-slate-500 mt-1">Random Forest (Tuned)</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="font-bold text-slate-900 text-base">MongoDB 8.0</p>
            <p className="text-xs text-slate-500 mt-1">Motor Async Driver</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="font-bold text-slate-900 text-base">Recharts</p>
            <p className="text-xs text-slate-500 mt-1">Dynamic Visualizations</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="font-bold text-slate-900 text-base">XAI & Auditing</p>
            <p className="text-xs text-slate-500 mt-1">Feature Influence</p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-emerald-800 to-teal-700 rounded-3xl p-10 sm:p-14 text-center text-white space-y-6 shadow-xl shadow-emerald-900/20">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to test agricultural predictions?</h3>
          <p className="max-w-2xl mx-auto text-emerald-100 text-base">
            Experience our machine learning models with real Indian agricultural data or review our 6-model benchmark results.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/predict"
              className="px-8 py-3.5 bg-white text-emerald-800 font-bold rounded-xl shadow-md hover:bg-emerald-50 transition-colors"
            >
              Start Prediction Now
            </Link>
            <Link
              to="/model-performance"
              className="px-8 py-3.5 bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold rounded-xl border border-emerald-500/50 transition-colors"
            >
              View Model Comparison
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
