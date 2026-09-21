import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
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
  Send
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const PredictionResultPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [prediction, setPrediction] = useState(location.state?.prediction || null);
  const [loading, setLoading] = useState(!prediction);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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
    return <LoadingSpinner message="Retrieving prediction forecast..." />;
  }

  if (!prediction) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Prediction record not found.</p>
        <Link to="/predict" className="mt-4 inline-block text-emerald-600 font-bold hover:underline">
          Run a new prediction
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
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* High-Visibility Yield Result Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-emerald-600/60">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Validated ML Forecast
              </span>
            </div>
            <span className="text-xs text-emerald-200">
              Model: <span className="font-semibold text-white">{prediction.model_name || 'Random Forest Regressor'}</span> ({prediction.model_version || 'v1.0'})
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wider">
                Predicted Crop Yield
              </p>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {prediction.predicted_yield}
                </span>
                <span className="text-lg sm:text-xl font-bold text-emerald-200">
                  {prediction.unit || 'tonnes/hectare'}
                </span>
              </div>
              <p className="text-xs text-emerald-300 mt-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-emerald-400" />
                Unit consistently maintained in metric tonnes per hectare
              </p>
            </div>

            {/* Total Estimated Production */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
              <div>
                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Estimated Total Harvest Production
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {prediction.predicted_total_production}{' '}
                  <span className="text-sm font-normal text-emerald-200">Metric Tonnes</span>
                </p>
                <p className="text-[11px] text-emerald-300">
                  Calculated as: {prediction.predicted_yield} t/ha × {inputs.area_hectares || inputs.area} hectares
                </p>
              </div>

              {prediction.prediction_interval && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-emerald-200 font-medium">
                    Estimated 80% Empirical Interval:
                  </p>
                  <p className="text-sm font-bold text-white">
                    {prediction.prediction_interval.lower} – {prediction.prediction_interval.upper} tonnes/ha
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Input Parameters Summary */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Input Farm Parameters Summary
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Crop</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.crop}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">State / Region</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.state}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cropping Season</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.season}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cultivated Area</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.area_hectares || inputs.area} ha</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Annual Rainfall</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.annual_rainfall_mm || inputs.annual_rainfall} mm</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Fertilizer</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.fertilizer_kg || inputs.fertilizer} kg</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Pesticide</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.pesticide_kg || inputs.pesticide} kg</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Crop Year</span>
            <span className="font-extrabold text-slate-900 text-base">{inputs.crop_year || 2024}</span>
          </div>
        </div>
      </div>

      {/* Model Feature Influence Chart */}
      {influenceData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Model Feature Influence</h3>
            <p className="text-xs text-slate-500">
              Aggregated Gini importance indicating the relative weight of agricultural attributes in the trained model.
            </p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={influenceData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Relative Influence']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="influence" fill="#059669" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            * Note: Feature importance illustrates statistical dependency within the Random Forest estimator and does not prove biological causality.
          </p>
        </div>
      )}

      {/* Farmer Feedback Submission */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Farmer & Field Evaluation Feedback</h3>
        <p className="text-xs text-slate-500">
          How closely does this prediction reflect typical yields in your region?
        </p>

        {feedbackSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" />
            Thank you! Your feedback has been logged to the database for continuous evaluation.
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Satisfaction Rating (1 to 5 Stars)
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
                <span className="text-xs font-bold text-slate-600 ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Qualitative Feedback (Optional)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share thoughts on regional accuracy, irrigation nuance, or soil conditions..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submittingFeedback}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link
          to="/predict"
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors text-center"
        >
          ← Run Another Prediction
        </Link>
        <Link
          to="/history"
          className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-colors text-center"
        >
          View Full Prediction History →
        </Link>
      </div>
    </div>
  );
};

export default PredictionResultPage;
