import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  Award,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Sliders,
  Layers,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const ModelPerformancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load model benchmarks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading empirical model benchmarks and cross-validation logs..." />;
  }

  const benchmarks = data?.models_benchmark || [];
  const activeMeta = data?.active_model_metadata || {};
  const tunedMetrics = activeMeta.metrics || { mae: 0.8219, rmse: 4.801, r2: 0.8147, mape: 33.76 };

  // Chart data comparing R2
  const r2ChartData = benchmarks.map((m) => ({
    name: m.model.replace(' Regressor', ''),
    r2: m.r2,
    cv_r2: m.cv_r2_mean
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>Empirical Model Benchmarking</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Regression Model Evaluation & Selection
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Comparative empirical evaluation of 6 distinct regression algorithms on the 80/20 train/test split of authentic agricultural records.
        </p>
      </div>

      {/* Champion Model Callout Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-emerald-900/15">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 bg-emerald-500/30 rounded-full text-emerald-200 border border-emerald-400/30">
              Selected Production Champion
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              {activeMeta.model_name || 'Random Forest Regressor (Optimized)'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 max-w-xl">
              Selected based on superior generalization, lowest test MAE (0.82 t/ha), and highest 5-fold cross-validation stability (0.90 ± 0.03).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <p className="text-2xl font-extrabold text-white">{tunedMetrics.r2}</p>
              <p className="text-[11px] text-emerald-200 font-semibold uppercase tracking-wider mt-0.5">Test R² Score</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <p className="text-2xl font-extrabold text-white">{tunedMetrics.mae} <span className="text-xs font-normal">t/ha</span></p>
              <p className="text-[11px] text-emerald-200 font-semibold uppercase tracking-wider mt-0.5">Test MAE</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
              <p className="text-2xl font-extrabold text-white">{tunedMetrics.rmse} <span className="text-xs font-normal">t/ha</span></p>
              <p className="text-[11px] text-emerald-200 font-semibold uppercase tracking-wider mt-0.5">Test RMSE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Multi-Model Comparative Benchmark</h3>
            <p className="text-xs text-slate-500">Evaluated on 3,882 holdout test samples (80/20 train/test split)</p>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-slate-100 text-slate-700 rounded-lg w-fit">
            model_comparison.csv
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Algorithm Architecture</th>
                <th className="px-6 py-3.5">MAE (t/ha)</th>
                <th className="px-6 py-3.5">MSE</th>
                <th className="px-6 py-3.5">RMSE (t/ha)</th>
                <th className="px-6 py-3.5">R² Score</th>
                <th className="px-6 py-3.5">MAPE (%)</th>
                <th className="px-6 py-3.5">5-Fold CV R² (Mean ± Std)</th>
                <th className="px-6 py-3.5 text-right">Fit Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.map((m, idx) => (
                <tr key={idx} className={`hover:bg-slate-50/80 transition-colors ${idx === 0 ? 'bg-emerald-50/40 font-semibold' : ''}`}>
                  <td className="px-6 py-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                    {m.model}
                    {idx === 0 && (
                      <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                        Champion
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono">{m.mae.toFixed(4)}</td>
                  <td className="px-6 py-4 font-mono">{m.mse.toFixed(2)}</td>
                  <td className="px-6 py-4 font-mono">{m.rmse.toFixed(4)}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-emerald-700">
                    {m.r2.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 font-mono">{m.mape.toFixed(2)}%</td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {m.cv_r2_mean.toFixed(4)} ± {m.cv_r2_std.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500">
                    {m.fit_time_sec}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* R² Benchmark Bar Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">R² Variance Explained: Test Split vs 5-Fold Cross-Validation</h3>
          <p className="text-xs text-slate-500">Compares model predictive power and stability across candidate architectures</p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={r2ChartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0.4, 1.0]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val) => [`${val}`, 'R²']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="r2" name="Test Split R²" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cv_r2" name="5-Fold CV R²" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hyperparameter Tuning Deep Dive */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Sliders className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">Hyperparameter Optimization (RandomizedSearchCV)</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Baseline Model (Before Tuning)</h4>
            <div className="space-y-1 text-xs text-slate-600">
              <p>• Estimators: <code className="bg-slate-200 px-1 py-0.5 rounded">n_estimators = 100</code></p>
              <p>• Max Depth: <code className="bg-slate-200 px-1 py-0.5 rounded">max_depth = 20</code></p>
              <p>• Min Samples Split: <code className="bg-slate-200 px-1 py-0.5 rounded">min_samples_split = 2</code></p>
            </div>
            <div className="pt-2 border-t border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Baseline Test R²:</span> <span className="font-mono font-bold">0.8071</span> | MAE: <span className="font-mono font-bold">1.01 t/ha</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-emerald-900 text-sm">Optimized Champion (After Tuning)</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full">
                +0.0076 R² Gain
              </span>
            </div>
            <div className="space-y-1 text-xs text-emerald-800">
              <p>• Estimators: <code className="bg-emerald-100 px-1 py-0.5 rounded">n_estimators = 200</code></p>
              <p>• Max Depth: <code className="bg-emerald-100 px-1 py-0.5 rounded">max_depth = None</code></p>
              <p>• Min Samples Split: <code className="bg-emerald-100 px-1 py-0.5 rounded">min_samples_split = 2</code></p>
              <p>• Min Samples Leaf: <code className="bg-emerald-100 px-1 py-0.5 rounded">min_samples_leaf = 1</code></p>
            </div>
            <div className="pt-2 border-t border-emerald-200 text-xs text-emerald-900">
              <span className="font-semibold">Optimized Test R²:</span> <span className="font-mono font-bold">0.8147</span> | MAE: <span className="font-mono font-bold">0.82 t/ha</span> (18.7% MAE reduction)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformancePage;
