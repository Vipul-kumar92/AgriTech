import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  History,
  Search,
  Filter,
  Sprout,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar
} from 'lucide-react';

const PredictionHistoryPage = () => {
  const { t, isHindi, translateCrop, translateSeason, translateState } = useLanguage();
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

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10'
      });
      if (search) params.append('search', search);
      if (cropFilter) params.append('crop', cropFilter);
      if (seasonFilter) params.append('season', seasonFilter);
      if (stateFilter) params.append('state', stateFilter);

      const res = await api.get(`/predictions?${params.toString()}`);
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

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <History className="w-7 h-7 mr-2.5 text-emerald-600" />
            {isHindi ? 'पूर्वानुमान ऑडिट इतिहास' : 'Prediction Audit History'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isHindi
              ? 'डेटाबेस में संग्रहीत प्रत्येक फसल उपज पूर्वानुमान को खोजें, फ़िल्टर करें और ऑडिट करें।'
              : 'Search, filter, and audit every crop yield prediction stored in the database.'}
          </p>
        </div>
        <Link
          to="/predict"
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all w-fit hover:scale-105 active:scale-95"
        >
          <Sprout className="w-4 h-4 mr-1.5" />
          {isHindi ? 'नया पूर्वानुमान' : 'New Prediction'}
        </Link>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
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
                    <th className="px-6 py-3.5">{isHindi ? 'फसल' : 'Crop'}</th>
                    <th className="px-6 py-3.5">{isHindi ? 'राज्य / क्षेत्र' : 'Region / State'}</th>
                    <th className="px-6 py-3.5">{isHindi ? 'मौसम' : 'Season'}</th>
                    <th className="px-6 py-3.5">{isHindi ? 'क्षेत्रफल' : 'Area (ha)'}</th>
                    <th className="px-6 py-3.5">{isHindi ? 'अनुमानित उपज' : 'Predicted Yield'}</th>
                    <th className="px-6 py-3.5">{isHindi ? 'कुल उत्पादन' : 'Total Harvest'}</th>
                    <th className="px-6 py-3.5">{isHindi ? 'मॉडल' : 'Model'}</th>
                    <th className="px-6 py-3.5">{isHindi ? 'दिनांक' : 'Date'}</th>
                    <th className="px-6 py-3.5 text-right">{isHindi ? 'कार्रवाई' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictions.length > 0 ? (
                    predictions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-2.5">
                            <Sprout className="w-3.5 h-3.5" />
                          </div>
                          {isHindi ? translateCrop(p.crop) : p.crop}
                        </td>
                        <td className="px-6 py-4 text-slate-700">{isHindi ? translateState(p.state) : p.state}</td>
                        <td className="px-6 py-4 text-slate-600">{isHindi ? translateSeason(p.season) : p.season}</td>
                        <td className="px-6 py-4">{p.area} {isHindi ? 'हे.' : 'ha'}</td>
                        <td className="px-6 py-4 font-extrabold text-emerald-700">
                          {p.predicted_yield} <span className="text-xs font-normal text-slate-500">{isHindi ? 'टन/हे.' : p.unit}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {p.predicted_total_production} {isHindi ? 'टन' : 'tonnes'}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                          {p.model_version}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/predict/result/${p.id}`}
                            className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> {isHindi ? 'देखें' : 'View'}
                          </Link>
                        </td>
                      </tr>
                    ))
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
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
