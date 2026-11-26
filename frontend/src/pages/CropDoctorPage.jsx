import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  Stethoscope,
  Leaf,
  CloudRain,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Upload,
  X,
  Printer,
  ShieldAlert,
  Sparkles,
  CalendarDays,
  FlaskConical
} from 'lucide-react';

const CATEGORY_META = {
  all: { en: 'All Symptoms', hi: 'सभी लक्षण', badge: 'bg-slate-100 text-slate-700' },
  nutrient: { en: 'Nutrient', hi: 'पोषक तत्व', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  fungal: { en: 'Fungal', hi: 'फफूंद रोग', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  pest: { en: 'Pest / Insect', hi: 'कीट / सुंडी', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  root_soil: { en: 'Root / Soil', hi: 'जड़ / मिट्टी', badge: 'bg-sky-100 text-sky-800 border-sky-200' },
};

const GROWTH_STAGES = [
  { id: 'seedling', en: 'Seedling', hi: 'अंकुर / पौध' },
  { id: 'vegetative', en: 'Vegetative', hi: 'वानस्पतिक वृद्धि' },
  { id: 'flowering', en: 'Flowering / Heading', hi: 'फूल / बाली अवस्था' },
  { id: 'fruiting_maturity', en: 'Pod / Grain Filling', hi: 'फली / दाना भराव' },
];

const SEVERITIES = [
  { id: 'mild', en: 'Mild (<15%)', hi: 'हल्का (<15%)' },
  { id: 'moderate', en: 'Moderate (15–40%)', hi: 'मध्यम (15–40%)' },
  { id: 'severe', en: 'Severe (>40%)', hi: 'गंभीर (>40%)' },
];

const CropDoctorPage = () => {
  const location = useLocation();
  const { isHindi, translateCrop, translateSeason, translateState } = useLanguage();

  const [categories, setCategories] = useState({ crops: ['Rice', 'Wheat', 'Maize'], states: ['Punjab', 'Uttar Pradesh'], seasons: ['Kharif', 'Rabi'] });
  const [symptomsCatalog, setSymptomsCatalog] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [formData, setFormData] = useState({
    crop: location.state?.crop || 'Rice',
    state: location.state?.state || 'Punjab',
    season: location.state?.season || 'Kharif',
    area_ha: location.state?.area || 2.0,
    growth_stage: 'vegetative',
    severity: 'moderate',
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState(['brown_leaf_spots']);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsNotice, setGpsNotice] = useState('');

  // Optional local leaf image preview for visual inspection
  const [leafPreviewUrl, setLeafPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const [diagnosing, setDiagnosing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const [statsRes, catRes] = await Promise.all([
          api.get('/dataset/stats'),
          api.get('/crop-doctor/catalog'),
        ]);
        setCategories({
          crops: statsRes.data.crops || [],
          states: statsRes.data.states || [],
          seasons: statsRes.data.seasons || [],
        });
        setSymptomsCatalog(catRes.data.symptoms || []);
      } catch (err) {
        console.error('Failed to initialize Crop Doctor:', err);
        setError(isHindi ? 'फसल डॉक्टर डेटा लोड नहीं हो सका।' : 'Failed to load Crop Doctor diagnostic catalog.');
      } finally {
        setLoadingInit(false);
      }
    };
    loadInit();
  }, []);

  const handleToggleSymptom = (symId) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symId)) {
        return prev.length > 1 ? prev.filter((id) => id !== symId) : prev;
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), symId];
      }
      return [...prev, symId];
    });
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsNotice(isHindi ? 'इस ब्राउज़र में GPS उपलब्ध नहीं है।' : 'GPS is not supported in this browser.');
      return;
    }
    setLocatingGps(true);
    setGpsNotice('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsCoords({ lat: latitude, lon: longitude });
        try {
          const res = await api.get('/weather/locate', { params: { lat: latitude, lon: longitude } });
          if (res.data?.state) {
            setFormData((prev) => ({ ...prev, state: res.data.state }));
            setGpsNotice(
              isHindi
                ? `GPS द्वारा नजदीकी राज्य "${translateState(res.data.state)}" चुना गया।`
                : `Detected nearest state "${res.data.state}" via GPS.`
            );
          }
        } catch (err) {
          console.warn('GPS state resolution failed:', err);
        } finally {
          setLocatingGps(false);
        }
      },
      () => {
        setGpsNotice(isHindi ? 'GPS अनुमति अस्वीकृत — कृपया राज्य चुनें।' : 'Location access denied — select state manually.');
        setLocatingGps(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const handleLeafPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLeafPreviewUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleDiagnose = async (e) => {
    e.preventDefault();
    setError('');
    if (selectedSymptoms.length === 0) {
      setError(isHindi ? 'कृपया कम से कम 1 लक्षण चुनें।' : 'Please select at least 1 observed symptom.');
      return;
    }
    setDiagnosing(true);
    try {
      const payload = {
        ...formData,
        area_ha: Math.max(0.1, Number(formData.area_ha) || 1),
        symptoms: selectedSymptoms,
        ...(gpsCoords ? { lat: gpsCoords.lat, lon: gpsCoords.lon } : {}),
      };
      const res = await api.post('/crop-doctor/diagnose', payload);
      setResult(res.data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch (err) {
      setError(err.response?.data?.detail || (isHindi ? 'निदान विफल रहा।' : 'Failed to run Crop Doctor diagnosis.'));
    } finally {
      setDiagnosing(false);
    }
  };

  if (loadingInit) {
    return <LoadingSpinner message={isHindi ? 'फसल डॉक्टर प्रारंभ हो रहा है...' : 'Initializing AI Crop Doctor & ICAR Triage Rules...'} />;
  }

  const visibleSymptoms =
    categoryFilter === 'all'
      ? symptomsCatalog
      : symptomsCatalog.filter((s) => s.category === categoryFilter);

  const spray = result?.spray_window;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 print:p-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{isHindi ? 'ICAR कीट, रोग व पोषण सलाहकार' : 'ICAR Pest, Disease & Deficiency Triage'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isHindi ? 'एआई फसल डॉक्टर (Crop Doctor)' : 'AI Crop Doctor & Spray Window Checker'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isHindi
              ? 'फसल और लक्षण चुनें — जैविक/रासायनिक सटीक मात्रा के साथ अगले 3 दिनों की बारिश के अनुसार छिड़काव का सही समय जानें।'
              : 'Select crop and observed leaf/stem symptoms to get organic + ICAR chemical doses scaled to your field, linked with a live 3-day spray window.'}
          </p>
        </div>

        {result && (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs self-start print:hidden"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{isHindi ? 'पर्ची प्रिंट / PDF करें' : 'Print / Save Prescription PDF'}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Diagnostic Input Form */}
      <form onSubmit={handleDiagnose} className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-sm p-5 sm:p-7 space-y-6 print:hidden">
        {/* Step 1: Field Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              {isHindi ? 'फसल चुनें' : 'Target Crop'}
            </label>
            <select
              value={formData.crop}
              onChange={(e) => setFormData((p) => ({ ...p, crop: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {categories.crops.map((c) => (
                <option key={c} value={c}>
                  {translateCrop(c)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {isHindi ? 'राज्य (मौसम हेतु)' : 'State (For Spray Window)'}
              </label>
              <button
                type="button"
                onClick={handleUseGps}
                disabled={locatingGps}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 inline-flex items-center space-x-1"
              >
                <Navigation className={`w-3 h-3 ${locatingGps ? 'animate-pulse' : ''}`} />
                <span>{locatingGps ? '...' : isHindi ? 'GPS लोकेशन' : 'Use GPS'}</span>
              </button>
            </div>
            <select
              value={formData.state}
              onChange={(e) => {
                setGpsCoords(null);
                setFormData((p) => ({ ...p, state: e.target.value }));
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {categories.states.map((s) => (
                <option key={s} value={s}>
                  {translateState(s)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              {isHindi ? 'बुवाई का मौसम' : 'Season'}
            </label>
            <select
              value={formData.season}
              onChange={(e) => setFormData((p) => ({ ...p, season: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {categories.seasons.map((sn) => (
                <option key={sn} value={sn}>
                  {translateSeason(sn)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              {isHindi ? 'प्रभावित क्षेत्र (हेक्टेयर)' : 'Affected Area (Hectares)'}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={formData.area_ha}
              onChange={(e) => setFormData((p) => ({ ...p, area_ha: parseFloat(e.target.value) || 0.5 }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {gpsNotice && (
          <div className="text-xs text-teal-800 bg-teal-50 border border-teal-200 px-3.5 py-2 rounded-xl font-medium">
            {gpsNotice}
          </div>
        )}

        {/* Step 2: Growth Stage, Severity & Optional Leaf Photo Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2 border-t border-slate-100">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {isHindi ? 'फसल की अवस्था' : 'Crop Growth Stage'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {GROWTH_STAGES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, growth_stage: st.id }))}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition-all ${
                    formData.growth_stage === st.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  {isHindi ? st.hi : st.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {isHindi ? 'संक्रमण / समस्या की गंभीरता' : 'Infestation Severity'}
            </span>
            <div className="grid grid-cols-1 gap-2">
              {SEVERITIES.map((sv) => (
                <button
                  key={sv.id}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, severity: sv.id }))}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition-all ${
                    formData.severity === sv.id
                      ? sv.id === 'severe'
                        ? 'bg-red-600 text-white border-red-600'
                        : sv.id === 'moderate'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isHindi ? sv.hi : sv.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {isHindi ? 'पत्ती/पौधे की फोटो (वैकल्पिक तुलना हेतु)' : 'Leaf / Crop Photo (Optional Reference)'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLeafPhotoChange}
              className="hidden"
            />
            {leafPreviewUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-emerald-200 h-28 bg-slate-100">
                <img src={leafPreviewUrl} alt="Leaf preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setLeafPreviewUrl('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
                  aria-label="Remove leaf photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 flex flex-col items-center justify-center text-xs font-semibold text-emerald-800 transition-colors px-3 text-center"
              >
                <Upload className="w-5 h-5 mb-1.5 text-emerald-600" />
                <span>{isHindi ? 'तुलना के लिए पत्ती की फोटो चुनें' : 'Attach Field Photo for Side-by-Side Check'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Step 3: Multi-Select Observed Symptoms */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {isHindi ? 'देखे गए लक्षण चुनें (1 से 3 तक)' : 'Select Observed Symptoms (Pick 1–3)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? 'पत्तियों, तने या जड़ों पर दिख रहे मुख्य लक्षणों पर क्लिक करें।'
                  : 'Click the visual symptoms matching your crop foliage, stems, pods, or roots.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategoryFilter(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                    categoryFilter === key
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isHindi ? meta.hi : meta.en}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleSymptoms.map((sym) => {
              const selected = selectedSymptoms.includes(sym.id);
              const catMeta = CATEGORY_META[sym.category] || CATEGORY_META.nutrient;
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => handleToggleSymptom(sym.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                    selected
                      ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.badge}`}>
                        {isHindi ? catMeta.hi : catMeta.en}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      {isHindi ? sym.label_hi : sym.label_en}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isHindi ? sym.cue_hi : sym.cue_en}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border ${
                      selected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnose Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={diagnosing}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 disabled:opacity-60 transition-all"
          >
            {diagnosing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Stethoscope className="w-5 h-5" />
            )}
            <span>
              {diagnosing
                ? isHindi ? 'निदान व मौसम जांच हो रही है...' : 'Diagnosing & Checking Spray Weather...'
                : isHindi ? 'फसल की जांच करें व 3-दिन का स्प्रे समय देखें' : 'Diagnose Crop & Check 3-Day Spray Window'}
            </span>
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* DIAGNOSIS REPORT & LIVE SPRAY WINDOW                                      */}
      {/* ========================================================================= */}
      {result && (
        <div ref={resultsRef} className="space-y-6">
          {/* Live 3-Day Spray Window Verification Card */}
          {spray && (
            <div
              className={`rounded-2xl p-5 sm:p-6 border-2 shadow-sm space-y-4 ${
                spray.verdict === 'DELAY'
                  ? 'bg-red-50/90 border-red-300'
                  : spray.verdict === 'CAUTION'
                    ? 'bg-amber-50/90 border-amber-300'
                    : 'bg-emerald-50/90 border-emerald-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {spray.verdict === 'OPTIMAL' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 ${spray.verdict === 'DELAY' ? 'text-red-600' : 'text-amber-600'}`} />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                      {isHindi ? `लाइव 3-दिवसीय स्प्रे विंडो (${translateState(spray.state)})` : `Live 3-Day Spray Window Check (${spray.state})`}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {isHindi ? spray.verdict_hi : spray.verdict_en}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    {isHindi ? spray.advice_hi : spray.advice_en}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-bold flex-shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200 text-slate-800 inline-flex items-center">
                    <CloudRain className="w-3.5 h-3.5 mr-1 text-sky-600" />
                    {isHindi ? '3 दिन वर्षा:' : '3d Rain:'} {spray.next_3_days_rain_mm} mm
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200 text-slate-800 inline-flex items-center">
                    <Wind className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    {spray.wind_speed_kmh} km/h
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-200/70 text-xs">
                <div className="font-semibold text-slate-700">
                  <span className="font-bold">{isHindi ? 'उपयुक्त समय:' : 'Best Spray Hours:'}</span>{' '}
                  {isHindi ? spray.best_time_of_day_hi : spray.best_time_of_day_en}
                </div>
                {spray.recommended_spray_days?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-bold text-slate-700">{isHindi ? 'साफ दिन:' : 'Dry Slots:'}</span>
                    {spray.recommended_spray_days.map((d) => (
                      <span key={d} className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 font-bold text-emerald-800 text-[11px]">
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Side-by-Side Leaf Photo Snapshot */}
          {leafPreviewUrl && (
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
              <img src={leafPreviewUrl} alt="Farmer crop photo" className="w-28 h-24 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
              <div className="text-xs text-slate-600 space-y-1">
                <div className="font-extrabold text-slate-900 text-sm">
                  {isHindi ? 'संलग्न खेत/पत्ती की फोटो तुलना' : 'Attached Field / Leaf Photo Reference'}
                </div>
                <p>
                  {isHindi
                    ? 'नीचे दिए गए ICAR निदान और लक्षणों का अपनी संलग्न फोटो से मिलान करके सही उपचार की पुष्टि करें।'
                    : 'Compare your attached field photo with the ICAR differential symptoms and dosage recommendations below.'}
                </p>
              </div>
            </div>
          )}

          {/* Diagnosis Cards */}
          {(result.diagnoses || []).map((diag) => (
            <div key={diag.symptom_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                      #{diag.rank} {isHindi ? 'संभावित कारण' : 'Probable Diagnosis'}
                    </span>
                    <span className="text-emerald-200">
                      {translateCrop(result.crop)} • {result.area_hectares} {isHindi ? 'हेक्टेयर' : 'ha'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">
                    {isHindi ? diag.condition_hi : diag.condition_en}
                  </h3>
                  <p className="text-xs text-emerald-100/85">
                    {isHindi ? diag.cause_hi : diag.cause_en}
                  </p>
                </div>

                <span className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-xs font-bold whitespace-nowrap self-start sm:self-center">
                  {diag.urgency}
                </span>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Organic / IPM Bio-Control */}
                <div className="rounded-xl bg-emerald-50/75 border border-emerald-200 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span>{isHindi ? 'जैविक / IPM नियंत्रण (पहली प्राथमिकता)' : 'Organic / IPM Control (First-Line)'}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200 text-[11px] font-extrabold">
                      {diag.organic_control.total_quantity} {diag.organic_control.unit}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {isHindi ? diag.organic_control.instructions_hi : diag.organic_control.instructions_en}
                  </p>
                  <div className="text-[11px] text-emerald-800 font-semibold pt-1 border-t border-emerald-200/70">
                    {isHindi ? 'कुल आवश्यक मात्रा' : 'Estimated Total for'} ({result.area_hectares} ha):{' '}
                    <strong>{diag.organic_control.total_quantity} {diag.organic_control.unit}</strong> ({diag.organic_control.product})
                  </div>
                </div>

                {/* ICAR Chemical / Nutrient Control */}
                <div className="rounded-xl bg-sky-50/75 border border-sky-200 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-sky-900">
                      <FlaskConical className="w-4 h-4 text-sky-600" />
                      <span>{isHindi ? 'ICAR अनुशंसित रासायनिक / पोषक मात्रा' : 'ICAR Recommended Control Dose'}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-sky-900 border border-sky-200 text-[11px] font-extrabold">
                      {diag.chemical_control.total_quantity} {diag.chemical_control.unit}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {isHindi ? diag.chemical_control.instructions_hi : diag.chemical_control.instructions_en}
                  </p>
                  <div className="text-[11px] text-sky-900 font-semibold pt-1 border-t border-sky-200/70">
                    {isHindi ? 'कुल घोल:' : 'Total Solution:'}{' '}
                    <strong>{diag.chemical_control.total_quantity} {diag.chemical_control.unit}</strong> {diag.chemical_control.product} +{' '}
                    <strong>{diag.chemical_control.water_volume_liters} L</strong> {isHindi ? 'पानी' : 'water'}
                  </div>
                </div>
              </div>

              {/* Preventive Step */}
              <div className="px-5 sm:px-6 pb-5">
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">{isHindi ? 'भविष्य में बचाव (Prevention): ' : 'Preventive Field Practice: '}</strong>
                    <span>{isHindi ? diag.prevention_hi : diag.prevention_en}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Safety Precaution Banner */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{isHindi ? result.safety_note_hi : result.safety_note_en}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropDoctorPage;
