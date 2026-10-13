import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  Sparkles,
  HelpCircle,
  AlertCircle,
  Brain,
  Layers,
  Award,
  BookOpen
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

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'];

const FeatureImportancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureImportance = async () => {
      try {
        const res = await api.get('/feature-importance');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load feature importance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatureImportance();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating model feature influence and explainability metrics..." />;
  }

  const features = data?.features || [];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable Artificial Intelligence (XAI)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Model Feature Influence & Explainability
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quantifying the relative predictive contribution of agronomic, geographic, and climate features within the champion Random Forest Regressor.
        </p>
      </div>

      {/* Critical Scientific Clarification Banner */}
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 space-y-2">
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <span>Scientific Principle: Correlation & Predictive Weight vs. Agronomic Causality</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          In strict accordance with scientific standards: <strong>Feature importance does NOT prove causation.</strong> High model importance for rainfall or fertilizer indicates that these variables strongly minimize Gini split impurity within decision trees, but does not imply that increased inputs will guarantee elevated yields without balanced soil health and pest resistance.
        </p>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Ranked Model Feature Influence (%)</h3>
          <p className="text-xs text-slate-500">
            Normalized Gini importance distribution across the 200 estimator trees of the production pipeline.
          </p>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={features}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 70, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 80]} />
              <YAxis dataKey="feature" type="category" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Model Influence']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="influence_percent" radius={[0, 6, 6, 0]}>
                {features.map((_, index) => (
                  <Cell key={`feat-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Breakdown Explanations */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-base">Crop Genotype (66.77% Influence)</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Agricultural yield baseline is fundamentally bounded by crop biological genetics. Sugarcane produces 60–100 tonnes of water-rich biomass per hectare, whereas grain cereals (Rice, Wheat) produce 3–4.5 tonnes/ha. The model naturally partitions crop types at primary decision tree nodes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-base">State & Geography (14.83% Influence)</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Geographic state serves as a powerful proxy for regional soil taxonomy (alluvial Indo-Gangetic plains vs. Deccan black cotton vertisols), state irrigation canal density, agricultural power subsidies, and local mechanization infrastructure.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-base">Cultivated Land Extent (8.84% Influence)</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Large-scale consolidated farming often benefits from mechanized combine harvesting and professional crop management, whereas highly fragmented marginal holdings may experience different productivity intensity.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-slate-900 text-base">Rainfall & Management Inputs (9.56% Combined)</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Annual precipitation, chemical fertilizer intensity (kg/ha), and pesticide intensity (kg/ha) act as critical secondary modulators that differentiate high-performing harvest seasons from drought-stressed or pest-impacted harvests.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureImportancePage;
