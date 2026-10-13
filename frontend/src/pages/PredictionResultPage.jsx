import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  Sprout,
  CheckCircle,
  Calendar,
  Layers,
  Award,
  TrendingUp,
  MapPin,
  Clock,
  Star,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Send,
  Volume2,
  VolumeX,
  Printer,
  IndianRupee,
  BadgePercent,
  Receipt,
  FileCheck2,
  Sparkles,
  Share2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const PredictionResultPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { t, isHindi, translateCrop, translateSeason, translateState } = useLanguage();
  const [prediction, setPrediction] = useState(location.state?.prediction || null);
  const [loading, setLoading] = useState(!prediction);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Economic MSP state
  const [economics, setEconomics] = useState(null);
  const [loadingEconomics, setLoadingEconomics] = useState(false);

  // Voice advisory state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechLang, setActiveSpeechLang] = useState(null);

  useEffect(() => {
    if (!prediction && id) {
      const fetchPrediction = async () => {
        try {
          const res = await api.get(`/predictions/${id}`);
          setPrediction(res.data);
        } catch (err) {
          console.error('Failed to load prediction details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchPrediction();
    }
  }, [id, prediction]);

  // Once prediction is loaded, fetch government MSP economic returns
  useEffect(() => {
    if (prediction) {
      const fetchMSP = async () => {
        setLoadingEconomics(true);
        try {
          const inputs = prediction.input_summary || prediction.input_features || {};
          const crop = inputs.crop || 'Rice';
          const yieldVal = prediction.predicted_yield || 3.5;
          const area = inputs.area_hectares || inputs.area || 1.0;
          const fertilizer = inputs.fertilizer_kg || inputs.fertilizer || 100.0;
          const pesticide = inputs.pesticide_kg || inputs.pesticide || 5.0;

          const res = await api.get('/economics/msp', {
            params: {
              crop,
              predicted_yield: yieldVal,
              area,
              fertilizer_kg: fertilizer,
              pesticide_kg: pesticide
            }
          });
          setEconomics(res.data);
        } catch (err) {
          console.warn('Economics API failed:', err);
        } finally {
          setLoadingEconomics(false);
        }
      };
      fetchMSP();
    }
  }, [prediction]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleVoiceAdvisory = (lang = 'en') => {
    if (!('speechSynthesis' in window)) {
      alert(isHindi ? 'इस ब्राउज़र में टेक्स्ट-टू-स्पीच समर्थित नहीं है।' : 'Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking && activeSpeechLang === lang) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechLang(null);
      return;
    }

    window.speechSynthesis.cancel();

    const inputs = prediction.input_summary || prediction.input_features || {};
    let speechText = '';

    if (lang === 'hi') {
      speechText = `कृषि उपज परामर्श। राज्य ${inputs.state} के लिए फसल ${inputs.crop} की अनुमानित उपज ${prediction.predicted_yield} टन प्रति हेक्टेयर है। ${inputs.area_hectares || inputs.area} हेक्टेयर खेत में कुल अनुमानित उत्पादन ${prediction.predicted_total_production} मीट्रिक टन होगा। ${
        economics
          ? `सरकारी न्यूनतम समर्थन मूल्य ${economics.msp_per_quintal_inr} रुपये प्रति क्विंटल के आधार पर अनुमानित सकल आमदनी ${economics.gross_revenue_lakhs} लाख रुपये, तथा शुद्ध लाभ लगभग ${Math.round(
              economics.net_farm_return_inr
            ).toLocaleString('hi-IN')} रुपये आंका गया है।`
          : ''
      } वैज्ञानिक कृषि सलाह: संतुलित उर्वरक प्रयोग करें। धन्यवाद।`;
    } else {
      speechText = `Agricultural Advisory Briefing. For ${inputs.crop} cultivation in ${inputs.state}, the trained machine learning pipeline predicts an empirical yield of ${prediction.predicted_yield} tonnes per hectare. Over ${inputs.area_hectares || inputs.area} hectares, the estimated total harvest is ${prediction.predicted_total_production} metric tonnes. ${
        economics
          ? `At the Government MSP benchmark of rupees ${economics.msp_per_quintal_inr} per quintal, gross revenue is estimated at rupees ${economics.gross_revenue_lakhs} lakhs, with an estimated net return of rupees ${Math.round(
              economics.net_farm_return_inr
            ).toLocaleString('en-IN')}.`
          : ''
      } Recommended action: optimize chemical application according to soil testing.`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveSpeechLang(lang);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechLang(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechLang(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.post('/feedback', {
        prediction_id: id || prediction.prediction_id,
        rating: Number(rating),
        comment
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={isHindi ? 'पूर्वानुमान परिणाम लोड हो रहा है...' : 'Retrieving prediction forecast...'} />;
  }

  if (!prediction) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{isHindi ? 'पूर्वानुमान रिकॉर्ड नहीं मिला।' : 'Prediction record not found.'}</p>
        <Link to="/predict" className="mt-4 inline-block text-emerald-600 font-bold hover:underline">
          {isHindi ? 'नया पूर्वानुमान लगाएं' : 'Run a new prediction'}
        </Link>
      </div>
    );
  }

  const inputs = prediction.input_summary || prediction.input_features || {};
  const influenceData = prediction.feature_influence
    ? Object.entries(prediction.feature_influence).map(([key, val]) => ({
        feature: key.replace(/_/g, ' '),
        influence: val
      }))
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Action Bar: Voice advisory and Print */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-emerald-100 shadow-sm print:hidden">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isHindi ? 'स्मार्ट ऑडियो सलाह:' : 'Smart Audio Advisory:'}
          </span>
          <button
            onClick={() => handleVoiceAdvisory('en')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isSpeaking && activeSpeechLang === 'en'
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
            }`}
          >
            {isSpeaking && activeSpeechLang === 'en' ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>{isSpeaking && activeSpeechLang === 'en' ? 'Stop Audio' : 'Listen in English'}</span>
          </button>
          <button
            onClick={() => handleVoiceAdvisory('hi')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isSpeaking && activeSpeechLang === 'hi'
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
            }`}
          >
            {isSpeaking && activeSpeechLang === 'hi' ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>{isSpeaking && activeSpeechLang === 'hi' ? 'रोकें (Stop)' : 'हिंदी में सुनें (Hindi)'}</span>
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>{isHindi ? 'सलाह रिपोर्ट प्रिंट करें' : 'Print Official Advisory Certificate'}</span>
        </button>
      </div>

      {/* Official Certificate Header (Visible in Print Only) */}
      <div className="hidden print:block text-center border-b-2 border-emerald-800 pb-6 mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">AGRIYIELD.AI — NATIONAL CROP ADVISORY CERTIFICATE</h1>
        <p className="text-xs text-slate-600 mt-1">Empirical Machine Learning Agro-Ecological Yield & Economic Assessment</p>
        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-4 border-t border-slate-200 pt-2">
          <span>Certificate Ref ID: #{prediction.prediction_id}</span>
          <span>Target Region: {inputs.state} | Crop: {inputs.crop}</span>
          <span>Date Issued: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
        </div>
      </div>

      {/* High-Visibility Yield Result Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden print:bg-none print:text-slate-900 print:border print:border-emerald-700 print:p-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none print:hidden" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-emerald-600/60 print:border-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping print:hidden" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 print:text-emerald-800">
                {isHindi ? 'सत्यापित एमएल पूर्वानुमान' : 'Validated ML Forecast'}
              </span>
            </div>
            <span className="text-xs text-emerald-200 print:text-slate-600">
              {isHindi ? 'मॉडल:' : 'Model:'} <span className="font-semibold text-white print:text-slate-900">{prediction.model_name || 'Random Forest Regressor'}</span> ({prediction.model_version || 'v1.0'})
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-emerald-200 print:text-slate-600 text-sm font-semibold uppercase tracking-wider">
                {isHindi ? 'अनुमानित फसल उपज' : 'Predicted Crop Yield'}
              </p>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white print:text-emerald-800">
                  {prediction.predicted_yield}
                </span>
                <span className="text-lg sm:text-xl font-bold text-emerald-200 print:text-slate-600">
                  {isHindi ? 'टन / हेक्टेयर' : prediction.unit || 'tonnes/hectare'}
                </span>
              </div>
              <p className="text-xs text-emerald-300 print:text-slate-500 mt-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-emerald-400 print:text-emerald-700" />
                {isHindi ? 'प्रामाणिक मीट्रिक टन प्रति हेक्टेयर में सत्यापित' : 'Unit rigorously verified in metric tonnes per hectare'}
              </p>
            </div>

            {/* Total Estimated Production */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 print:bg-slate-50 print:border-slate-200">
              <div>
                <p className="text-xs font-semibold text-emerald-200 print:text-slate-600 uppercase tracking-wider">
                  {isHindi ? 'कुल अनुमानित उत्पादन' : 'Estimated Total Harvest Production'}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-900 mt-1">
                  {prediction.predicted_total_production}{' '}
                  <span className="text-sm font-normal text-emerald-200 print:text-slate-600">
                    {isHindi ? 'मीट्रिक टन' : 'Metric Tonnes'}
                  </span>
                </p>
                <p className="text-[11px] text-emerald-300 print:text-slate-500">
                  {isHindi
                    ? `गणना: ${prediction.predicted_yield} टन/हे. × ${inputs.area_hectares || inputs.area} हेक्टेयर`
                    : `Calculated as: ${prediction.predicted_yield} t/ha × ${inputs.area_hectares || inputs.area} hectares`}
                </p>
              </div>

              {prediction.prediction_interval && (
                <div className="pt-2 border-t border-white/10 print:border-slate-200">
                  <p className="text-xs text-emerald-200 print:text-slate-600 font-medium">
                    {isHindi ? '80% अनुभवजन्य विश्वास अंतराल:' : 'Estimated 80% Empirical Interval:'}
                  </p>
                  <p className="text-sm font-bold text-white print:text-emerald-800">
                    {prediction.prediction_interval.lower} – {prediction.prediction_interval.upper} {isHindi ? 'टन/हे.' : 'tonnes/ha'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next-Level Module: Government MSP Economic Revenue & Return Calculator */}
      {economics && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                {isHindi ? 'सरकारी एमएसपी (MSP) आय एवं आर्थिक लाभ विश्लेषण' : 'Government MSP Farm Revenue & Economic Return Analysis'}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {economics.pricing_source}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                {isHindi ? 'सरकारी एमएसपी दर' : 'Official MSP Rate'}
              </span>
              <p className="text-xl font-extrabold text-emerald-950 mt-1">
                ₹{economics.msp_per_quintal_inr.toLocaleString('en-IN')}
                <span className="text-xs font-medium text-emerald-700"> {isHindi ? '/ क्विंटल' : '/ quintal'}</span>
              </p>
              <span className="text-[10px] text-emerald-600 mt-1 block">1 क्विंटल = 100 kg</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                {isHindi ? 'अनुमानित सकल आमदनी' : 'Estimated Gross Revenue'}
              </span>
              <p className="text-xl font-extrabold text-blue-950 mt-1">
                ₹{economics.gross_revenue_lakhs} <span className="text-xs font-medium text-blue-700">{isHindi ? 'लाख' : 'Lakhs'}</span>
              </p>
              <span className="text-[10px] text-blue-600 mt-1 block">
                ₹{Math.round(economics.gross_revenue_inr).toLocaleString('en-IN')} {isHindi ? 'कुल' : 'Total'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                {isHindi ? 'रासायनिक इनपुट लागत' : 'Input Chemical Costs'}
              </span>
              <p className="text-xl font-extrabold text-amber-950 mt-1">
                ₹{Math.round(economics.total_chemical_cost_inr).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-amber-600 mt-1 block">{isHindi ? 'खाद एवं कीटनाशक' : 'Fertilizers & Pesticides'}</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
                {isHindi ? 'अनुमानित शुद्ध किसान लाभ' : 'Estimated Net Farm Surplus'}
              </span>
              <p className="text-xl font-extrabold text-white mt-1">
                ₹{Math.round(economics.net_farm_return_inr).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-200 mt-1 block font-bold">
                {isHindi ? 'मार्जिन: ' : 'Margin: '}{economics.profit_margin_pct}%
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            {isHindi
              ? '* आर्थिक गणना भारत सरकार के न्यूनतम समर्थन मूल्य (MSP) और मानक उर्वरक/कीटनाशक लागत सूचकांकों पर आधारित है।'
              : '* Economic calculation based on Government of India Minimum Support Prices (MSP) and CACP standard fertilizer/pesticide cost indices.'}
          </p>
        </div>
      )}

      {/* Input Parameters Summary */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          {isHindi ? 'दर्ज कृषि पैरामीटर्स का विवरण' : 'Input Farm Parameters Summary'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{isHindi ? 'फसल' : 'Crop'}</span>
            <span className="font-extrabold text-slate-900 text-base">{isHindi ? translateCrop(inputs.crop) : inputs.crop}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{isHindi ? 'राज्य / क्षेत्र' : 'State / Region'}</span>
            <span className="font-extrabold text-slate-900 text-base">{isHindi ? translateState(inputs.state) : inputs.state}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{isHindi ? 'बुवाई का मौसम' : 'Cropping Season'}</span>
            <span className="font-extrabold text-slate-900 text-base">{isHindi ? translateSeason(inputs.season) : inputs.season}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{isHindi ? 'क्षेत्रफल' : 'Cultivated Area'}</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.area_hectares || inputs.area} {isHindi ? 'हेक्टेयर' : 'ha'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{isHindi ? 'वार्षिक वर्षा' : 'Annual Rainfall'}</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.annual_rainfall_mm || inputs.annual_rainfall} mm</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{isHindi ? 'कुल खाद' : 'Total Fertilizer'}</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.fertilizer_kg || inputs.fertilizer} kg</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{isHindi ? 'कुल कीटनाशक' : 'Total Pesticide'}</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.pesticide_kg || inputs.pesticide} kg</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{isHindi ? 'फसल वर्ष' : 'Crop Year'}</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.crop_year || 2024}</span>
          </div>
        </div>
      </div>

      {/* Model Feature Influence Chart */}
      {influenceData.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-4 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isHindi ? 'मॉडल निर्णय कारक प्रभाव (Feature Influence)' : 'Model Feature Influence'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi
                ? 'ट्रेन्ड मॉडल में विभिन्न कृषि विशेषताओं के सापेक्ष भार को दर्शाने वाला महत्व प्रतिशत।'
                : 'Aggregated Gini importance indicating the relative weight of agricultural attributes in the trained model.'}
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={influenceData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, isHindi ? 'सापेक्ष प्रभाव' : 'Relative Influence']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="influence" fill="#059669" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            {isHindi
              ? '* नोट: यह चार्ट रैंडम फॉरेस्ट मॉडल के सांख्यिकीय निर्भरता भार को दर्शाता है।'
              : '* Note: Feature importance illustrates statistical dependency within the Random Forest estimator.'}
          </p>
        </div>
      )}

      {/* Farmer Feedback Submission */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-4 print:hidden">
        <h3 className="text-lg font-bold text-slate-900">
          {isHindi ? 'किसान एवं क्षेत्रीय मूल्यांकन प्रतिक्रिया' : 'Farmer & Field Evaluation Feedback'}
        </h3>
        <p className="text-xs text-slate-500">
          {isHindi
            ? 'क्या यह पूर्वानुमान आपके क्षेत्र की सामान्य उपज से मेल खाता है?'
            : 'How closely does this prediction reflect typical yields in your region?'}
        </p>

        {feedbackSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" />
            {isHindi
              ? 'धन्यवाद! आपकी बहुमूल्य प्रतिक्रिया मॉडल सुधार हेतु सुरक्षित कर ली गई है।'
              : 'Thank you! Your feedback has been logged to the database for continuous evaluation.'}
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                {isHindi ? 'संतुष्टि रेटिंग (1 से 5 सितारे)' : 'Satisfaction Rating (1 to 5 Stars)'}
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 ml-2">{rating} / 5 {isHindi ? 'सितारे' : 'Stars'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {isHindi ? 'आपकी टिप्पणी (वैकल्पिक)' : 'Qualitative Feedback (Optional)'}
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isHindi ? 'क्षेत्रीय उपज सटीकता या सिंचाई की स्थिति पर अपनी राय साझा करें...' : 'Share thoughts on regional accuracy, irrigation nuance, or soil conditions...'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submittingFeedback}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl transition-all flex items-center disabled:opacity-50 shadow-sm"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {submittingFeedback ? (isHindi ? 'दर्ज हो रहा है...' : 'Submitting...') : (isHindi ? 'प्रतिक्रिया भेजें' : 'Submit Feedback')}
            </button>
          </form>
        )}
      </div>

      {/* Navigation & Next-level simulator launcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 print:hidden">
        <Link
          to="/predict"
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors text-center"
        >
          {isHindi ? '← दूसरा नया पूर्वानुमान लगाएं' : '← Run Another Prediction'}
        </Link>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Link
            to="/simulator"
            className="flex-1 sm:flex-initial px-5 py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-sm rounded-xl border border-teal-200 transition-colors text-center flex items-center justify-center space-x-1"
          >
            <Sparkles className="w-4 h-4 mr-1 text-teal-600" />
            <span>{isHindi ? 'व्हाट-इफ़ सिम्युलेटर' : 'Simulate Climate Shocks'}</span>
          </Link>
          <Link
            to="/history"
            className="flex-1 sm:flex-initial px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-colors text-center"
          >
            {isHindi ? 'इतिहास देखें →' : 'View History →'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PredictionResultPage;
