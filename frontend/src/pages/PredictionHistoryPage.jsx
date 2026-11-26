import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  History,
  Search,
  Sprout,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Download,
  Printer,
  GitCompareArrows,
  X,
  Trophy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const escapeCsvCell = (value) => {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const PredictionHistoryPage = () => {
  const { isHindi, translateCrop, translateSeason, translateState } = useLanguage();
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  // Dropdown lists
  const [cropsList, setCropsList] = useState([]);
  const [seasonsList, setSeasonsList] = useState([]);
  const [statesList, setStatesList] = useState([]);

  // Delete, export, & compare state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [selectedCompare, setSelectedCompare] = useState([]);
  const [showComparePanel, setShowComparePanel] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.get('/dataset/stats');
        setCropsList(res.data.crops || []);
        setSeasonsList(res.data.seasons || []);
        setStatesList(res.data.states || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const buildFilterParams = (targetPage = page, targetLimit = 10) => {
    const params = new URLSearchParams({
      page: String(targetPage),
      limit: String(targetLimit)
    });
    if (search) params.append('search', search);
    if (cropFilter) params.append('crop', cropFilter);
    if (seasonFilter) params.append('season', seasonFilter);
    if (stateFilter) params.append('state', stateFilter);
    return params;
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/predictions?${buildFilterParams(page, 10).toString()}`);
      setPredictions(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch prediction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, cropFilter, seasonFilter, stateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCropFilter('');
    setSeasonFilter('');
    setStateFilter('');
    setPage(1);
  };

  const handleDeletePrediction = async (predId) => {
    setDeletingId(predId);
    setStatusMessage({ type: '', text: '' });
    try {
      await api.delete(`/predictions/${predId}`);
      setPredictions((prev) => prev.filter((item) => item.id !== predId));
      setTotal((prev) => Math.max(0, prev - 1));
      setSelectedCompare((prev) => {
        const next = prev.filter((item) => item.id !== predId);
        if (next.length < 2) setShowComparePanel(false);
        return next;
      });
      setConfirmDeleteId(null);
      setStatusMessage({
        type: 'success',
        text: isHindi ? 'पूर्वानुमान रिकॉर्ड हटाया गया।' : 'Prediction record deleted from audit history.'
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || (isHindi ? 'रिकॉर्ड हटाने में विफल।' : 'Failed to delete prediction record.')
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleCompare = (record) => {
    setSelectedCompare((prev) => {
      const exists = prev.some((item) => item.id === record.id);
      if (exists) {
        const next = prev.filter((item) => item.id !== record.id);
        if (next.length < 2) setShowComparePanel(false);
        return next;
      }
      if (prev.length >= 2) {
        return [prev[1], record];
      }
      const next = [...prev, record];
      if (next.length === 2) {
        setShowComparePanel(true);
      }
      return next;
    });
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const res = await api.get(`/predictions?${buildFilterParams(1, 100).toString()}`);
      const rows = res.data.items || predictions;
      if (!rows.length) {
        setStatusMessage({
          type: 'error',
          text: isHindi ? 'निर्यात करने के लिए कोई रिकॉर्ड नहीं मिला।' : 'No prediction records available to export.'
        });
        return;
      }

      const headers = [
        'ID',
        'Crop',
        'State',
        'Season',
        'Area_Ha',
        'Annual_Rainfall_mm',
        'Fertilizer_kg',
        'Pesticide_kg',
        'Predicted_Yield_t_ha',
        'Total_Harvest_tonnes',
        'MSP_INR_per_Quintal',
        'Gross_Revenue_INR',
        'Est_Net_Profit_INR',
        'Model_Version',
        'Created_At'
      ];

      const csvLines = [
        headers.join(','),
        ...rows.map((p) =>
          [
            p.id,
            p.crop,
            p.state,
            p.season,
            p.area,
            p.annual_rainfall_mm ?? '',
            p.fertilizer_kg ?? '',
            p.pesticide_kg ?? '',
            p.predicted_yield,
            p.predicted_total_production,
            p.msp_rate_per_quintal_inr ?? '',
            p.gross_revenue_inr ?? '',
            p.estimated_net_return_inr ?? '',
            p.model_version,
            p.created_at
          ]
            .map(escapeCsvCell)
            .join(',')
        )
      ];

      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `krishipulse_predictions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: isHindi ? `${rows.length} रिकॉर्ड CSV के रूप में डाउनलोड हुए।` : `Exported ${rows.length} predictions to CSV.`
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: isHindi ? 'CSV निर्यात विफल रहा।' : 'Failed to export prediction history CSV.'
      });
    } finally {
      setExportingCsv(false);
    }
  };

  const predA = selectedCompare[0] || null;
  const predB = selectedCompare[1] || null;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <History className="w-7 h-7 mr-2.5 text-emerald-600" />
            {isHindi ? 'पूर्वानुमान ऑडिट इतिहास' : 'Prediction Audit History'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isHindi
              ? 'रिकॉर्ड खोजें, किन्हीं 2 पूर्वानुमानों की तुलना करें, हटाएं या CSV/PDF के रूप में निर्यात करें।'
              : 'Search, compare any 2 predictions side-by-side, delete test entries, or export CSV/PDF.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="inline-flex items-center px-3.5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors disabled:opacity-60"
          >
            <Download className="w-4 h-4 mr-1.5 text-emerald-600" />
            {exportingCsv ? (isHindi ? 'निर्यात...' : 'Exporting...') : isHindi ? 'CSV निर्यात' : 'Export CSV'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors print:hidden"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-600" />
            {isHindi ? 'प्रिंट / PDF' : 'Print / PDF'}
          </button>

          <Link
            to="/predict"
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all w-fit hover:scale-105 active:scale-95"
          >
            <Sprout className="w-4 h-4 mr-1.5" />
            {isHindi ? 'नया पूर्वानुमान' : 'New Prediction'}
          </Link>
        </div>
      </div>

      {statusMessage.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
            statusMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center space-x-2 font-semibold">
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage({ type: '', text: '' })}
            className="text-slate-500 hover:text-slate-800"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-4 print:hidden">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isHindi ? 'फसल, राज्य या मौसम से खोजें...' : 'Search by crop, region, or season...'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isHindi ? 'खोजें' : 'Search'}
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {isHindi ? 'फसल फ़िल्टर' : 'Filter by Crop'}
            </label>
            <select
              value={cropFilter}
              onChange={(e) => {
                setCropFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{isHindi ? 'सभी फसलें' : 'All Crops'}</option>
              {cropsList.map((c) => (
                <option key={c} value={c}>
                  {isHindi ? translateCrop(c) : c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {isHindi ? 'राज्य फ़िल्टर' : 'Filter by State'}
            </label>
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{isHindi ? 'सभी राज्य' : 'All States'}</option>
              {statesList.map((s) => (
                <option key={s} value={s}>
                  {isHindi ? translateState(s) : s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {isHindi ? 'मौसम फ़िल्टर' : 'Filter by Season'}
            </label>
            <select
              value={seasonFilter}
              onChange={(e) => {
                setSeasonFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{isHindi ? 'सभी मौसम' : 'All Seasons'}</option>
              {seasonsList.map((sn) => (
                <option key={sn} value={sn}>
                  {isHindi ? translateSeason(sn) : sn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {isHindi ? 'फ़िल्टर हटाएं' : 'Clear Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Compare Selection Strip */}
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 print:hidden">
        <div className="flex items-center space-x-2 text-xs text-emerald-950 font-semibold">
          <GitCompareArrows className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            {selectedCompare.length === 0
              ? isHindi
                ? 'किन्हीं 2 पूर्वानुमानों की तुलना करने के लिए नीचे चेकबॉक्स चुनें।'
                : 'Check any 2 rows below to compare yield and net MSP profit side-by-side.'
              : selectedCompare.length === 1
                ? isHindi
                  ? `1 चयनित (${translateCrop(predA.crop)} • ${translateState(predA.state)}) — तुलना के लिए 1 और चुनें`
                  : `1 selected (${predA.crop} • ${predA.state}) — select 1 more to compare`
                : isHindi
                  ? `तुलना तैयार: ${translateCrop(predA.crop)} (${translateState(predA.state)}) बनाम ${translateCrop(predB.crop)} (${translateState(predB.state)})`
                  : `Ready to compare: ${predA.crop} (${predA.state}) vs ${predB.crop} (${predB.state})`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {selectedCompare.length === 2 && (
            <button
              type="button"
              onClick={() => setShowComparePanel((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              {showComparePanel
                ? isHindi ? 'तुलना छिपाएं' : 'Hide Comparison'
                : isHindi ? 'तुलना दिखाएं' : 'Compare Side-by-Side'}
            </button>
          )}
          {selectedCompare.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedCompare([]);
                setShowComparePanel(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold transition-colors"
            >
              {isHindi ? 'साफ़ करें' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Panel */}
      {showComparePanel && predA && predB && (
        <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-md p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center">
                <GitCompareArrows className="w-5 h-5 mr-2 text-emerald-600" />
                {isHindi ? 'दो पूर्वानुमानों की तुलना (Yield & MSP Profit)' : 'Side-by-Side Prediction Comparison'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {translateCrop(predA.crop)} ({translateState(predA.state)}) vs {translateCrop(predB.crop)} ({translateState(predB.state)})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowComparePanel(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-2.5">{isHindi ? 'पैरामीटर' : 'Metric'}</th>
                    <th className="px-4 py-2.5 text-emerald-800">{translateCrop(predA.crop)}</th>
                    <th className="px-4 py-2.5 text-teal-800">{translateCrop(predB.crop)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-600">{isHindi ? 'राज्य / मौसम' : 'State / Season'}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{translateState(predA.state)} • {translateSeason(predA.season)}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{translateState(predB.state)} • {translateSeason(predB.season)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-600">{isHindi ? 'क्षेत्रफल / वर्षा' : 'Area / Rainfall'}</td>
                    <td className="px-4 py-2.5">{predA.area} ha • {predA.annual_rainfall_mm ?? '—'} mm</td>
                    <td className="px-4 py-2.5">{predB.area} ha • {predB.annual_rainfall_mm ?? '—'} mm</td>
                  </tr>
                  <tr className="bg-emerald-50/40">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{isHindi ? 'अनुमानित उपज' : 'Predicted Yield'}</td>
                    <td className="px-4 py-2.5 font-black text-emerald-700">
                      {predA.predicted_yield} t/ha {predA.predicted_yield >= predB.predicted_yield && <Trophy className="w-3.5 h-3.5 inline text-amber-500 ml-1" />}
                    </td>
                    <td className="px-4 py-2.5 font-black text-teal-700">
                      {predB.predicted_yield} t/ha {predB.predicted_yield > predA.predicted_yield && <Trophy className="w-3.5 h-3.5 inline text-amber-500 ml-1" />}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-600">{isHindi ? 'कुल उत्पादन' : 'Total Harvest'}</td>
                    <td className="px-4 py-2.5 font-bold">{predA.predicted_total_production} tonnes</td>
                    <td className="px-4 py-2.5 font-bold">{predB.predicted_total_production} tonnes</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-600">{isHindi ? 'MSP / बाजार भाव' : 'MSP Rate'}</td>
                    <td className="px-4 py-2.5">₹{Number(predA.msp_rate_per_quintal_inr || 0).toLocaleString('en-IN')}/q</td>
                    <td className="px-4 py-2.5">₹{Number(predB.msp_rate_per_quintal_inr || 0).toLocaleString('en-IN')}/q</td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{isHindi ? 'अनुमानित शुद्ध लाभ' : 'Est. Net Profit'}</td>
                    <td className="px-4 py-2.5 font-black text-emerald-700">
                      ₹{Number(predA.estimated_net_return_inr || 0).toLocaleString('en-IN')}
                      {(predA.estimated_net_return_inr || 0) >= (predB.estimated_net_return_inr || 0) && (
                        <Trophy className="w-3.5 h-3.5 inline text-amber-500 ml-1" />
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-black text-teal-700">
                      ₹{Number(predB.estimated_net_return_inr || 0).toLocaleString('en-IN')}
                      {(predB.estimated_net_return_inr || 0) > (predA.estimated_net_return_inr || 0) && (
                        <Trophy className="w-3.5 h-3.5 inline text-amber-500 ml-1" />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dual Visual Chart */}
            <div className="h-60 bg-slate-50/70 rounded-xl border border-slate-200 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      label: `${translateCrop(predA.crop)} (${translateState(predA.state).slice(0, 8)})`,
                      yield_t_ha: predA.predicted_yield,
                      net_profit_lakhs: predA.estimated_net_return_lakhs || 0
                    },
                    {
                      label: `${translateCrop(predB.crop)} (${translateState(predB.state).slice(0, 8)})`,
                      yield_t_ha: predB.predicted_yield,
                      net_profit_lakhs: predB.estimated_net_return_lakhs || 0
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#059669', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#d97706', fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="net_profit_lakhs"
                    name={isHindi ? 'शुद्ध लाभ (₹ लाख)' : 'Net Profit (₹ Lakhs)'}
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    barSize={38}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="yield_t_ha"
                    name={isHindi ? 'उपज (t/ha)' : 'Yield (t/ha)'}
                    fill="#d97706"
                    radius={[6, 6, 0, 0]}
                    barSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message={isHindi ? 'पूर्वानुमान ऑडिट रिकॉर्ड लोड हो रहे हैं...' : 'Querying prediction audit log...'} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-emerald-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-emerald-100">
                  <tr>
                    <th className="px-4 py-3.5 text-center print:hidden">{isHindi ? 'तुलना' : 'Compare'}</th>
                    <th className="px-4 py-3.5">{isHindi ? 'फसल' : 'Crop'}</th>
                    <th className="px-4 py-3.5">{isHindi ? 'राज्य / क्षेत्र' : 'Region / State'}</th>
                    <th className="px-4 py-3.5">{isHindi ? 'मौसम' : 'Season'}</th>
                    <th className="px-4 py-3.5">{isHindi ? 'क्षेत्रफल' : 'Area (ha)'}</th>
                    <th className="px-4 py-3.5">{isHindi ? 'अनुमानित उपज' : 'Predicted Yield'}</th>
                    <th className="px-4 py-3.5">{isHindi ? 'शुद्ध MSP लाभ' : 'Net MSP Profit'}</th>
                    <th className="px-4 py-3.5">{isHindi ? 'दिनांक' : 'Date'}</th>
                    <th className="px-4 py-3.5 text-right print:hidden">{isHindi ? 'कार्रवाई' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictions.length > 0 ? (
                    predictions.map((p) => {
                      const isChecked = selectedCompare.some((item) => item.id === p.id);
                      return (
                        <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-emerald-50/50' : ''}`}>
                          <td className="px-4 py-4 text-center print:hidden">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCompare(p)}
                              aria-label={`Select ${p.crop} in ${p.state} for comparison`}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-900">
                            <div className="flex items-center">
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-2.5 flex-shrink-0">
                                <Sprout className="w-3.5 h-3.5" />
                              </div>
                              <span>{isHindi ? translateCrop(p.crop) : p.crop}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-700">{isHindi ? translateState(p.state) : p.state}</td>
                          <td className="px-4 py-4 text-slate-600">{isHindi ? translateSeason(p.season) : p.season}</td>
                          <td className="px-4 py-4">{p.area} {isHindi ? 'हे.' : 'ha'}</td>
                          <td className="px-4 py-4">
                            <div className="font-extrabold text-emerald-700">
                              {p.predicted_yield} <span className="text-xs font-normal text-slate-500">{isHindi ? 'टन/हे.' : 't/ha'}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {p.predicted_total_production} {isHindi ? 'टन' : 'tonnes'}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-bold text-slate-900">
                              ₹{Number(p.estimated_net_return_inr || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-semibold">
                              ₹{p.estimated_net_return_lakhs ?? 0} L
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-400">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN') : 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap print:hidden">
                            <div className="inline-flex items-center space-x-1.5">
                              <Link
                                to={`/predict/result/${p.id}`}
                                className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> {isHindi ? 'देखें' : 'View'}
                              </Link>

                              {confirmDeleteId === p.id ? (
                                <div className="inline-flex items-center space-x-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePrediction(p.id)}
                                    disabled={deletingId === p.id}
                                    className="text-[11px] font-bold text-red-700 hover:underline disabled:opacity-50"
                                  >
                                    {deletingId === p.id ? '...' : isHindi ? 'हटाएं' : 'Confirm'}
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                                  >
                                    {isHindi ? 'रद्द' : 'Cancel'}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(p.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title={isHindi ? 'रिकॉर्ड हटाएं' : 'Delete prediction record'}
                                  aria-label="Delete prediction record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">
                        {isHindi ? 'चयनित फ़िल्टर के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।' : 'No historical predictions match the selected filter criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 print:hidden">
              <span>
                {isHindi
                  ? `कुल ${total} में से ${predictions.length} रिकॉर्ड्स प्रदर्शित`
                  : `Showing ${predictions.length} of ${total} total records`}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-800">
                  {isHindi ? `पृष्ठ ${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Next Page"
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

export default PredictionHistoryPage;
