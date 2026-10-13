import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, ExternalLink, ShieldCheck, Cpu, Database, MapPin, Sparkles } from 'lucide-react';

const Footer = () => {
  const { t, isHindi } = useLanguage();

  return (
    <footer className="relative mt-auto w-full bg-gradient-to-r from-emerald-100/90 via-emerald-50/95 to-teal-100/90 backdrop-blur-xl border-t border-emerald-200/80 shadow-sm shadow-emerald-950/5">
      {/* Top micro decorative glowing line - exact match to Header */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">
        {/* Main Grid: Brand + Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-3 text-left">
            <Link to="/" className="inline-flex items-center space-x-3 group flex-shrink-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/40 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black tracking-tight leading-none text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Agri<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Yield</span>
                  <span className="text-amber-500 font-extrabold">.AI</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/90 mt-0.5">
                  {isHindi ? 'सटीक स्मार्ट कृषि बुद्धिमत्ता' : 'Precision Agricultural Intelligence'}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-lg">
              {t(
                'footer_brand_desc',
                'Empirical agricultural machine learning platform empowering Indian farmers with authentic data-backed yield intelligence.'
              )}
            </p>

            <div className="flex items-center space-x-3 text-[11px] font-semibold text-emerald-800 pt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100/80 border border-emerald-200">
                <Cpu className="w-3 h-3 mr-1 text-emerald-600" />
                Random Forest Regressor v1.0
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100/80 border border-emerald-200">
                <Database className="w-3 h-3 mr-1 text-teal-600" />
                19,407 Records (1997-2020)
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-2 text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {isHindi ? 'त्वरित लिंक' : 'Core Features'}
            </h4>
            <ul className="space-y-1.5 text-xs font-semibold text-slate-600">
              <li>
                <Link to="/predict" className="hover:text-emerald-700 transition-colors flex items-center">
                  <span className="text-emerald-500 mr-1.5">›</span>
                  {t('predict_yield', 'Predict Yield')}
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-emerald-700 transition-colors flex items-center">
                  <span className="text-emerald-500 mr-1.5">›</span>
                  {t('yield_map', 'Yield Map')}
                </Link>
              </li>
              <li>
                <Link to="/simulator" className="hover:text-emerald-700 transition-colors flex items-center">
                  <span className="text-emerald-500 mr-1.5">›</span>
                  {t('what_if_lab', 'What-If Lab')}
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-emerald-700 transition-colors flex items-center">
                  <span className="text-emerald-500 mr-1.5">›</span>
                  {isHindi ? 'पूर्वानुमान इतिहास' : 'Prediction History'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Analytics & Research Column */}
          <div className="md:col-span-3 space-y-2 text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {isHindi ? 'अनुसंधान व डेटा' : 'Research & Analytics'}
            </h4>
            <ul className="space-y-1.5 text-xs font-semibold text-slate-600">
              <li>
                <Link to="/analytics" className="hover:text-emerald-700 transition-colors flex items-center">
                  <span className="text-emerald-500 mr-1.5">›</span>
                  {isHindi ? 'एनालिटिक्स डैशबोर्ड' : 'Analytics Dashboard'}
                </Link>
              </li>
              <li>
                <Link to="/model-performance" className="hover:text-emerald-700 transition-colors flex items-center">
                  <span className="text-emerald-500 mr-1.5">›</span>
                  {isHindi ? 'मॉडल तुलना और प्रदर्शन' : 'Model Benchmarks'}
                </Link>
              </li>
              <li>
                <Link to="/feature-importance" className="hover:text-emerald-700 transition-colors flex items-center">
                  <span className="text-emerald-500 mr-1.5">›</span>
                  {isHindi ? 'विशेषता महत्व' : 'Feature Importance'}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-700 transition-colors flex items-center">
                  <span className="text-emerald-500 mr-1.5">›</span>
                  {isHindi ? 'परियोजना के बारे में' : 'About Platform'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Badge */}
        <div className="border-t border-emerald-200/80 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
          <p className="font-semibold text-slate-700">
            {t('footer_bottom_rights', '© 2026 AgriYield.AI. All Rights Reserved.')}
          </p>

          <p className="flex items-center text-emerald-800 font-bold">
            {t('footer_bottom_credit', 'Crafted with 🌾 for Indian Farmers & Sustainable Agriculture')}
          </p>

          <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-800">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200/90">
              {isHindi ? 'संवहनीय कृषि' : 'Sustainable Agriculture'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200/90">
              {isHindi ? 'सटीक एआई' : 'Precision ML'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
