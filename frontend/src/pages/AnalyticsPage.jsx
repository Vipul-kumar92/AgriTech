import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  BarChart3,
  TrendingUp,
  CloudRain,
  Calendar,
  Layers,
  Sparkles,
  MapPin,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';

const CROP_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#0d9488', '#14b8a6', '#2dd4bf'];

const AnalyticsPage = () => {
  const { t, isHindi, translateCrop, translateSeason, translateState } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message={isHindi ? 'विस्तृत कृषि डेटा विश्लेषण तैयार किया जा रहा है...' : 'Calculating comprehensive agricultural analytics...'} />;
  }

  const rawCropData = stats?.crop_distribution?.slice(0, 10) || [];
  const cropData = rawCropData.map((d) => ({
    ...d,
    displayCrop: isHindi ? translateCrop(d.crop) : d.crop
  }));

  const rawSeasonalData = stats?.seasonal_distribution || [];
  const seasonalData = rawSeasonalData.map((d) => ({
    ...d,
    displaySeason: isHindi ? translateSeason(d.season) : d.season
  }));

  const rawStateData = stats?.state_productivity?.slice(0, 10) || [];
  const stateData = rawStateData.map((d) => ({
    ...d,
    displayState: isHindi ? translateState(d.state) : d.state
  }));

  const rainfallData = stats?.rainfall_trends || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{isHindi ? 'अनुभवजन्य कृषि डेटा विश्लेषण' : 'Empirical Agricultural Analytics'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isHindi ? 'कृषि अंतर्दृष्टि एवं ऐतिहासिक रुझान' : 'Agricultural Insights & Trends'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {isHindi
            ? 'भारतीय कृषि और मौसम विभाग के 24 वर्षों के प्रामाणिक अवलोकनों से प्राप्त विश्लेषण।'
            : 'Multivariate visualizations derived directly from 24 years of real Indian agricultural and IMD meteorological observations.'}
        </p>
      </div>

      {/* Grid of Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Average Yield by Top Crops */}
        <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isHindi ? 'फसल उत्पादकता मानक' : 'Crop Productivity Benchmarks'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi ? 'शीर्ष फसलों की औसत उपज (टन/हेक्टेयर)' : 'Mean yield (tonnes/ha) across top cultivated crops'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              {isHindi ? 'बायोमास उपज' : 'Biomass Yield'}
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayCrop" angle={-25} textAnchor="end" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} ${isHindi ? 'टन/हे.' : 'tonnes/ha'}`, isHindi ? 'औसत उपज' : 'Mean Yield']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="average_yield" radius={[6, 6, 0, 0]}>
                  {cropData.map((_, index) => (
                    <Cell key={`c1-${index}`} fill={CROP_COLORS[index % CROP_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 italic">
            {isHindi
              ? '* गन्ना, कसावा और कंद फसलों की बायोमास उपज नमी के कारण अधिक दर्ज होती है।'
              : '* Sugarcane, tapioca, and tuber crops yield higher gross tonnage per hectare due to moisture and carbohydrate retention.'}
          </p>
        </div>

        {/* Chart 2: Regional Productivity (Top States) */}
        <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isHindi ? 'क्षेत्रीय उत्पादकता में अग्रणी राज्य' : 'Regional Productivity Leaders'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi ? 'औसत कृषि उपज के अनुसार शीर्ष 10 राज्य' : 'Top 10 Indian states by mean agricultural yield'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              {isHindi ? 'भौगोलिक' : 'Geographic'}
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayState" angle={-25} textAnchor="end" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} ${isHindi ? 'टन/हे.' : 'tonnes/ha'}`, isHindi ? 'औसत उपज' : 'Average Yield']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="average_yield" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 italic">
            {isHindi
              ? '* विस्तृत सिंचाई व सघन बागवानी वाले राज्यों में समग्र औसत उपज उच्च पाई जाती है।'
              : '* States with extensive sugarcane, potato, and perennial horticulture produce higher average overall tonnage.'}
          </p>
        </div>

        {/* Chart 3: Seasonal Productivity Comparison */}
        <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isHindi ? 'कृषि-मौसम के अनुसार उपज अंतर' : 'Agro-Seasonal Variations'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi ? 'सभी 6 कृषि मौसमों में फसल उत्पादकता की तुलना' : 'Harvest output compared across all 6 cropping seasons'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              {isHindi ? 'मौसमी' : 'Temporal'}
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displaySeason" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} ${isHindi ? 'टन/हे.' : 'tonnes/ha'}`, isHindi ? 'औसत उपज' : 'Avg Yield']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="average_yield" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 italic">
            {isHindi
              ? '* संपूर्ण वर्ष (Whole Year) की फसलें जैसे गन्ना 10-12 महीनों में तैयार होती हैं, जिससे अधिक बायोमास प्राप्त होता है।'
              : '* Whole Year crops like sugarcane cultivate over 10-12 months, yielding substantial biomass.'}
          </p>
        </div>

        {/* Chart 4: Rainfall Brackets vs Yield */}
        <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isHindi ? 'वर्षा की मात्रा एवं उपज गतिशीलता' : 'Rainfall Precipitation Dynamics'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi ? 'वार्षिक वर्षा स्तरों (mm) के आधार पर उपज रुझान' : 'Yield trends segmented by annual rainfall brackets (mm)'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">
              {isHindi ? 'जलवायु' : 'Climate'}
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainfallData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="rainfall_bracket" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} ${isHindi ? 'टन/हे.' : 'tonnes/ha'}`, isHindi ? 'औसत उपज' : 'Avg Yield']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="average_yield" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 italic">
            {isHindi
              ? '* मध्यम से अधिक वर्षा (800-1500mm) मुख्य खाद्यान्नों के लिए आदर्श परिस्थितियां उत्पन्न करती है।'
              : '* Moderate-to-high precipitation (800–1500mm) delivers optimal conditions for primary food grain yields.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
