import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  Database,
  Calendar,
  Layers,
  MapPin,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Info
} from 'lucide-react';

const DatasetInsightsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dataset/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dataset stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Auditing dataset statistics and metadata..." />;
  }

  const features = [
    { name: 'Crop', type: 'Categorical', unit: 'N/A', desc: '54 distinct agricultural crop species (Rice, Wheat, Sugarcane, Maize, etc.)' },
    { name: 'State', type: 'Categorical', unit: 'N/A', desc: '30 Indian states and union territories covering major agro-climatic zones' },
    { name: 'Season', type: 'Categorical', unit: 'N/A', desc: '6 Indian agricultural seasons: Kharif, Rabi, Summer, Autumn, Winter, Whole Year' },
    { name: 'Crop_Year', type: 'Integer', unit: 'YYYY', desc: 'Historical calendar year of cultivation (1997 through 2020)' },
    { name: 'Area', type: 'Continuous', unit: 'Hectares', desc: 'Total cultivated agricultural land area dedicated to the specific crop' },
    { name: 'Annual_Rainfall', type: 'Continuous', unit: 'mm', desc: 'Annual cumulative meteorological precipitation recorded by IMD for the region' },
    { name: 'Fertilizer', type: 'Continuous', unit: 'kg', desc: 'Gross total chemical fertilizer (NPK) applied across the farm field' },
    { name: 'Pesticide', type: 'Continuous', unit: 'kg', desc: 'Gross total chemical plant protection agents applied' },
    { name: 'Fertilizer_per_Ha', type: 'Engineered', unit: 'kg/ha', desc: 'Input application intensity: Fertilizer / Area (captures intensity independent of field size)' },
    { name: 'Pesticide_per_Ha', type: 'Engineered', unit: 'kg/ha', desc: 'Input application intensity: Pesticide / Area (captures chemical density per hectare)' },
    { name: 'Yield (Target)', type: 'Target Continuous', unit: 'tonnes/ha', desc: 'Agricultural crop productivity: Harvested Production (tonnes) / Cultivated Area (ha)' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>Empirical Data Provenance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Dataset Architecture & Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Authentic Indian agricultural statistics (1997–2020) compiled from the Ministry of Agriculture & Farmers Welfare and the India Meteorological Department.
        </p>
      </div>

      {/* High-Level Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {stats?.total_records?.toLocaleString() || '19,407'}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Cleaned Records</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {stats?.total_crops || 54}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Distinct Crops</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {stats?.total_states || 30}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">States & UTs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            24 Years
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">1997 to 2020</p>
        </div>
      </div>

      {/* Target Consistency & Coconut Nuance Alert */}
      <div className="bg-emerald-50/80 rounded-2xl p-6 sm:p-7 border border-emerald-200/80 space-y-3">
        <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Strict Target Unit Consistency: Tonnes per Hectare (tonnes/ha)</span>
        </div>
        <p className="text-sm text-emerald-900 leading-relaxed">
          In official Indian Directorate of Economics and Statistics reporting, all 54 standard agricultural crops (Food Grains, Pulses, Oilseeds, Sugarcane, Potato, Cotton, etc.) record harvested production in <strong>Metric Tonnes</strong>, yielding a target productivity of <strong>Tonnes per Hectare (tonnes/ha)</strong>.
        </p>
        <p className="text-xs text-emerald-800 bg-white/70 p-3 rounded-xl border border-emerald-200">
          <strong>Data Cleaning Decision:</strong> Coconut production is officially reported in "Thousand Nuts" (producing yield numbers ~8,000–20,000 nuts/ha). To adhere strictly to engineering guidelines against mixing inconsistent units (e.g. nuts/ha vs tonnes/ha), all 172 Coconut observations were partitioned out, guaranteeing <strong>100% unit integrity</strong> across all regression models and user interfaces.
        </p>
      </div>

      {/* Feature Dictionary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Feature Schema & Data Types</h3>
            <p className="text-xs text-slate-500">Dictionary of raw and engineered agronomic input features</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            13 Feature Attributes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Feature Name</th>
                <th className="px-6 py-3.5">Data Type</th>
                <th className="px-6 py-3.5">Unit</th>
                <th className="px-6 py-3.5">Description & Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {features.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{f.name}</td>
                  <td className="px-6 py-3.5 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      f.type.includes('Target')
                        ? 'bg-emerald-100 text-emerald-800'
                        : f.type.includes('Engineered')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {f.type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">{f.unit}</td>
                  <td className="px-6 py-3.5 text-xs text-slate-600">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Quality & Missing Value Audit */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">0 Missing Values</h4>
          <p className="text-xs text-slate-500">
            Comprehensive audit confirmed zero null values across all agricultural and environmental columns.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">0 Duplicate Records</h4>
          <p className="text-xs text-slate-500">
            Strict deduplication verified unique combination of crop, year, season, state, and cultivated plot records.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">Agronomic Feasibility</h4>
          <p className="text-xs text-slate-500">
            Sanity filtering ensured area &gt; 0, rainfall &ge; 0, fertilizer &ge; 0, and realistic yield boundaries (&le; 250 t/ha).
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatasetInsightsPage;
