import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  FileSpreadsheet,
  Sprout,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminPredictionsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPredictions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/predictions?page=${page}&limit=15`);
        setPredictions(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      } catch (err) {
        console.error('Failed to load global predictions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPredictions();
  }, [page]);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Global System-Wide Audit Log</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          All System Predictions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete immutable audit trail of all agricultural predictions generated across all accounts.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Auditing global system prediction ledger..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">User Identity</th>
                    <th className="px-6 py-3.5">Crop</th>
                    <th className="px-6 py-3.5">State</th>
                    <th className="px-6 py-3.5">Season</th>
                    <th className="px-6 py-3.5">Area</th>
                    <th className="px-6 py-3.5">Predicted Yield</th>
                    <th className="px-6 py-3.5">Total Harvest</th>
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">{p.user_email}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                        <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center mr-2">
                          <Sprout className="w-3.5 h-3.5" />
                        </div>
                        {p.crop}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{p.state}</td>
                      <td className="px-6 py-4 text-slate-600">{p.season}</td>
                      <td className="px-6 py-4">{p.area} ha</td>
                      <td className="px-6 py-4 font-bold text-emerald-700">
                        {p.predicted_yield} <span className="text-xs font-normal text-slate-500">{p.unit}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{p.predicted_total_production} t</td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/predict/result/${p.id}`}
                          className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total recorded inferences: {total}</span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-800">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPredictionsPage;
