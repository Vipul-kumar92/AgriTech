import React, { useState } from 'react';
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
  Sparkles,
  Menu,
  X,
  Info
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-gradient-to-r from-emerald-100/90 via-emerald-50/95 to-teal-100/90 backdrop-blur-xl border-b border-emerald-200/80 shadow-sm shadow-emerald-950/5">
      {/* Top micro decorative glowing line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ===================================================================== */}
        {/* LOGO & BRAND                                                          */}
        {/* ===================================================================== */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 lg:hidden focus:outline-none transition-colors border border-transparent hover:border-emerald-200"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/40 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-400 border-2 border-white rounded-full"></span>
            </div>

            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight leading-none text-slate-900 group-hover:text-emerald-700 transition-colors">
                Agri<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Yield</span>
                <span className="text-amber-500 font-extrabold">.AI</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 hidden sm:block mt-0.5">
                Precision Agriculture
              </span>
            </div>
          </Link>
        </div>

        {/* ===================================================================== */}
        {/* CENTER NAVIGATION PILLS (DESKTOP)                                    */}
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
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Circular Bilingual Language Switcher */}
          <LanguageCircleToggle size="normal" />

          {isAuthenticated ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              <Link
                to="/predict"
                className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-105 active:scale-95 transition-all"
              >
                <Sprout className="w-4 h-4 mr-1.5" />
                {t('predict_yield', 'Predict Yield')}
              </Link>

              <div className="flex items-center space-x-1 sm:space-x-2 pl-1.5 sm:pl-2 border-l border-emerald-200">
                <Link
                  to="/profile"
                  className="flex items-center space-x-1.5 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl hover:bg-emerald-50/80 border border-transparent hover:border-emerald-200/80 transition-all text-slate-700"
                  title="View Profile"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm ring-2 ring-emerald-300">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline-block text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
                  title={t('sign_out', 'Sign Out')}
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <Link
                to="/login"
                className="inline-flex items-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-800 hover:text-emerald-900 bg-white/80 hover:bg-white border border-emerald-200/90 rounded-xl transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span className="hidden xs:inline sm:inline">{t('sign_in', 'Sign In')}</span>
                <span className="xs:hidden sm:hidden text-[11px] font-bold">Login</span>
              </Link>
              <Link
                to="/register"
                className="hidden xs:inline-flex sm:inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/25 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                <span>{t('register', 'Register')}</span>
              </Link>

              {/* Mobile hamburger menu toggle for guests */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-1.5 rounded-xl text-slate-700 hover:bg-emerald-100/80 transition-colors"
                aria-label="Open mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MOBILE DROPDOWN DRAWER FOR GUESTS                                    */}
      {/* ===================================================================== */}
      {!isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-emerald-200 shadow-xl px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>{t('home', 'Home')}</span>
            </Link>

            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
            >
              <Map className="w-4 h-4 text-teal-600" />
              <span>{t('yield_map', 'Yield Map')}</span>
            </Link>

            <Link
              to="/simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>{t('what_if_lab', 'What-If Lab')}</span>
            </Link>

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
            >
              <Info className="w-4 h-4 text-blue-600" />
              <span>{isHindi ? 'परियोजना के बारे में' : 'About System'}</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 text-center text-xs font-bold text-slate-800 bg-slate-100 rounded-xl"
            >
              {t('sign_in', 'Sign In')}
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 text-center text-xs font-bold text-white bg-emerald-600 rounded-xl shadow"
            >
              {t('register', 'Register')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
