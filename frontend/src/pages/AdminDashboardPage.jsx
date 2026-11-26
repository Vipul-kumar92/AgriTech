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
  Star,
  ClipboardList,
  ExternalLink
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('feedback');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, logsRes, fbRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/logs?limit=25'),
          api.get('/admin/feedback?limit=25')
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data || []);
        setFeedbackList(fbRes.data?.items || []);
        setFeedbackTotal(fbRes.data?.total || 0);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleRatingFilterChange = async (filterVal) => {
    setRatingFilter(filterVal);
    setLoadingFeedback(true);
    try {
      const params = new URLSearchParams({ limit: '25' });
      if (filterVal === '5') {
        params.append('min_rating', '5');
        params.append('max_rating', '5');
      } else if (filterVal === '4') {
        params.append('min_rating', '4');
        params.append('max_rating', '4');
      } else if (filterVal === 'low') {
        params.append('max_rating', '3');
      }
      const res = await api.get(`/admin/feedback?${params.toString()}`);
      setFeedbackList(res.data?.items || []);
      setFeedbackTotal(res.data?.total || 0);
    } catch (err) {
      console.error('Failed to filter feedback:', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

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
            Global monitoring of user registrations, machine learning executions, and farmer feedback.
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

      {/* Tabbed Governance Panel: Farmer Feedback Inbox & System Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'feedback'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Farmer Feedback Inbox ({stats?.total_feedback ?? feedbackTotal})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'logs'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>System Activity Logs ({logs.length})</span>
            </button>
          </div>

          {activeTab === 'feedback' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { key: 'all', label: 'All Ratings' },
                { key: '5', label: '5 ★' },
                { key: '4', label: '4 ★' },
                { key: 'low', label: '≤ 3 ★' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleRatingFilterChange(opt.key)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors border ${
                    ratingFilter === opt.key
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'feedback' ? (
          loadingFeedback ? (
            <LoadingSpinner message="Loading farmer ratings and comments..." />
          ) : (
            <div className="divide-y divide-slate-100">
              {feedbackList.length > 0 ? (
                feedbackList.map((fb) => (
                  <div key={fb.id} className="p-5 sm:px-6 hover:bg-emerald-50/30 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center space-x-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-800 font-mono">{fb.user_email}</span>
                        {fb.crop && (
                          <Link
                            to={`/predict/result/${fb.prediction_id}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                          >
                            <span>
                              {fb.crop} • {fb.state} ({fb.predicted_yield} t/ha)
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      <p className="text-sm text-slate-700">
                        {fb.comment ? (
                          fb.comment
                        ) : (
                          <span className="italic text-slate-400">No written comment provided.</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {fb.created_at ? new Date(fb.created_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-slate-400 text-sm">
                  No farmer feedback submissions match this rating filter.
                </div>
              )}
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">User Identity</th>
                  <th className="px-6 py-3.5">Details / Crop</th>
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
