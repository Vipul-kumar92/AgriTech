import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatCard, LoadingSpinner } from '../components/common/StatCard';
import {
  ShieldCheck,
  Users,
  FileSpreadsheet,
  MessageSquare,
  Award,
  Activity,
  ArrowUpRight,
  Database
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/logs?limit=10')
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data || []);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Auditing global system metrics and admin logs..." />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrative Governance Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            System Control & Audit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global monitoring of user registrations, machine learning executions, and feedback logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            User Directory
          </Link>
          <Link
            to="/admin/predictions"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Global Predictions
          </Link>
        </div>
      </div>

      {/* Admin KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Accounts"
          value={stats?.total_users || 0}
          subtitle="Users & Administrators"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Platform Predictions"
          value={stats?.total_predictions || 0}
          subtitle="All accounts combined"
          icon={FileSpreadsheet}
          color="emerald"
        />
        <StatCard
          title="Farmer Feedback Submissions"
          value={stats?.total_feedback || 0}
          subtitle={`Avg: ${stats?.average_feedback_rating || 5.0} / 5 Stars`}
          icon={MessageSquare}
          color="amber"
        />
        <StatCard
          title="Active Model R²"
          value={stats?.model_r2 || '0.8147'}
          subtitle={stats?.active_model_name || 'Random Forest Tuned'}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Recent System Activity Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent System Activity Audit Logs</h3>
            <p className="text-xs text-slate-500">Immutable ledger events captured from FastAPI middleware</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            system_logs collection
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">User Identity</th>
                <th className="px-6 py-3.5">Associated Crop</th>
                <th className="px-6 py-3.5">Predicted Yield</th>
                <th className="px-6 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{log.user}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{log.crop || '—'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      {log.predicted_yield ? `${log.predicted_yield} t/ha` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No system log entries recorded yet.
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

export default AdminDashboardPage;
