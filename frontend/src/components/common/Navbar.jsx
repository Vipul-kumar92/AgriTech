import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, LogIn, UserPlus, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                AgriYield<span className="text-amber-500">.AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                B.Tech Capstone
              </span>
            </div>
          </Link>
        </div>

        {/* Center Navigation Links (for Public/Landing) */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <Link to="/map" className="hover:text-emerald-600 transition-colors font-semibold text-emerald-700">Yield Map</Link>
            <Link to="/simulator" className="hover:text-emerald-600 transition-colors font-semibold text-teal-700">What-If Lab</Link>
            <Link to="/about" className="hover:text-emerald-600 transition-colors">Viva & Methodology</Link>
            <Link to="/dataset-insights" className="hover:text-emerald-600 transition-colors">Dataset</Link>
            <Link to="/model-performance" className="hover:text-emerald-600 transition-colors">Benchmarks</Link>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/predict"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <Sprout className="w-4 h-4 mr-1.5" />
                Predict Yield
              </Link>
              
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-300">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline-block text-sm font-semibold text-slate-800">
                    {user?.name}
                  </span>
                  {isAdmin && (
                    <span className="hidden md:inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300">
                      <Shield className="w-3 h-3 mr-0.5" /> Admin
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
