import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Home,
  Map,
  Sprout,
  SlidersHorizontal,
  History,
  LogIn
} from 'lucide-react';

const MobileBottomNav = () => {
  const { isAuthenticated } = useAuth();
  const { isHindi } = useLanguage();
  const location = useLocation();

  // Hide bottom navigation on authentication pages to avoid keyboard overlap
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const navItems = isAuthenticated
    ? [
        {
          to: '/dashboard',
          label: isHindi ? 'डैशबोर्ड' : 'Home',
          icon: LayoutDashboard,
        },
        {
          to: '/map',
          label: isHindi ? 'मानचित्र' : 'Map',
          icon: Map,
        },
        {
          to: '/predict',
          label: isHindi ? 'पूर्वानुमान' : 'Predict',
          icon: Sprout,
          isCenter: true,
        },
        {
          to: '/simulator',
          label: isHindi ? 'सिम्युलेटर' : 'What-If',
          icon: SlidersHorizontal,
        },
        {
          to: '/history',
          label: isHindi ? 'इतिहास' : 'History',
          icon: History,
        },
      ]
    : [
        {
          to: '/',
          label: isHindi ? 'होम' : 'Home',
          icon: Home,
        },
        {
          to: '/map',
          label: isHindi ? 'मानचित्र' : 'Map',
          icon: Map,
        },
        {
          to: '/predict',
          label: isHindi ? 'पूर्वानुमान' : 'Predict',
          icon: Sprout,
          isCenter: true,
        },
        {
          to: '/simulator',
          label: isHindi ? 'सिम्युलेटर' : 'What-If',
          icon: SlidersHorizontal,
        },
        {
          to: '/login',
          label: isHindi ? 'लॉगिन' : 'Sign In',
          icon: LogIn,
        },
      ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-emerald-200/90 shadow-[0_-4px_20px_rgba(6,78,59,0.08)] pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          if (item.isCenter) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative -top-4 flex flex-col items-center justify-center group focus:outline-none"
                aria-label={item.label}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white ring-4 ring-emerald-200/80 scale-105 shadow-emerald-600/35'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-105 active:scale-95 shadow-emerald-600/25'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span
                  className={`text-[10px] font-black tracking-tight mt-0.5 leading-none transition-colors ${
                    isActive ? 'text-emerald-700' : 'text-slate-600 group-hover:text-emerald-700'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center h-full py-1 px-1 transition-all group focus:outline-none ${
                isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-100/80 text-emerald-700 scale-110' : 'group-hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
              </div>
              <span
                className={`text-[10px] font-bold tracking-tight leading-none mt-0.5 truncate max-w-[56px] text-center ${
                  isActive ? 'font-black text-emerald-800' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
