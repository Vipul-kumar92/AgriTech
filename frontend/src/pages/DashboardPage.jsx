import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Calendar
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

const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#14b8a6', '#0d9488'];

const DashboardPage = () => {
  const { user } = useAuth();
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
    return <LoadingSpinner message="Aggregating agricultural dashboard..." />;
  }

  const kpi = analytics?.kpi || {};
  const cropData = analytics?.crop_distribution?.slice(0, 7) || [];
  const seasonalData = analytics?.seasonal_distribution || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AgriTech Workspace Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-emerald-700">{user?.name}</span>. Real-time predictive agriculture insights.
          </p>
        </div>

        <Link
          to="/predict"
          className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all w-fit"
        >
          <Sprout className="w-4 h-4 mr-2" />
          New Prediction
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Predictions Logged"
          value={kpi.total_predictions || 0}
          subtitle="Persistent MongoDB audit records"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Average Predicted Yield"
          value={kpi.average_predicted_yield || '4.12'}
          unit="tonnes/ha"
          subtitle="Empirical platform mean"
          icon={Sprout}
          color="amber"
        />
        <StatCard
          title="Most Predicted Crop"
          value={kpi.most_predicted_crop || 'Rice'}
          subtitle="Highest query volume"
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Active Model R² Score"
          value={kpi.model_r2 || '0.8147'}
          subtitle={kpi.active_model || 'Random Forest Tuned'}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop-wise Productivity Benchmark */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Historical Crop Yield Benchmarks</h3>
              <p className="text-xs text-slate-500">Mean productivity across top cultivated crops (tonnes/ha)</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center">
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="crop" angle={-25} textAnchor="end" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} tonnes/ha`, 'Mean Yield']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="average_yield" fill="#10b981" radius={[6, 6, 0, 0]}>
                  {cropData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Yield Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Seasonal Productivity Variations</h3>
              <p className="text-xs text-slate-500">Average harvest yield categorized by agro-season</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              6 Seasons
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="season" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} tonnes/ha`, 'Avg Yield']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="average_yield" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Crop Predictions</h3>
            <p className="text-xs text-slate-500">Latest agricultural model inference logs</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center"
          >
            View All History <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Crop</th>
                <th className="px-6 py-3.5">State</th>
                <th className="px-6 py-3.5">Season</th>
                <th className="px-6 py-3.5">Cultivated Area</th>
                <th className="px-6 py-3.5">Predicted Yield</th>
                <th className="px-6 py-3.5">Total Production</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPredictions.length > 0 ? (
                recentPredictions.map((pred) => (
                  <tr key={pred.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-2.5">
                        <Sprout className="w-3.5 h-3.5" />
                      </div>
                      {pred.crop}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{pred.state}</td>
                    <td className="px-6 py-4 text-slate-600">{pred.season}</td>
                    <td className="px-6 py-4">{pred.area} ha</td>
                    <td className="px-6 py-4 font-extrabold text-emerald-700">
                      {pred.predicted_yield} <span className="text-xs font-normal text-slate-500">{pred.unit}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {pred.predicted_total_production} tonnes
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/predict/result/${pred.id}`}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        View Breakdown →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No predictions generated yet.{' '}
                    <Link to="/predict" className="text-emerald-600 font-semibold hover:underline">
                      Run your first prediction!
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
