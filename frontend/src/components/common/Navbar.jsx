import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageCircleToggle from './LanguageCircleToggle';
import {
  Sprout,
  LogIn,
  UserPlus,
  LogOut,
  User,
  LayoutDashboard,
  Shield,
  Map,
  SlidersHorizontal,
  Home,
  Sparkles
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-gradient-to-r from-emerald-100/90 via-emerald-50/95 to-teal-100/90 backdrop-blur-xl border-b border-emerald-200/80 shadow-sm shadow-emerald-950/5">
      {/* Top micro decorative glowing line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ===================================================================== */}
        {/* LOGO & BRAND                                                          */}
        {/* ===================================================================== */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 lg:hidden focus:outline-none transition-colors border border-transparent hover:border-emerald-200"
              aria-label="Toggle navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/40 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              {/* Micro glowing dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border-2 border-white rounded-full"></span>
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight leading-none text-slate-900 group-hover:text-emerald-700 transition-colors">
                Agri<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Yield</span>
                <span className="text-amber-500 font-extrabold">.AI</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 hidden sm:block mt-0.5">
                Precision Agriculture
              </span>
            </div>
          </Link>
        </div>

        {/* ===================================================================== */}
        {/* CENTER NAVIGATION PILLS (PUBLIC / LANDING)                           */}
        {/* ===================================================================== */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-1.5 p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-emerald-200/80 shadow-xs">
            <Link
              to="/"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/'
                  ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80'
              }`}
            >
              <Home className={`w-3.5 h-3.5 ${location.pathname === '/' ? 'text-white' : 'text-emerald-600'}`} />
              <span>{t('home', 'Home')}</span>
            </Link>

            <Link
              to="/map"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/map'
                  ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80'
              }`}
            >
              <Map className={`w-3.5 h-3.5 ${location.pathname === '/map' ? 'text-white' : 'text-teal-600'}`} />
              <span>{t('yield_map', 'Yield Map')}</span>
            </Link>

            <Link
              to="/simulator"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/simulator'
                  ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80'
              }`}
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${location.pathname === '/simulator' ? 'text-white' : 'text-amber-600'}`} />
              <span>{t('what_if_lab', 'What-If Lab')}</span>
            </Link>
          </nav>
        )}

        {/* ===================================================================== */}
        {/* RIGHT SIDE ACTIONS                                                    */}
        {/* ===================================================================== */}
        <div className="flex items-center space-x-2.5">
          {/* Circular Bilingual Language Switcher */}
          <LanguageCircleToggle size="normal" />

          {isAuthenticated ? (
            <div className="flex items-center space-x-2.5">
              <Link
                to="/predict"
                className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-105 active:scale-95 transition-all"
              >
                <Sprout className="w-4 h-4 mr-1.5" />
                {t('predict_yield', 'Predict Yield')}
              </Link>

              <div className="flex items-center space-x-2 pl-2 border-l border-emerald-100">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-200/80 transition-all text-slate-700"
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm ring-2 ring-emerald-300">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline-block text-xs font-bold text-slate-800 max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <span className="hidden md:inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-emerald-100/90 text-emerald-800 rounded-lg border border-emerald-300/80 shadow-xs">
                    🌾 {isHindi ? 'किसान' : 'Farmer'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
                  title={t('sign_out', 'Sign Out')}
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-800 hover:text-emerald-900 bg-white/80 hover:bg-white border border-emerald-200/90 rounded-xl transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                {t('sign_in', 'Sign In')}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-105 active:scale-95 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                {t('register', 'Register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
