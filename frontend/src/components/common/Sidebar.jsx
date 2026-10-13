import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Sprout,
  History,
  BarChart3,
  Map,
  SlidersHorizontal,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { isHindi } = useLanguage();

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* Close button on mobile */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Farmer Workspace Section */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {isHindi ? 'किसान कार्यक्षेत्र' : 'Farmer Workspace'}
            </div>
            <NavLink to="/dashboard" onClick={onClose} className={navItemClass}>
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>{isHindi ? 'डैशबोर्ड' : 'Dashboard'}</span>
            </NavLink>
            <NavLink to="/predict" onClick={onClose} className={navItemClass}>
              <Sprout className="w-4 h-4 flex-shrink-0" />
              <span>{isHindi ? 'उपज पूर्वानुमान' : 'Predict Yield'}</span>
            </NavLink>
            <NavLink to="/map" onClick={onClose} className={navItemClass}>
              <Map className="w-4 h-4 flex-shrink-0" />
              <span>{isHindi ? 'कृषि उपज मानचित्र' : 'Agri Yield Map'}</span>
            </NavLink>
            <NavLink to="/simulator" onClick={onClose} className={navItemClass}>
              <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
              <span>{isHindi ? 'व्हाट-इफ़ सिम्युलेटर' : 'What-If Simulator'}</span>
            </NavLink>
            <NavLink to="/history" onClick={onClose} className={navItemClass}>
              <History className="w-4 h-4 flex-shrink-0" />
              <span>{isHindi ? 'पूर्वानुमान इतिहास' : 'Prediction History'}</span>
            </NavLink>
            <NavLink to="/analytics" onClick={onClose} className={navItemClass}>
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span>{isHindi ? 'कृषि विश्लेषण' : 'Agri Analytics'}</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
